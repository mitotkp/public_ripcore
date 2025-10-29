import { readFileSync } from 'fs';
import { join } from 'path';

export interface AppConfig {
  coreDatabase: any;
  tenants: any[];
  jwt: { secret: string };
  mail: any;
  authServiceUrl: string;
  ripcoreServiceUrl: string;
}

export const configuration = (): AppConfig => {
  const configPath = join(process.cwd(), 'config.json');
  try {
    const config = readFileSync(configPath, 'utf8');

    const configData = JSON.parse(config);
    configData.authServiceUrl =
      configData.authServiceUrl || 'http://localhost:3001';
    configData.ripcoreServiceUrl =
      configData.ripcoreServiceUrl || 'http://localhost:7575';

    return JSON.parse(config) as AppConfig;
  } catch (error) {
    console.log(error);
    throw new Error(`Error al leer el archivo de configuración: ${configPath}`);
  }
};
