import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
//import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) return false;
    const token = authHeader.split(' ')[1];
    if (!token) return false;

    try {
      const tokenPayload = this.jwtService.verify(token);
      const userRoles: string[] = tokenPayload.roles || [];

      return requiredRoles.some((role) => userRoles.includes(role));
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}
