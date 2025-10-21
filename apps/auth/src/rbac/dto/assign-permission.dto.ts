import { IsNumber, IsNotEmpty } from 'class-validator';

export class AssignPermissionDto {
  @IsNumber()
  @IsNotEmpty()
  permissionId: number;
}
