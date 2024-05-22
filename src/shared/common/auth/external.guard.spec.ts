import { ExecutionContext } from '@nestjs/common';
import { mockDeep } from 'jest-mock-extended';
import { ExternalGuard } from './external.guard';
import { Reflector } from '@nestjs/core';

describe('ExternalGuard', () => {
  let guard: ExternalGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new ExternalGuard(reflector);
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
