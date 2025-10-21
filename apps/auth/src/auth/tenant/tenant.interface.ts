export interface Tenant {
  name: string;
  type: 'mssql';
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  options?: any;
}
