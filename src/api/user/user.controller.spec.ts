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
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ExternalGuard } from '../../shared/common/auth/external.guard';
import { InternalGuard } from '../../shared/common/auth/internal.guard';
import { RolesGuard } from '../../shared/common/auth/roles.guard';
import { MultipleAuthorizeGuard } from '../../shared/common/auth/multiple-auth.guard';

describe('UserController', () => {
  let userController: UserController;
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
      controllers: [UserController],
      providers: [UserService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    userController = moduleRef.get(UserController);
    prismaService = moduleRef.get(PrismaService);
  });

  it('should be defined', () => {
    expect(userController).toBeDefined();
  });

  describe('getUser', () => {
    it('should ensure the ExternalGuard is applied to the controller', async () => {
      const guards = Reflect.getMetadata('__guards__', userController.getUser);
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(MultipleAuthorizeGuard);
    });
    it('should return a user when valid id is passed', async () => {
      //@ts-ignore
      prismaService.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      expect(await userController.getUser(mockUser.id, mockUser)).toEqual(
        expectedResult,
      );
    });

    it('should return a user when valid id from token is passed', async () => {
      //@ts-ignore
      prismaService.user.findUniqueOrThrow.mockResolvedValue(mockUser);
      expect(await userController.getUser('@me', mockUser)).toEqual(
        expectedResult,
      );
    });

    it('should return an NotFoundException when invalid id is passed', async () => {
      const mockError = new Error();
      //@ts-ignore
      prismaService.user.findFirstOrThrow.mockRejectedValue(mockError);

      try {
        await userController.getUser('1', mockUser);
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('create', () => {
    it('should ensure the InternalGuard is applied to the controller', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        userController.getOrCreateUser,
      );
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(InternalGuard);
    });
    it('should return a user', async () => {
      //@ts-ignore
      prismaService.user.create.mockResolvedValue(mockUser);

      expect(await userController.getOrCreateUser(mockUser)).toEqual({
        ...expectedResult,
        newUser: true,
      });
    });
  });

  describe('getUsersByAddresses', () => {
    it('should ensure the InternalGuard is applied to the controller', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        userController.getUsersByAddresses,
      );
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(InternalGuard);
    });
    it('should return a userIds of addresses', async () => {
      //@ts-ignore
      prismaService.user.findMany.mockResolvedValue([mockUser]);
      expect(
        await userController.getUsersByAddresses({ addresses: ['0x0'] }),
      ).toEqual({
        userIds: ['test123'],
      });
    });
    it('should return a forbidden exception if failure', async () => {
      //@ts-ignore
      prismaService.user.findMany.mockResolvedValue([mockUser]);
      try {
        await userController.getUsersByAddresses({ addresses: ['0x1'] });
      } catch (err) {
        expect(err).toBeInstanceOf(ForbiddenException);
      }
    });
  });

  describe('get user by apiKey', () => {
    it('should ensure the InternalGuard is applied to the controller', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        userController.getUserByApiKey,
      );
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(InternalGuard);
    });
    it('should return a user by apiKey', async () => {
      prismaService.user.findFirstOrThrow.mockResolvedValue(mockUser);

      expect(await userController.getUserByApiKey('123')).toEqual(
        expectedResult,
      );
    });
    it('should return an NotFoundException when invalid id is passed', async () => {
      const mockError = new Error();
      //@ts-ignore
      prismaService.user.findFirstOrThrow.mockRejectedValue(mockError);

      try {
        await userController.getUserByApiKey('1');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('change user to partner', () => {
    it('should ensure the ExternalGuard is applied to the controller', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        userController.changeToPartner,
      );
      const guard = new guards[0]();

      expect(guard).toBeInstanceOf(ExternalGuard);
    });
    it('should ensure the RolesGuard is applied to the controller', async () => {
      const guards = Reflect.getMetadata(
        '__guards__',
        userController.changeToPartner,
      );
      const guard = new guards[1]();

      expect(guard).toBeInstanceOf(RolesGuard);
    });
    it('should return updated user with apiKey', async () => {
      // @ts-ignore
      prismaService.user.findUnique.mockResolvedValue(mockUserForChange);
      prismaService.user.update.mockResolvedValue(mockUserForChangeResult);
      expect(await userController.changeToPartner('123')).toEqual(
        mockUserForChangeResult,
      );
    });
    it('should return an NotFoundException when user with invalid userId', async () => {
      const mockError = new Error();
      //@ts-ignore
      prismaService.user.findFirstOrThrow.mockRejectedValue(mockError);

      try {
        await userController.changeToPartner('1235');
      } catch (err) {
        expect(err).toBeInstanceOf(NotFoundException);
      }
    });
  });
});
