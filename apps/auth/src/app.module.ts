import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from '@libs/shared/interceptors/response.interceptor';
import { LoggerModule } from '@libs/shared/logger/logger.module';
import { AppLoggerMiddleware } from '@libs/shared/middlewares/app-logger.middleware';

@Module({
  imports: [
    LoggerModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor }],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}