import { Global, Module } from '@nestjs/common';
import { UserService } from '../../../api/user/user.service';
import { InternalStrategy } from './internal.strategy';
import { InternalGuard } from './internal.guard';
import { ExternalStrategy } from './external.strategy';
import { ExternalGuard } from './external.guard';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [PassportModule],
  providers: [
    InternalStrategy,
    InternalGuard,
    ExternalStrategy,
    ExternalGuard,
    UserService,
    ConfigService,
    {
      provide: 'JWT_SECRET',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get<string>('INTERNAL_JWT_SECRET'),
    },
  ],
  exports: [InternalStrategy, InternalGuard, ExternalStrategy, ExternalGuard],
})
export class AuthModule {}
