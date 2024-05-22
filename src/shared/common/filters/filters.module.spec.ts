import { Test } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { ExceptionFiltersModule } from './filters.module';
import { PrismaModule } from '../../services/prisma/prisma.module';
import { PrismaService } from '../../services/prisma/prisma.service';

describe('FiltersModule', () => {
  it('should compile the module', async () => {
    const exceptionFiltersModule: ExceptionFiltersModule =
      await Test.createTestingModule({
        imports: [ExceptionFiltersModule, PrismaModule],
      })
        .overrideProvider(PrismaService)
        .useValue(mockDeep<PrismaClient>())
        .compile();

    expect(exceptionFiltersModule).toBeDefined();
  });
});
