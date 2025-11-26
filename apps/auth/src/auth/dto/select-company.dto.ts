import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SelectCompanyDto {
  @ApiProperty({ example: 'EMPRESA_DEMO' })
  @IsString()
  @IsNotEmpty()
  dbName: string;
}
