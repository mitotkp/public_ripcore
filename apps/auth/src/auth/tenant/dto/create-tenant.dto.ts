import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  server: string;

  @IsString()
  @IsIn(['mssql'])
  type: 'mssql';

  @IsNumber()
  @IsNotEmpty()
  port: number;

  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  database: string;

  @IsObject()
  @IsOptional()
  options?: any;
}
