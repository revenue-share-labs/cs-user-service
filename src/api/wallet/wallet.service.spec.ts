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
import { WalletService } from './wallet.service';
import { ForbiddenException } from '@nestjs/common';

describe('WalletService', () => {
  let walletService: WalletService;
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
  const mockUserWithTenWallets: User = {
    id: 'test123',
    email: 'test@gmail.com',
    username: 'username',
    createdBy: UserCreationStrategy.EMAIL,
    firstName: 'Name',
    lastName: 'Test',
    createdAt: newDate,
    updatedAt: newDate,
    wallets: [
      {
        address: '0x0',
        provider: WalletProvider.META_MASK,
      },
      {
        address: '0x0',
        provider: WalletProvider.META_MASK,
      },
      {
        address: '0x0',
        provider: WalletProvider.META_MASK,
      },
      {
        address: '0x0',
        provider: WalletProvider.META_MASK,
      },
      {
        address: '0x0',
        provider: WalletProvider.META_MASK,
      },
      {
        address: '0x0',
        provider: WalletProvider.META_MASK,
      },
      {
        address: '0x0',
        provider: WalletProvider.META_MASK,
      },
      {
        address: '0x0',
        provider: WalletProvider.META_MASK,
      },
      {
        address: '0x0',
        provider: WalletProvider.META_MASK,
      },
      {
        address: '0x0',
        provider: WalletProvider.META_MASK,
      },
    ],
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
      controllers: [WalletService],
      providers: [WalletService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    walletService = moduleRef.get(WalletService);
    prismaService = moduleRef.get(PrismaService);
  });

  it('should be defined', () => {
    expect(walletService).toBeDefined();
  });

  describe('add wallet', () => {
    it('should return a user with added wallet', async () => {
      //@ts-ignore
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUser);

      expect(
        await walletService.addWalletToUser(mockUser.id, {
          wallet: '0x0',
          provider: WalletProvider.META_MASK,
        }),
      ).toEqual(expectedResult);
    });
    it('should return a ForbiddenException', async () => {
      //@ts-ignore
      prismaService.user.findUnique.mockResolvedValue(mockUserWithTenWallets);
      try {
        await walletService.addWalletToUser(mockUser.id, {
          wallet: '0x01',
          provider: WalletProvider.META_MASK,
        });
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('remove wallet', () => {
    it('should return a user with remove wallet', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.user.update.mockResolvedValue(mockUserWithoutWallet);

      expect(
        await walletService.removeWalletFromUser(mockUser.id, '0x0'),
      ).toEqual(mockUserWithoutWallet);
    });
    it('should return a ForbiddenException', async () => {
      prismaService.user.findUnique.mockRejectedValue('Not found');
      try {
        await walletService.removeWalletFromUser(mockUser.id, '0x0');
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });
});
