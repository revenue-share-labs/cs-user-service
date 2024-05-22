import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService, ConfigType } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import baseConfig from './shared/common/configs/base.config';
import swaggerConfig from './shared/common/configs/swagger.config';
import corsConfig from './shared/common/configs/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger:
      process.env.NODE_ENV === 'production'
        ? ['log', 'error', 'warn']
        : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const base = configService.get<ConfigType<typeof baseConfig>>('base');
  const swagger =
    configService.get<ConfigType<typeof swaggerConfig>>('swagger');
  const cors = configService.get<ConfigType<typeof corsConfig>>('cors');

  // Cors
  if (cors.enabled) {
    app.enableCors({
      origin: cors.origins,
      methods: cors.methods,
      credentials: cors.credentials,
    });
  }

  // Base
  app.setGlobalPrefix('/api/v1/users', { exclude: ['health'] });

  // Swagger Api
  if (swagger.enabled) {
    const options = new DocumentBuilder()
      .setTitle(swagger.title)
      .setDescription(swagger.description)
      .setVersion(swagger.version)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, options);

    SwaggerModule.setup(swagger.path, app, document);
  }

  await app.listen(base.port || 3000);
}

bootstrap();
