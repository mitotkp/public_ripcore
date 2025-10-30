// apps/gateway/src/discovery/discovery.service.ts
import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { firstValueFrom } from 'rxjs';
import { SchedulerRegistry } from '@nestjs/schedule';

interface RegisteredModule {
  prefix: string;
  baseUrl: string;
}

const CACHE_KEY = 'MODULE_ROUTES_MAP';

@Injectable()
export class DiscoveryService implements OnModuleInit {
  private readonly logger = new Logger(DiscoveryService.name);
  private authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.authServiceUrl = this.configService.get<string>('authServiceUrl')!;
  }

  async onModuleInit() {
    this.logger.log('Inicializando caché de rutas de módulos...');
    await this.refreshModuleCache();

    const interval = setInterval(
      () => this.refreshModuleCache(),
      5 * 60 * 1000,
    );
    this.schedulerRegistry.addInterval('refreshModuleCache', interval);
  }

  async refreshModuleCache(): Promise<Map<string, string>> {
    this.logger.log('Refrescando caché de módulos...');
    try {
      const response = await firstValueFrom(
        this.httpService.get<RegisteredModule[]>(
          `${this.authServiceUrl}/api/modules/enabled`,
        ),
      );

      const modules = response.data;
      const routeMap = new Map<string, string>();

      for (const mod of modules) {
        routeMap.set(mod.prefix, mod.baseUrl);
      }

      await this.cacheManager.set(CACHE_KEY, routeMap, 0);
      this.logger.log(
        `Caché de módulos refrescada. ${routeMap.size} módulos cargados.`,
      );
      return routeMap;
    } catch (error) {
      this.logger.error(
        'Error al refrescar la caché de módulos. El enrutamiento dinámico puede fallar.',
        error.message,
      );
      return new Map<string, string>();
    }
  }

  private async getModuleRoutes(): Promise<Map<string, string>> {
    let routes = await this.cacheManager.get<Map<string, string>>(CACHE_KEY);
    if (!routes || routes.size === 0) {
      this.logger.warn('Caché de módulos vacía, forzando refresco...');
      routes = await this.refreshModuleCache();
    }
    return routes;
  }

  async getBaseUrlForPrefix(prefix: string): Promise<string | null> {
    const routes = await this.getModuleRoutes();
    return routes.get(prefix) || null;
  }
}
