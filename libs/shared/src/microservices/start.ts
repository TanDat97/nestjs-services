import { ConsoleLogger, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { config } from '../configs';
import { json, urlencoded } from 'express';

export const bootstrap = async (AppModule: any, grpc: any = null) => {
  const serviceName = process.env.SERVICE_NAME || __dirname?.split('/').pop();
  const app = await NestFactory.create(AppModule, { cors: true, logger: new ConsoleLogger({ prefix: serviceName }) });

  if (grpc && grpc.options?.url && grpc.options?.port) {
    await app.connectMicroservice(grpc);
    try {
      await app.startAllMicroservices();
      Logger.log(`gRPC ${AppModule.name} microservice started successfully on: ${grpc.options?.url}`);
    } catch (error) {
      Logger.error(`Failed to start gRPC ${AppModule.name} microservice: ${JSON.stringify(error)}`);
    }
  }

  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ limit: '20mb' }));

  if (config.environment !== 'local') {
    app.setGlobalPrefix(`/api/${serviceName}`);
  }

  await app.listen(process.env.PORT || 3000);

  Logger.log(`HTTP server ${AppModule.name} started on: ${await app.getUrl()}`);
};
