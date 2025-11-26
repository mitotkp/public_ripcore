import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateModuleDto {
  @ApiProperty({ example: 'Facturacion' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'facturacion' })
  @IsNotEmpty()
  prefix: string;

  @ApiProperty({ example: 'http://localhost:3000' })
  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @ApiProperty({ example: 'http://localhost:3000' })
  @IsString()
  @IsOptional()
  frontendUrl?: string;

  @ApiProperty({ example: '1' })
  @IsNumber()
  @IsOptional()
  isEnabled?: number;

  @ApiProperty({ example: '1.0.0' })
  @IsString()
  @IsOptional()
  version?: string;
}
