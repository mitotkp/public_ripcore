import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

//Se define una interfaz para el usuario que viene en el request
interface UserWithRoles {
  roles: { name: string }[];
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtenemos los roles requeridos para la ruta desde la metadata
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // Si no se especifican roles, se permite el acceso
    }

    // Obtenemos el usuario y sus roles desde el objeto request (que fue añadido por el JwtAuthGuard)
    const { user } = context
      .switchToHttp()
      .getRequest<{ user: UserWithRoles }>();

    if (!user || !user.roles) {
      return false;
    }

    // Comprobamos si el usuario tiene al menos uno de los roles requeridos
    return requiredRoles.some((role) =>
      user.roles?.some((userRole) => userRole.name === role),
    );
  }
}
