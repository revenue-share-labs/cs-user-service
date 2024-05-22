import { ApiProperty } from '@nestjs/swagger';
import { WalletProvider } from '@prisma/client';

export class UserWallet {
  @ApiProperty({
    description: 'Wallet address',
  })
  readonly address: string;

  @ApiProperty({
    description: 'Wallet provider',
    enum: WalletProvider,
  })
  readonly provider: WalletProvider;
}
