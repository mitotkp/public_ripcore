import { readFileSync } from 'fs';
import { join } from 'path';

export interface AppConfig {
  coreDatabase: any;
  tenants: any[];
  jwt: { secret: string };
  mail: any;
}

export const configuration = (): AppConfig => {
  const configPath = join(process.cwd(), 'config.json');
  try {
    const config = readFileSync(configPath, 'utf8');
    return JSON.parse(config) as AppConfig;
  } catch (error) {
    console.log(error);
    throw new Error(`Error al leer el archivo de configuración: ${configPath}`);
  }
};
