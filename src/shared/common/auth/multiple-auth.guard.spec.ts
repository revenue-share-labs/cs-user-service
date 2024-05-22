import { ModuleRef, Reflector } from '@nestjs/core';
import { MultipleAuthorizeGuard } from './multiple-auth.guard';

describe('MultipleAuthGuard', () => {
  let guard: MultipleAuthorizeGuard;
  let reflector: Reflector;
  let moduleRef: ModuleRef;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new MultipleAuthorizeGuard(reflector, moduleRef);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });
  //TODO: make test for guard
});
