import { Injectable, OnModuleInit, Logger, InternalServerErrorException } from '@nestjs/common';
import * as Docker from 'dockerode';
import { DeployModuleDto } from './dto/deploy-module.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { version } from 'os';
@Injectable()
export class DeployerService implements OnModuleInit {
  private docker: Docker;
  private readonly logger = new Logger(DeployerService.name);
  
  private readonly authServiceUrl = 'http://localhost:3001/api';

  constructor(private readonly httpService: HttpService) {
    //const isWindows = process.platform === 'win32';
    const dockerOptions = { host: 'localhost', port: 2375 }
    this.docker = new Docker(dockerOptions);
  }

  async onModuleInit() {
    try{
      const info = await this.docker.info();
      this.logger.log(`Conectado a Docker: ${info.Name} (Versión: ${info.ServerVersion})`); 
    }catch (error) {
      this.logger.error(`Error al conectar a Docker: ${error.message}`);
    }

    this.logger.log('DeployerService initialized');
  }

  async listContainers() {
   return this.docker.listContainers();
  }

  async deployModule(deployModuleDto: DeployModuleDto) {
    this.logger.log(`Iniciando despliegue de módulo: ${deployModuleDto.moduleName} (${deployModuleDto.image})`);
    
    const containerPort = deployModuleDto.containerPort || 4000;
    const portBingingKey = `${containerPort}/tcp`;
    
    let containerId: string | null = null;
    
    try {
      await this.pullImage(deployModuleDto.image);
      
      const envs = deployModuleDto.envVariables ? Object.entries(deployModuleDto.envVariables).map(([key, value]) => `${key}=${value}`) : undefined;

      const container = await this.docker.createContainer({
        name: `ripcore-mod-${deployModuleDto.moduleName}-${Date.now()}`,
        Image: deployModuleDto.image,
        Env: envs,
        HostConfig: {
          PortBindings: {
            [portBingingKey]: [{ HostPort: '0' }],
          },
        },
        ExposedPorts: {
          [portBingingKey]: {},
        },
      });

      containerId = container.id;

      await container.start();

      const data = await container.inspect();
      const hostPort = data?.NetworkSettings?.Ports?.[portBingingKey]?.[0]?.HostPort;
      
      if(!hostPort){
        throw new Error('No se pudo obtener el puerto del contenedor');
      }

      const internalUrl = `http://localhost:${hostPort}`;
      this.logger.log(`Contenedor iniciado en: ${internalUrl}. Esperando comprobación...  `);

      await this.waitForHealth(internalUrl); 

      await this.reisterModuleInAuthService({
        name: deployModuleDto.moduleName,
        prefix: deployModuleDto.moduleName,
        baseUrl: internalUrl,
        isEnabled: 1,
        version: '1.0.0',
      });
      
      const deployResult = {
        status: 'running',
        containerId: container.id,
        name: deployModuleDto.moduleName,
        internalUrl: `http://localhost:${hostPort}`,
        port: hostPort
      };

      this.logger.log(`Contenedor desplegado en ${deployModuleDto.moduleName}  y verificado correctamente`);
      return deployResult;
    
    } catch (error) {
      this.logger.error(`Error al desplegar el módulo ${deployModuleDto.moduleName}: ${error.message}`);
      
      if(containerId) {
        this.logger.warn(`Eliminando contenedor fallido (${containerId})....`);
        try{
          const container = this.docker.getContainer(containerId);
          await container.remove({force: true});
        } catch (error){
          this.logger.error(`Error al eliminar contenedor fallido (${containerId}): ${error.message}`);
        }
      }
      throw new InternalServerErrorException(error.message);
    }
  }
  
  private async waitForHealth(url: string, maxRetries = 15): Promise<void> {
    
    for(let i = 1; i <= maxRetries; i++){
      try {
        await firstValueFrom(this.httpService.get(`${url}/`, { timeout: 2000 }));
        this.logger.log(`Check OK en intento ${i} de ${maxRetries}`);
        return;
      } catch (error) {
        this.logger.log(`Check fallido en intento ${i} de ${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    //this.logger.log(`Contenedor no listo en ${url}. Intento ${maxRetries} de ${maxRetries}`);
    throw new Error(`El contenedor no respondió al check después de varias intentos`);
  }

  private async reisterModuleInAuthService(moduleData: any): Promise<void> {
    this.logger.log(`Registrando módulo ${moduleData.name} en AuthService`);
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.authServiceUrl}/modules`, moduleData)
      );
      this.logger.log(`Módulo ${moduleData.name} registrado en AuthService`);
    } catch (error) {
      this.logger.error(`Error al registrar módulo ${moduleData.name} en AuthService: ${error.message}`);
    }
  }

  private async pullImage(image: string): Promise<void> {
    this.logger.debug(`Descargando imagen ${image}...`);
    
    return new Promise((resolve, reject) => {
      this.docker.pull(image, {}, (err, stream) => {
        
        if (err) {
          this.logger.error(`Error al iniciar descarga de ${image}`, err);
          reject(err);
        }

        if (!stream) {
          const error = new Error(`Docker no devolvió un stream para ${image}. ¿La imagen existe y es pública?`);
          this.logger.error(error.message);
          return reject(error);
        }

        const onFinished = (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }

        const onProgress = (event: any) => {
          if (event.status) {
            this.logger.debug(event.status); 
          }
        }

        try {
            this.docker.modem.followProgress(stream, onFinished, onProgress);
        } catch (e) {
            reject(new Error(`Error al procesar el stream de Docker: ${e.message}`));
        }
      })
    })
  }
}
