import { ApiPropertyOptional } from '@nestjs/swagger';
import { WalletProvider } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsEthereumAddress,
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({
    description: 'User email',
  })
  @IsOptional()
  @IsEmail()
  readonly email?: string;

  @ApiPropertyOptional({
    description: 'User wallet',
  })
  @IsOptional()
  @IsEthereumAddress()
  readonly address?: string;

  @ApiPropertyOptional({
    description: 'Wallet provider',
    enum: WalletProvider,
  })
  @IsOptional()
  @IsEnum(WalletProvider)
  readonly provider?: WalletProvider;
}
