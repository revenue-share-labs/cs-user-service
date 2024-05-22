import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApiErrorItemDto {
  @ApiProperty({
    description: 'Error item message',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Error item code',
  })
  errorCode?: string;
}
