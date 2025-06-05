import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseTransformInterceptor } from '@libs/shared/interceptors/response.interceptor';
import { LoggerModule } from '@libs/shared/logger/logger.module';
import { AppLoggerMiddleware } from '@libs/shared/middlewares/app-logger.middleware';
import { EventsModule } from '@libs/shared/events';
import { AuthEventsSubscriber } from './events-listener/auth.events';

@Module({
  imports: [LoggerModule.forRoot(), EventsModule],
  controllers: [AppController],
  providers: [AppService, AuthEventsSubscriber, { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor }],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes('*');
  }
}
