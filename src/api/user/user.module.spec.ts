import { Test } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from '../../shared/services/prisma/prisma.module';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { UserModule } from './user.module';

describe('UserModule', () => {
  it('should compile the module', async () => {
    const userModule: UserModule = await Test.createTestingModule({
      imports: [UserModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    expect(userModule).toBeDefined();
  });
});
