import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserDto, ApiErrorDto, NewUserDto } from '../generic/dto';
import { CreateUserDto } from './dto';
import { Roles, User } from '../../shared/common/decorators';
import { UserRole } from '@prisma/client';
import { RolesGuard } from '../../shared/common/auth/roles.guard';
import { InternalGuard } from '../../shared/common/auth/internal.guard';
import { ExternalGuard } from '../../shared/common/auth/external.guard';
import { MultipleGuardsReferences } from '../../shared/common/decorators';
import { MultipleAuthorizeGuard } from '../../shared/common/auth/multiple-auth.guard';
import { GetUsersByAddressesDto } from './dto/get-users-by-addresses.dto';
import { GetUsersByAddressesResponseDto } from './dto/get-users-by-addresses-response.dto';

@ApiTags('user')
@ApiBearerAuth()
@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:id')
  @ApiOperation({
    summary: 'Get user.',
    description: 'This method returns a user by JWT token.',
  })
  @ApiOkResponse({
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'User with id not found',
  })
  @ApiForbiddenResponse({
    description: 'Get user error',
    type: ApiErrorDto,
  })
  @MultipleGuardsReferences(InternalGuard, ExternalGuard)
  @UseGuards(MultipleAuthorizeGuard)
  getUser(@Param('id') id: string, @User() user: UserDto): Promise<UserDto> {
    if (id === '@me') {
      return this.userService.getUser(user.id);
    } else {
      return this.userService.getUser(id);
    }
  }

  @Post()
  @ApiOperation({
    summary: 'Create user.',
    description: 'This method find or create user and returns user.',
  })
  @ApiCreatedResponse({
    type: NewUserDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    type: ApiErrorDto,
    description: 'User create error',
  })
  @UseGuards(InternalGuard)
  getOrCreateUser(@Body() body: CreateUserDto) {
    return this.userService.getOrCreateUser(body);
  }

  @Post('/users-by-addresses')
  @ApiOperation({
    summary: 'Get userIds by addresses of wallets.',
    description:
      'This method find users by addresses of wallets and returns userIds.',
  })
  @ApiCreatedResponse({
    type: GetUsersByAddressesResponseDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiForbiddenResponse({
    type: ApiErrorDto,
    description: 'Get userIds error',
  })
  @UseGuards(InternalGuard)
  getUsersByAddresses(
    @Body() body: GetUsersByAddressesDto,
  ): Promise<GetUsersByAddressesResponseDto> {
    return this.userService.getUsersByAddresses(body.addresses);
  }

  @Get('/api-key/:apiKey')
  @ApiOperation({
    summary: 'Get user by api key.',
    description: 'This method returns a user by api key.',
  })
  @ApiOkResponse({
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'User with api key not found',
  })
  @ApiForbiddenResponse({
    type: ApiErrorDto,
    description: 'Get user error',
  })
  @UseGuards(InternalGuard)
  getUserByApiKey(@Param('apiKey') apiKey: string): Promise<UserDto> {
    return this.userService.getUserByApiKey(apiKey);
  }

  @Patch('/:id/to-partner')
  @ApiOperation({
    summary: 'Change usertype of user to partner and add api key.',
    description:
      'This method change user type of user to partner and add api key.',
  })
  @ApiOkResponse({
    type: UserDto,
  })
  @ApiUnauthorizedResponse({
    type: ApiErrorDto,
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'User with id not found',
  })
  @ApiForbiddenResponse({
    type: ApiErrorDto,
    description: 'Change user type error',
  })
  @UseGuards(ExternalGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  changeToPartner(@Param('id') id: string): Promise<UserDto> {
    return this.userService.changeUserToPartner(id);
  }
}
