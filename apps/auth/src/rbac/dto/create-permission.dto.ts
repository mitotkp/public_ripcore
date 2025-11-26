import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreatePermissionDto {
  @ApiProperty({ example: 'Permission Name' })
  @IsString() 
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Permission Description' })
  @IsString()
  description?: string;
}
