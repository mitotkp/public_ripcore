import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class AssignRoleDto {
  @ApiProperty({ example: '1' })
  @IsNumber()
  @IsNotEmpty()
  roleId: number;
}
