import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from '@libs/shared/interceptors/response.interceptor';
import { AppLoggerMiddleware } from '@libs/shared/middlewares/app-logger.middleware';

@Module({
  imports: [],
  controllers: [AppController],
    providers: [AppService, { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor }],
})
export class OrderModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}