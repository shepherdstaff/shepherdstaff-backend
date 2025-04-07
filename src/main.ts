import { DiscoveryService, NestFactory } from '@nestjs/core';
import { ApiBearerAuth, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { initializeApp, ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
import serviceAccount from '../firebase-service-acc-key.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Initialize Firebase Admin SDK
  initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });

  const makeDocument = () => {
    const discoveryService = app.get(DiscoveryService);
    const controllers = discoveryService.getControllers();
    for (const controller of controllers) {
      // All the ApiX decorators that you want to bind globally
      ApiBearerAuth()(controller.metatype);
    }

    const config = new DocumentBuilder()
      .setTitle('Fellowship App Backend')
      .setDescription('Backend API for #HACK2024 Fellowship App')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Place your JWT token here',
        in: 'header',
      })
      .addSecurityRequirements('Bearer')
      .build();

    return SwaggerModule.createDocument(app, config);
  };

  SwaggerModule.setup('api', app, makeDocument);

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
