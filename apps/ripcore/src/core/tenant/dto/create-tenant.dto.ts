import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateTenantDto {
  @ApiProperty({ example: 'Tenant Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Tenant Server' })
  @IsString()
  @IsNotEmpty()
  server: string;

  @ApiProperty({ example: 'mssql' })
  @IsString()
  @IsIn(['mssql'])
  type: 'mssql';

  @ApiProperty({ example: 'Tenant Port' })
  @IsNumber()
  @IsNotEmpty()
  port: number;

  @ApiProperty({ example: 'Tenant User' })
  @IsString()
  @IsNotEmpty()
  user: string;

  @ApiProperty({ example: 'Tenant Password' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Tenant Database' })
  @IsString()
  @IsNotEmpty()
  database: string;

  @ApiProperty({ example: 'Tenant Options' })
  @IsObject()
  @IsOptional()
  options?: any;
}
