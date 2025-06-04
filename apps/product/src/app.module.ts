import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from '@libs/shared/interceptors/response.interceptor';
import { AppLoggerMiddleware } from '@libs/shared/middlewares/app-logger.middleware';
import { AuthGrpcModule } from '@libs/shared/grpc/auth/auth-grpc.module';

@Module({
  imports: [AuthGrpcModule],
  controllers: [AppController],
  providers: [AppService, { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor }],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
