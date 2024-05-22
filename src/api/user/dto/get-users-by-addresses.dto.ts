import { ApiProperty } from '@nestjs/swagger';

export class GetUsersByAddressesDto {
  @ApiProperty({
    description: 'Addresses of wallets',
  })
  addresses: string[];
}
