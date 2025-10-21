import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';
//import { User } from '../../../../auth/src/users/user.entity';
import { User } from '../users/user.entity';
import { Permission } from './entities/permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
//import { PaginationDto } from 'apps/ripcore/src/core/shared/dto/pagination.dto';
import { PaginationDto } from '../shared/dto/pagination.dto';
//import { PaginationDto } from '../shared/dto/pagination.dto';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
  ) {}

  //Busca todos los roles
  async findAllRoles(paginationDto: PaginationDto) {
    const { page = 1, limit = 50 } = paginationDto;
    const skip = (page - 1) * limit;

    const [roles, total] = await this.roleRepository.findAndCount({
      take: limit,
      skip: skip,
      relations: ['permissions'],
      order: { name: 'ASC' },
    });

    return {
      data: roles,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
  //Busca un rol por su id
  async findRoleById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado.`);
    }
    return role;
  }

  //Crear un rol
  createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    const newRole = this.roleRepository.create(createRoleDto);
    return this.roleRepository.save(newRole);
  }

  //Asignar un rol a un usuario
  async assingRoleToUser(userId: number, roleId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const role = await this.roleRepository.findOneByOrFail({ id: roleId });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    user.roles.push(role);
    return this.usersRepository.save(user);
  }

  //Remover el rol de un usuario
  async removeRoleFromUser(userId: number, roleId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['roles'],
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    user.roles = user.roles.filter((role) => role.id !== roleId);
    return this.usersRepository.save(user);
  }

  //Actualizar un rol
  async updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findRoleById(id);

    this.roleRepository.merge(role, updateRoleDto);

    return this.roleRepository.save(role);
  }

  //Remover un rol
  async removeRole(id: number): Promise<void> {
    const result = await this.roleRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado.`);
    }
  }

  //Buscar todos los permisos
  async findAllPermissions(paginationDto: PaginationDto) {
    const { page = 1, limit = 50 } = paginationDto;
    const skip = (page - 1) * limit;

    const [permissions, total] = await this.permissionsRepository.findAndCount({
      take: limit,
      skip: skip,
      order: { name: 'ASC' },
    });

    return {
      data: permissions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  //Asignar un permiso
  createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    const newPermission =
      this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(newPermission);
  }

  //Encontrar permiso por ID

  async findPermissionById(id: number): Promise<Permission> {
    const permission = await this.permissionsRepository.findOneBy({ id });
    if (!permission) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado.`);
    }
    return permission;
  }

  // Actualizar un permiso

  async updatePermission(
    id: number,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<Permission> {
    const permission = await this.findPermissionById(id);
    this.permissionsRepository.merge(permission, updatePermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async removePermission(id: number): Promise<void> {
    const result = await this.permissionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado.`);
    }
  }

  //Asignar un permiso
  async assignPermissionToRole(
    roleId: number,
    permissionId: number,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) {
      throw new NotFoundException('Rol no encontrado');
    }

    const permission = await this.permissionsRepository.findOneBy({
      // Corregido: permissionsRepository
      id: permissionId,
    });
    if (!permission) {
      throw new NotFoundException('Permiso no encontrado');
    }

    role.permissions.push(permission);
    return this.roleRepository.save(role);
  }

  //Remover un permiso de un rol
  async removePermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException('Rol no encontrado');

    role.permissions = role.permissions.filter(
      (perm) => perm.id !== permissionId,
    );
    return this.roleRepository.save(role);
  }
}
