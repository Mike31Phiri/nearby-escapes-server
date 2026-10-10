import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import {
  SECURITY_LEVEL_KEY,
  SecurityLevelType,
} from '../decorators/security-level.decorator';

@Injectable()
export class SecurityLevelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredLevel = this.reflector.getAllAndOverride<SecurityLevelType>(
      SECURITY_LEVEL_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no security level is annotated, allow execution (preserves normal guard behavior)
    if (!requiredLevel) {
      return true;
    }

    // Level 4: PUBLIC - open to everyone
    if (requiredLevel === 'PUBLIC') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required to access this resource');
    }

    const userRole = user.role as Role;

    // Level 3: INTERNAL - accessible to all authenticated roles (GUEST, HOST, ADMIN, SUPER_ADMIN)
    if (requiredLevel === 'INTERNAL') {
      return true;
    }

    // Level 2: CONFIDENTIAL - accessible to ADMIN and SUPER_ADMIN
    if (requiredLevel === 'CONFIDENTIAL') {
      if (userRole === Role.ADMIN || userRole === Role.SUPER_ADMIN) {
        return true;
      }
      throw new ForbiddenException(
        'Access denied: Confidential resource requires Admin or Super Admin privileges',
      );
    }

    // Level 1: RESTRICTED - accessible to SUPER_ADMIN only
    if (requiredLevel === 'RESTRICTED') {
      if (userRole === Role.SUPER_ADMIN) {
        return true;
      }
      throw new ForbiddenException(
        'Access denied: Restricted resource requires Super Admin privileges',
      );
    }

    return true;
  }
}
