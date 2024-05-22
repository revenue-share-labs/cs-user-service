import { WalletService } from './wallet.service';
import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiBearerAuth,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { User } from '../../shared/common/decorators';
import { UserDto, ApiErrorDto } from '../generic/dto';
import { ChangeWalletOfUserDto } from './dto';
import { ExternalGuard } from '../../shared/common/auth/external.guard';

@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Patch()
  @ApiOperation({
    summary: 'Add wallet to user.',
    description: 'This method add wallet to exist user and return user.',
  })
  @ApiOkResponse({
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    type: ApiErrorDto,
    description: 'Add wallet to user error',
  })
  @UseGuards(ExternalGuard)
  addWalletToUser(
    @Body() body: ChangeWalletOfUserDto,
    @User() user: UserDto,
  ): Promise<UserDto> {
    return this.walletService.addWalletToUser(user.id, body);
  }

  @Delete('/:address')
  @ApiOperation({
    summary: 'Remove wallet from user.',
    description: 'This method remove wallet from active wallet and return user',
  })
  @ApiOkResponse({
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    type: ApiErrorDto,
    description: 'Remove wallet from activeWallet error',
  })
  @UseGuards(ExternalGuard)
  removeWalletFromUser(
    @Param('address') address: string,
    @User() user: UserDto,
  ): Promise<UserDto> {
    return this.walletService.removeWalletFromUser(user.id, address);
  }
}
