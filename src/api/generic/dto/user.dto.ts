import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserCreationStrategy, UserRole } from '@prisma/client';
import { UserWallet } from './user-wallet.dto';

export class UserDto {
  @ApiProperty({
    description: 'User id',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'User email',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'User username',
  })
  username?: string;

  @ApiPropertyOptional({
    description: 'User first name',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'User last name',
  })
  lastName?: string;

  @ApiProperty({
    description: 'User list of wallets',
    type: () => [UserWallet],
  })
  wallets: UserWallet[];

  @ApiProperty({
    description: 'User creation strategy',
    enum: UserCreationStrategy,
  })
  createdBy: UserCreationStrategy;

  @ApiPropertyOptional({
    description: 'User active wallet',
    type: () => UserWallet,
  })
  activeWallet?: UserWallet;

  @ApiPropertyOptional({
    description: 'User api key',
  })
  apiKey?: string;

  @ApiProperty({
    description: 'User roles',
    enum: UserRole,
    isArray: true,
  })
  roles: UserRole[];
}

export class NewUserDto extends UserDto {
  @ApiPropertyOptional({
    description: 'Flag of new user',
  })
  newUser?: boolean;
}
