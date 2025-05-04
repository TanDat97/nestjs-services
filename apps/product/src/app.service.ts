import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `Service ${process.env.SERVICE_NAME} Pong!`;
  }
}
