import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from '../configs';
import { json, urlencoded } from 'express';

export const bootstrap = async (AppModule: any, grpc: any = null) => {
  const app = await NestFactory.create(AppModule, { cors: true });
  const serviceName = process.env.SERVICE_NAME || __dirname?.split('/').pop();

  if (grpc) {
    await app.connectMicroservice(grpc);
    try {
      await app.startAllMicroservices();
      Logger.log(`gRPC ${AppModule.name} Microservice started successfully on: ${grpc.options?.url}`);
    } catch (error) {
      Logger.error(`Failed to start gRPC ${AppModule.name} Microservice: ${JSON.stringify(error)}`);
    }
  }

  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ limit: '20mb' }));

  if (config.environment !== 'development') {
    app.setGlobalPrefix(`/api/${serviceName}`);
  }

  await app.listen(process.env.PORT || 3000);

  Logger.log(`HTTP ${AppModule.name} started on: ${await app.getUrl()}`);
};
