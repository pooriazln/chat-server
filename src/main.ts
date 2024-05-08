import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get<ConfigService>(ConfigService);
  const PORT = configService.getOrThrow('PORT');

  // Swager
  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    const config = new DocumentBuilder()
      .setTitle('OnFest Api')
      .setDescription('an api for onFest')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .build();

    const metadata_ts = './metadata';
    if (existsSync(join(__dirname, 'metadata.js'))) {
      const metadata = await import(metadata_ts);
      await SwaggerModule.loadPluginMetadata(metadata.default);
    }

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(PORT);
}
bootstrap();
