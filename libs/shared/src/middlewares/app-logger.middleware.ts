import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { config } from '../configs';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new LoggerService({ context: AppLoggerMiddleware.name });

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    const start = Date.now();

    this.logger.log(`${method} ${originalUrl} ${userAgent} ${ip} ${start}`);

    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      const duration = Date.now() - start;
      this.logger.log(`${method} ${originalUrl} ${statusCode} ${contentLength} ${duration}ms - ${ip} ${start}`);

      if (duration >= config.requestTimeWarn) {
        this.logger.warn(`REQUEST TAKE LONG: ${method} ${originalUrl} ${statusCode} ${contentLength} ${duration}ms - ${ip} ${start}`);
      }
    });

    next();
  }
}
