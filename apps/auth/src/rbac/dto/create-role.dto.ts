import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateRoleDto {
  @ApiProperty({ example: 'Role Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Role Description' })
  @IsString()
  description?: string;
}
