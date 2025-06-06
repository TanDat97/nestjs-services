import { NestFactory } from '@nestjs/core';
import { config } from '../configs';
import { json, urlencoded } from 'express';
import * as Sentry from '@sentry/node';
import { LoggerService } from '../logger/logger.service';
import { AllToHttpExceptionsFilter } from '../filters/all-to-http-exceptions.filter';

export const bootstrap = async (AppModule: any, grpc: any = null) => {
  const logger = new LoggerService();
  const app = await NestFactory.create(AppModule, { cors: true, logger: logger });

  if (grpc && grpc.options?.url && grpc.options?.port) {
    await app.connectMicroservice(grpc);
    try {
      await app.startAllMicroservices();
      logger.log(`gRPC ${AppModule.name} microservice started successfully on: ${grpc.options?.url}`, bootstrap.name);
    } catch (error) {
      logger.error(`Failed to start gRPC ${AppModule.name} microservice: ${JSON.stringify(error)}`, error, bootstrap.name);
    }
  }

  app.use(json({ limit: '20mb' }));
  app.use(urlencoded({ limit: '20mb' }));

  if (config.sentryDsn) {
    Sentry.init({ dsn: config.sentryDsn });
  }

  if (config.environment !== 'local') {
    app.setGlobalPrefix(`/api/${config.serviceName}`);
  }

  app.useGlobalFilters(new AllToHttpExceptionsFilter());
  await app.listen(process.env.PORT || 3000);

  logger.log(`HTTP server ${AppModule.name} started on: ${await app.getUrl()}`, bootstrap.name);
};
