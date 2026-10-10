import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { SecurityLevelGuard } from './security-level.guard';
import { SecurityLevelType } from '../decorators/security-level.decorator';

describe('SecurityLevelGuard', () => {
  let guard: SecurityLevelGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new SecurityLevelGuard(reflector);
  });

  const createMockContext = (user?: any): ExecutionContext => {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow unauthenticated access when level is PUBLIC', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('PUBLIC' as SecurityLevelType);
    const context = createMockContext(null);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException when no user is present on INTERNAL resource', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('INTERNAL' as SecurityLevelType);
    const context = createMockContext(null);

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should allow GUEST and HOST on INTERNAL resource', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('INTERNAL' as SecurityLevelType);
    const guestCtx = createMockContext({ role: Role.GUEST });
    const hostCtx = createMockContext({ role: Role.HOST });

    expect(guard.canActivate(guestCtx)).toBe(true);
    expect(guard.canActivate(hostCtx)).toBe(true);
  });

  it('should allow ADMIN and SUPER_ADMIN on CONFIDENTIAL resource, and reject GUEST / HOST', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('CONFIDENTIAL' as SecurityLevelType);

    const adminCtx = createMockContext({ role: Role.ADMIN });
    const superAdminCtx = createMockContext({ role: Role.SUPER_ADMIN });
    const guestCtx = createMockContext({ role: Role.GUEST });
    const hostCtx = createMockContext({ role: Role.HOST });

    expect(guard.canActivate(adminCtx)).toBe(true);
    expect(guard.canActivate(superAdminCtx)).toBe(true);
    expect(() => guard.canActivate(guestCtx)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(hostCtx)).toThrow(ForbiddenException);
  });

  it('should allow only SUPER_ADMIN on RESTRICTED resource, and reject ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue('RESTRICTED' as SecurityLevelType);

    const superAdminCtx = createMockContext({ role: Role.SUPER_ADMIN });
    const adminCtx = createMockContext({ role: Role.ADMIN });
    const guestCtx = createMockContext({ role: Role.GUEST });

    expect(guard.canActivate(superAdminCtx)).toBe(true);
    expect(() => guard.canActivate(adminCtx)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(guestCtx)).toThrow(ForbiddenException);
  });
});
