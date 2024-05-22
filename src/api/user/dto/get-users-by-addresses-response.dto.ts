import { ApiProperty } from '@nestjs/swagger';

export class GetUsersByAddressesResponseDto {
  @ApiProperty({
    description: 'UserIds',
  })
  userIds: string[];
}
