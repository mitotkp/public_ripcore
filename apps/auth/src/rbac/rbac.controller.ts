import {
  Controller,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Get,
  UseGuards,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../shared/dto/pagination.dto';
//import { PaginationDto } from '../shared/dto/pagination.dto';
//import { PaginationDto } from 'apps/ripcore/src/core/shared/dto/pagination.dto';
//import { PaginationDto } from '../shared/dto/pagination.dto';

@Controller('rbac')
@UseGuards(JwtAuthGuard)
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('roles')
  findAllRoles(@Query() paginationDto: PaginationDto) {
    return this.rbacService.findAllRoles(paginationDto);
  }

  @Get('roles/:id')
  findRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.findRoleById(id);
  }

  @Patch('roles/:id')
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rbacService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  removeRole(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.removeRole(id);
  }

  @Post('roles')
  creteRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(createRoleDto);
  }

  @Post('users/:userId/roles')
  assingRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() assingRoleDto: AssignRoleDto,
  ) {
    return this.rbacService.assingRoleToUser(userId, assingRoleDto.roleId);
  }

  @Delete('users/:userId/roles/:roleId')
  removeRoleFromUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.rbacService.removeRoleFromUser(userId, roleId);
  }

  //Manejo de permisos
  @Get('permissions')
  findAllPermissions(@Query() paginationDto: PaginationDto) {
    return this.rbacService.findAllPermissions(paginationDto);
  }

  @Post('permissions')
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rbacService.createPermission(createPermissionDto);
  }

  @Get('permissions/:id')
  findPermissionById(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.findPermissionById(id);
  }

  @Post('roles/:roleId/permissions')
  assignPermission(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() assignPermissionDto: AssignPermissionDto,
  ) {
    return this.rbacService.assignPermissionToRole(
      roleId,
      assignPermissionDto.permissionId,
    );
  }

  @Patch('permissions/:id')
  updatePermission(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.rbacService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  removePermission(@Param('id', ParseIntPipe) id: number) {
    return this.rbacService.removePermission(id);
  }

  @Delete('roles/:roleId/permissions/:permissionId')
  removePermissionFromRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.rbacService.removePermissionFromRole(roleId, permissionId);
  }
}
