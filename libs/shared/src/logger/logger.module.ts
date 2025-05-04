import { Module, DynamicModule } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * Logger Module
 * 
 * Provides the LoggerService for use across the application.
 * Import this module into any module where you need logging capabilities.
 */
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {
  /**
   * Creates a module with auto-context detection for the LoggerService.
   * This allows the logger to automatically set its context to the name of the calling class.
   */
  static forRoot(): DynamicModule {
    return {
      module: LoggerModule,
      providers: [LoggerService],
      exports: [LoggerService],
      global: true
    };
  }
}