import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../../entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // Check if user is authenticated
    if (!user) {
      throw new UnauthorizedException(
        'Authentication required. Please provide a valid access token.'
      );
    }

    // Check if user has required role
    const hasRequiredRole = requiredRoles.some(role => user.role === role);

    if (!hasRequiredRole) {
      const roleNames = requiredRoles.map(role => role.toUpperCase()).join(' or ');
      const userRole = user.role ? user.role.toUpperCase() : 'NONE';
      throw new ForbiddenException(
        `Access denied. This endpoint requires ${roleNames} role. Your current role is ${userRole}. Only administrators can ${this.getActionDescription(context)}.`
      );
    }

    return true;
  }

  private getActionDescription(context: ExecutionContext): string {
    const handler = context.getHandler().name;
    const path = context.switchToHttp().getRequest().url;

    if (path.includes('verification-requests') && path.includes('review')) {
      return 'review and approve/reject verification requests';
    }
    if (path.includes('verification-requests')) {
      return 'view verification requests';
    }
    if (path.includes('users')) {
      return 'manage users';
    }
    if (path.includes('homes')) {
      return 'view all homes';
    }
    if (path.includes('statistics')) {
      return 'view statistics';
    }

    return 'access this resource';
  }
}
