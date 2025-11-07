import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  prefix: string;

  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @IsString()
  @IsOptional()
  frontendUrl?: string;

  @IsNumber()
  @IsOptional()
  isEnabled?: number;

  @IsString()
  @IsOptional()
  version?: string;
}
