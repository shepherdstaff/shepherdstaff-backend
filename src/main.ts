import { DiscoveryService, NestFactory } from '@nestjs/core';
import { ApiBearerAuth, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { initializeApp, ServiceAccount } from 'firebase-admin/app';
import admin from 'firebase-admin';
// import * as serviceAccount from '../firebase-service-acc-key.json';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const serviceAccountFromEnv = {
    type: process.env.FSA_TYPE,
    project_id: process.env.FSA_PROJECT_ID,
    private_key_id: process.env.FSA_PRIVATE_KEY_ID,
    private_key: process.env.FSA_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FSA_CLIENT_EMAIL,
    client_id: process.env.FSA_CLIENT_ID,
    auth_uri: process.env.FSA_AUTH_URI,
    token_uri: process.env.FSA_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FSA_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FSA_CLIENT_X509_CERT_URL,
    universe_domain: process.env.FSA_UNIVERSE_DOMAIN,
  };

  // Initialize Firebase Admin SDK
  initializeApp({
    credential: admin.credential.cert(serviceAccountFromEnv as ServiceAccount),
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

  SwaggerModule.setup('api-docs', app, makeDocument);

  app.enableCors();

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
