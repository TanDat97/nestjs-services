import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';
import { AUTH_SERVICE_NAME } from './proto/auth.pb';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/ping')
  getHello() {
    return this.appService.getHello();
  }

  @GrpcMethod(AUTH_SERVICE_NAME, 'Validate')
  validate(payload: any) {
    return this.appService.getHello();
  }
}
