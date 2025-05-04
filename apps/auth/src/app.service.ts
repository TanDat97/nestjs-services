import { LoggerService } from '@libs/shared/logger/logger.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }

  getHello() {
    // this.logger.log('This is a regular log message');
    // this.logger.error('This is an error message', 'Error stack trace here');
    // this.logger.warn('This is a warning message');
    // this.logger.debug('This is a debug message');
    // this.logger.verbose('This is a verbose message');

    // this.logger.customInfo('User completed checkout process');
    // this.logger.customError('Payment failed');
    // this.logger.customWarn('Unusual activity detected on account');
    // this.logger.customDebug('Processing order #12345');
    // this.logger.customVerbose('Cart contains 5 items');

    return `Service ${process.env.SERVICE_NAME} Pong!`;
  }
}
