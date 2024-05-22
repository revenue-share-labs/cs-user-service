/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Test } from '@nestjs/testing';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import {
  PrismaClient,
  User,
  UserCreationStrategy,
  UserRole,
  WalletProvider,
} from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { ExternalGuard } from '../../shared/common/auth/external.guard';

describe('WalletController', () => {
  let walletController: WalletController;
  let prismaService: DeepMockProxy<PrismaClient>;

  const newDate = new Date();
  const mockUser: User = {
    id: 'test123',
    email: 'test@gmail.com',
    username: 'username',
    createdBy: UserCreationStrategy.EMAIL,
    firstName: 'Name',
    lastName: 'Test',
    createdAt: newDate,
    updatedAt: newDate,
    wallets: [{ address: '0x0', provider: WalletProvider.META_MASK }],
    activeWallet: { address: '0x0', provider: WalletProvider.META_MASK },
    apiKey: '123',
    roles: [UserRole.CUSTOMER],
  };

  const expectedResult: User = {
    id: 'test123',
    email: 'test@gmail.com',
    username: 'username',
    createdBy: UserCreationStrategy.EMAIL,
    firstName: 'Name',
    lastName: 'Test',
    createdAt: newDate,
    updatedAt: newDate,
    wallets: [{ address: '0x0', provider: WalletProvider.META_MASK }],
    activeWallet: { address: '0x0', provider: WalletProvider.META_MASK },
    apiKey: '123',
    roles: [UserRole.CUSTOMER],
  };

  const mockUserWithoutWallet: User = {
    id: 'test123',
    email: 'test@gmail.com',
    username: 'username',
    createdBy: UserCreationStrategy.EMAIL,
    firstName: 'Name',
    lastName: 'Test',
    createdAt: newDate,
    updatedAt: newDate,
    wallets: [{ address: '0x0', provider: WalletProvider.META_MASK }],
    activeWallet: null,
    apiKey: '',
    roles: [UserRole.CUSTOMER],
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [WalletService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    walletController = moduleRef.get(WalletController);
    prismaService = moduleRef.get(PrismaService);
  });

  it('should be defined', () => {
    expect(walletController).toBeDefined();
  });

  describe('add wallet', () => {
    it('should ensure the ExternalGuard is applied to the controller', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        walletController.addWalletToUser,
      );
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(ExternalGuard);
    });
    it('should return a user with added wallet', async () => {
      //@ts-ignore
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);

      expect(
        await walletController.addWalletToUser(
          { wallet: '0x0', provider: WalletProvider.META_MASK },
          mockUser,
        ),
      ).toEqual(expectedResult);
    });
  });

  describe('remove wallet', () => {
    it('should ensure the ExternalGuard is applied to the controller', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        walletController.removeWalletFromUser,
      );
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(ExternalGuard);
    });
    it('should return a user with remove wallet', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUserWithoutWallet);

      expect(
        await walletController.removeWalletFromUser('0x0', mockUser),
      ).toEqual(mockUserWithoutWallet);
    });
  });
});
