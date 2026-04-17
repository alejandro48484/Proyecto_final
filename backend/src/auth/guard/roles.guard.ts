import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<RolUsuario[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesRequeridos) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return rolesRequeridos.includes(user.rol);
  }
}