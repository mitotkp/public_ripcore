import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

// 1. Define interfaces para la estructura de datos que esperas
interface PermissionPayload {
  name: string;
}

interface RolePayload {
  permissions?: PermissionPayload[];
}

interface UserPayload {
  roles?: RolePayload[];
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    // 2. Extrae el usuario y asígnale el tipo correcto
    const { user }: { user: UserPayload } = context.switchToHttp().getRequest();

    // 3. Añade una comprobación de seguridad
    if (!user?.roles) {
      return false;
    }

    // 4. Usa los tipos en los callbacks para que todo sea seguro
    return user.roles.some((role: RolePayload) =>
      role.permissions?.some((permission: PermissionPayload) =>
        requiredPermissions.includes(permission.name),
      ),
    );
  }
}
