import { ExecutionContext } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';
import { Reflector } from '@nestjs/core';
import { InternalGuard } from './internal.guard';

describe('InternalGuard', () => {
  let guard: InternalGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new InternalGuard(reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
  it('should return true with auth', () => {
    reflector.getAllAndOverride = jest.fn().mockReturnValue(true);
    const context = mockDeep<ExecutionContext>();
    const canActivate = guard.canActivate(context);
    expect(canActivate).toBe(true);
  });
});
