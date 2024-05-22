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
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
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

  const mockUserForChange: User = {
    id: '123',
    email: 'test@gmail.com',
    username: 'username',
    createdBy: UserCreationStrategy.EMAIL,
    firstName: 'Name',
    lastName: 'Test',
    createdAt: newDate,
    updatedAt: newDate,
    wallets: [{ address: '0x0', provider: WalletProvider.META_MASK }],
    activeWallet: { address: '0x0', provider: WalletProvider.META_MASK },
    apiKey: '',
    roles: [UserRole.CUSTOMER],
  };

  const mockUserForChangeResult: User = {
    id: '123',
    email: 'test@gmail.com',
    username: 'username',
    createdBy: UserCreationStrategy.EMAIL,
    firstName: 'Name',
    lastName: 'Test',
    createdAt: newDate,
    updatedAt: newDate,
    wallets: [{ address: '0x0', provider: WalletProvider.META_MASK }],
    activeWallet: { address: '0x0', provider: WalletProvider.META_MASK },
    apiKey: '123415',
    roles: [UserRole.CUSTOMER],
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [UserService],
      providers: [UserService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    userService = moduleRef.get(UserService);
    prismaService = moduleRef.get(PrismaService);
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('getUser', () => {
    it('should return a user when valid id is passed', async () => {
      //@ts-ignore
      prismaService.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      expect(await userService.getUser(mockUser.id)).toEqual(expectedResult);
    });

    it('should return an NotFoundException when invalid id is passed', async () => {
      const mockError = new Error();
      //@ts-ignore
      prismaService.user.findFirstOrThrow.mockRejectedValue(mockError);
      try {
        await userService.getUser('1');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('getOrCreateUser', () => {
    it('should return new user by email', async () => {
      //@ts-ignore
      prismaService.user.create.mockResolvedValue(mockUser);

      expect(
        await userService.getOrCreateUser({ email: mockUser.email }),
      ).toEqual({
        ...expectedResult,
        newUser: true,
      });
    });
    it('should return exist user by email', async () => {
      //@ts-ignore
      prismaService.user.findFirst.mockResolvedValue(mockUser);

      expect(
        await userService.getOrCreateUser({ email: mockUser.email }),
      ).toEqual(expectedResult);
    });
    it('should return new user by address', async () => {
      //@ts-ignore
      prismaService.user.create.mockResolvedValue(mockUser);

      expect(
        await userService.getOrCreateUser({
          address: mockUser.activeWallet.address,
          provider: mockUser.activeWallet.provider,
        }),
      ).toEqual({
        ...expectedResult,
        newUser: true,
      });
    });
    it('should return exist user by address', async () => {
      //@ts-ignore
      prismaService.user.findFirst.mockResolvedValue(mockUser);

      expect(
        await userService.getOrCreateUser({
          address: mockUser.activeWallet.address,
          provider: mockUser.activeWallet.provider,
        }),
      ).toEqual(expectedResult);
    });
  });

  describe('getUsersByAddresses', () => {
    it('should return a userIds of addresses', async () => {
      //@ts-ignore
      prismaService.user.findMany.mockResolvedValue([mockUser]);
      expect(await userService.getUsersByAddresses(['0x0'])).toEqual({
        userIds: ['test123'],
      });
    });
    it('should return a forbidden exception if failure', async () => {
      //@ts-ignore
      prismaService.user.findMany.mockResolvedValue([mockUser]);
      try {
        await userService.getUsersByAddresses(['0x1']);
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('get user by apiKey', () => {
    it('should return a user by apiKey', async () => {
      prismaService.user.findFirstOrThrow.mockResolvedValue(mockUser);

      expect(await userService.getUserByApiKey('123')).toEqual(expectedResult);
    });
    it('should return an NotFoundException when invalid id is passed', async () => {
      const mockError = new Error();
      //@ts-ignore
      prismaService.user.findFirstOrThrow.mockRejectedValue(mockError);

      try {
        await userService.getUserByApiKey('1');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('change user to partner', () => {
    it('should return updated user with apiKey', async () => {
      // @ts-ignore
      prismaService.user.findUnique.mockResolvedValue(mockUserForChange);
      prismaService.user.update.mockResolvedValue(mockUserForChangeResult);
      expect(await userService.changeUserToPartner('123')).toEqual(
        mockUserForChangeResult,
      );
    });
    it('should return an NotFoundException when user with invalid userId', async () => {
      const mockError = new Error();
      //@ts-ignore
      prismaService.user.findFirstOrThrow.mockRejectedValue(mockError);

      try {
        await userService.changeUserToPartner('1235');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
