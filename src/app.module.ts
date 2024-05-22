import { WalletModule } from './api/wallet/wallet.module';
import { AuthModule } from './shared/common/auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './shared/services/prisma/prisma.module';
import baseConfig from './shared/common/configs/base.config';
import swaggerConfig from './shared/common/configs/swagger.config';
import corsConfig from './shared/common/configs/cors.config';
import { APP_FILTER } from '@nestjs/core';
import { DefaultFilter } from './shared/common/filters/default.filter';
import { UserModule } from './api/user/user.module';
import { StorageModule } from './shared/services/storage/storage.module';
import { TasksModule } from './shared/services/tasks/tasks.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './shared/services/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [baseConfig, swaggerConfig, corsConfig],
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? `/etc/conf/user-svc/.${process.env.NODE_ENV}.env`
          : `.${process.env.NODE_ENV}.env`,
    }),
    UserModule,
    WalletModule,
    StorageModule,
    TasksModule,
    PrismaModule,
    AuthModule,
    ScheduleModule.forRoot(),
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: DefaultFilter,
    },
    {
      provide: 'JWT_SECRET',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get<string>('INTERNAL_JWT_SECRET'),
    },
  ],
})
export class AppModule {}
