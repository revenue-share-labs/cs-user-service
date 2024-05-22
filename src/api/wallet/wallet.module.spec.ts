import { Test } from '@nestjs/testing';
import { mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from '../../shared/services/prisma/prisma.module';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { WalletModule } from './wallet.module';

describe('WalletModule', () => {
  it('should compile the module', async () => {
    const walletModule: WalletModule = await Test.createTestingModule({
      imports: [WalletModule, PrismaModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    expect(walletModule).toBeDefined();
  });
});
