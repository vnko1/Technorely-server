import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { Role, IRequest } from "src/types";
import { ROLES_KEY } from "src/common/decorators";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user }: IRequest = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      return false;
    }

    const userRole = user.role as Role;

    if (Array.isArray(userRole)) {
      return requiredRoles.some((role) => userRole.includes(role));
    }

    if (typeof userRole === "string") {
      return requiredRoles.includes(userRole);
    }

    return false;
  }
}
