import { ApiProperty } from '@nestjs/swagger';
import { IsEthereumAddress, IsEnum } from 'class-validator';
import { WalletProvider } from '@prisma/client';

export class ChangeWalletOfUserDto {
  @ApiProperty({
    description: 'User wallet',
  })
  @IsEthereumAddress()
  readonly wallet: string;

  @ApiProperty({
    description: 'Provider of wallet',
    enum: WalletProvider,
  })
  @IsEnum(WalletProvider)
  readonly provider: WalletProvider;
}
