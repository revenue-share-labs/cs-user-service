import { UserWallet } from '@prisma/client';
import { PrismaService } from '../../shared/services/prisma/prisma.service';
import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { UserDto, ApiErrorDto } from '../generic/dto';
import { ChangeWalletOfUserDto } from './dto';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async addWalletToUser(
    id: string,
    { wallet, provider }: ChangeWalletOfUserDto,
  ): Promise<UserDto> {
    this.logger.debug(`Add wallet: ${wallet} to user: ${id}`);
    try {
      this.logger.debug(`Get user with id: ${id}`);
      const user = await this.prismaService.user.findUnique({
        where: {
          id: id,
        },
      });
      if (user) {
        this.logger.debug(`Find wallet: ${wallet} in list of wallets of user`);
        const walletExist = user.wallets.filter(
          (item) => item.address === wallet,
        )[0];
        const formatWallet: UserWallet = {
          address: wallet,
          provider: provider,
        };
        if (!walletExist && user.wallets.length > 9) {
          const apiErrorDto: ApiErrorDto = {
            message: 'You can not have more than 10 wallets.',
          };
          throw new ForbiddenException(apiErrorDto);
        }
        const updatedDataForUser = walletExist
          ? {
              activeWallet: formatWallet,
            }
          : {
              wallets: [...user.wallets, formatWallet],
              activeWallet: formatWallet,
            };
        this.logger.debug(`Add wallet to user`);
        return await this.prismaService.user.update({
          where: {
            id: id,
          },
          data: updatedDataForUser,
        });
      }
    } catch (err) {
      this.logger.debug(`Add wallet to user error: ${err.message}`);
      const apiErrorDto: ApiErrorDto = {
        message: 'Add wallet to user failed',
      };
      throw new ForbiddenException(apiErrorDto);
    }
  }

  async removeWalletFromUser(id: string, wallet: string) {
    this.logger.debug(`Remove wallet: ${wallet} from user: ${id}`);
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id,
        },
      });
      if (user && user.activeWallet.address === wallet) {
        this.logger.debug(`Remove wallet from user.`);
        return await this.prismaService.user.update({
          where: {
            id: id,
          },
          data: {
            activeWallet: null,
          },
        });
      }
    } catch (err) {
      this.logger.debug(`Remove wallet from user error: ${err.message}`);
      const apiErrorDto: ApiErrorDto = {
        message: 'Remove wallet from user failed',
      };
      throw new ForbiddenException(apiErrorDto);
    }
  }
}
