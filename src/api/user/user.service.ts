import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserCreationStrategy, UserRole, WalletProvider } from '@prisma/client';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { ApiErrorDto, NewUserDto, UserDto } from '../generic/dto';
import { CreateUserDto } from './dto';
import { GetUsersByAddressesResponseDto } from './dto/get-users-by-addresses-response.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async getOrCreateUser({
    email,
    address,
    provider,
  }: CreateUserDto): Promise<NewUserDto> {
    if (email) {
      this.logger.debug(`Get user with email: ${email}`);
      const currentUser = await this.prismaService.user.findFirst({
        where: {
          email,
        },
      });
      if (currentUser) {
        return currentUser;
      } else {
        this.logger.debug(`Create user with email: ${email}`);
        const newUser = await this.createUser(email, null, null);
        return {
          ...newUser,
          newUser: true,
        };
      }
    }
    if (address) {
      this.logger.debug(`Get user with address: ${address}`);
      const currentUser = await this.prismaService.user.findFirst({
        where: {
          wallets: {
            some: { address },
          },
          createdBy: UserCreationStrategy.ADDRESS,
        },
      });
      if (currentUser) {
        return currentUser;
      } else {
        this.logger.debug(`Create user with address: ${address}`);
        const newUser = await this.createUser(null, address, provider);
        return {
          ...newUser,
          newUser: true,
        };
      }
    }
  }

  async getUser(id: string): Promise<UserDto> {
    this.logger.debug(`Get user with id: ${id}`);
    try {
      return await this.prismaService.user.findUniqueOrThrow({
        where: {
          id,
        },
      });
    } catch (err) {
      this.logger.debug(`Get user error: ${err.message}`);
      const apiErrorDto: ApiErrorDto = {
        message: 'Get user failed.',
      };
      throw new NotFoundException(apiErrorDto);
    }
  }

  async getUsersByAddresses(
    addresses: string[],
  ): Promise<GetUsersByAddressesResponseDto> {
    try {
      const users = await this.prismaService.user.findMany({
        where: {
          wallets: {
            some: {
              address: {
                in: addresses,
              },
            },
          },
        },
      });
      const userIds = users
        .map((user) => user.id)
        .filter((value, index, array) => {
          return array.indexOf(value) === index;
        });
      return {
        userIds,
      };
    } catch (err) {
      throw new ForbiddenException('Get users error');
    }
  }

  async getUserByApiKey(apiKey: string): Promise<UserDto> {
    this.logger.debug(`Get user with apiKey: ${apiKey}`);
    try {
      return await this.prismaService.user.findFirstOrThrow({
        where: {
          apiKey: apiKey,
        },
      });
    } catch (err) {
      this.logger.debug(`Get user error: ${err.message}`);
      const apiErrorDto: ApiErrorDto = {
        message: 'Get user failed.',
      };
      throw new NotFoundException(apiErrorDto);
    }
  }

  async changeUserToPartner(userId: string): Promise<UserDto> {
    const userById = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!userById) {
      const apiErrorDto: ApiErrorDto = {
        message: 'User not found.',
      };
      throw new NotFoundException(apiErrorDto);
    }
    const apiKey = this.generateApiKey();
    const userByApiKey = await this.prismaService.user.findFirst({
      where: { apiKey: apiKey },
    });
    if (userByApiKey) {
      throw new Error('apiKey is already used');
    }
    const roles = [...new Set([...userById.roles, UserRole.PARTNER])];
    return await this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        apiKey: apiKey,
        roles: roles,
      },
    });
  }

  private async createUser(
    email: string,
    address: string,
    provider: WalletProvider,
  ) {
    this.logger.debug(
      `Create user with ${email ? `email:${email}` : `address: ${address}`}`,
    );
    try {
      const user = await this.prismaService.user.findFirst({
        where: { email: email },
      });
      if (user) {
        throw new Error('Email is already used');
      }
      const formatData = email
        ? {
            email,
            createdBy: UserCreationStrategy.EMAIL,
            roles: [UserRole.CUSTOMER],
          }
        : {
            wallets: [{ address, provider }],
            activeWallet: { address, provider },
            createdBy: UserCreationStrategy.ADDRESS,
            roles: [UserRole.CUSTOMER],
          };
      return await this.prismaService.user.create({
        data: formatData,
      });
    } catch (err) {
      this.logger.debug(`Create user error: ${err.message}`);
      const apiErrorDto: ApiErrorDto = {
        message: 'Create user failed',
      };
      throw new ForbiddenException(apiErrorDto);
    }
  }

  private generateApiKey(): string {
    return [...Array(32)]
      .map(() => ((Math.random() * 36) | 0).toString(36))
      .join('');
  }
}
