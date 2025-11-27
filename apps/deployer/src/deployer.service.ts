import { Injectable, OnModuleInit, Logger, InternalServerErrorException } from '@nestjs/common';
import * as Docker from 'dockerode';
import { DeployModuleDto } from './dto/deploy-module.dto';
import { resolve } from 'path';

@Injectable()
export class DeployerService implements OnModuleInit {
  private docker: Docker;
  private readonly logger = new Logger(DeployerService.name);

  constructor() {
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

      await container.start();

      const data = await container.inspect();
      const hostPort = data?.NetworkSettings?.Ports?.[portBingingKey]?.[0]?.HostPort;
      
      const deployResult = {
        status: 'running',
        containerId: container.id,
        name: deployModuleDto.moduleName,
        internalUrl: `http://localhost:${hostPort}`,
        port: hostPort
      };

      this.logger.log(`Container ${deployModuleDto.moduleName} deployed successfully`);
      return deployResult;
    
    } catch (error) {
      this.logger.error(`Error al desplegar el módulo ${deployModuleDto.moduleName}: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async pullImage(image: string): Promise<void> {
    this.logger.debug(`Descargando imagne ${image}...`);
    
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

        try {
            this.docker.modem.followProgress(stream, onFinished, onProgress);
        } catch (e) {
            reject(new Error(`Error al procesar el stream de Docker: ${e.message}`));
        }

        function onFinished(err: any) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }

        function onProgress(event: any) {
          this.logger.log(event.status);
        }
      })
    })

    
    this.logger.log(`Image ${image} pulled successfully`);
  }
}
