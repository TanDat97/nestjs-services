import { ConsoleLogger, ConsoleLoggerOptions, Injectable, LogLevel, Scope } from '@nestjs/common';
import { loggerConfig } from './logger.config';
import { createLogger, format, Logger as WinstonLogger } from 'winston';
import { existsSync, mkdirSync } from 'fs';
import { config } from '../configs';
import { detectContext } from './logger.utils';
const DailyRotateFile = require('winston-daily-rotate-file');

// Define log types
enum LogType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService extends ConsoleLogger {
  private systemLogger: WinstonLogger;
  private customLogger: WinstonLogger;
  private contextSet = false;

  constructor(options?: ConsoleLoggerOptions) {
    super({ prefix: config.serviceName });

    // Initialize with environment-specific console log levels
    this.setLogLevels(loggerConfig.getConsoleLogLevels());

    // Initialize file loggers
    this.initializeFileLoggers();

    // Auto-detect and set the context based on the caller class
    if (options?.context) {
      this.context = options.context;
      this.contextSet = true;
    } else {
      const detectedContext = detectContext();
      if (detectedContext !== 'Unknown') {
        this.context = detectedContext;
      }
    }
  }

  /**
   * Initialize Winston loggers for file logging
   */
  private initializeFileLoggers(): void {
    try {
      // Create logs directory if it doesn't exist
      const logDir = loggerConfig.getLogDirectory();
      if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
      }

      // Create Winston system logs transport
      const systemTransport = new DailyRotateFile({
        dirname: logDir,
        filename: loggerConfig.logFiles.systemFilename,
        datePattern: loggerConfig.logFiles.datePattern,
        maxFiles: loggerConfig.logFiles.maxFiles,
        zippedArchive: loggerConfig.logFiles.zippedArchive, 
        format: format.combine(format.timestamp(), format.json()),
        level: 'info',
      });

      // Create Winston custom logs transport
      const customTransport = new DailyRotateFile({
        dirname: logDir,
        filename: loggerConfig.logFiles.customFilename,
        datePattern: loggerConfig.logFiles.datePattern,
        maxFiles: loggerConfig.logFiles.maxFiles,
        zippedArchive: loggerConfig.logFiles.zippedArchive,
        format: format.combine(format.timestamp(), format.json()),
        level: 'info',
      });

      // Create Winston system logger
      this.systemLogger = createLogger({
        level: 'info',
        format: format.combine(format.timestamp(), format.json()),
        defaultMeta: {
          service: config.serviceName || 'app',
          environment: config.environment,
          logType: LogType.SYSTEM,
        },
        transports: [systemTransport],
      });

      // Create Winston custom logger
      this.customLogger = createLogger({
        level: 'info',
        format: format.combine(format.timestamp(), format.json()),
        defaultMeta: {
          service: config.serviceName || 'app',
          environment: config.environment,
          logType: LogType.CUSTOM,
        },
        transports: [customTransport],
      });
    } catch (error) {
      super.error(`Failed to initialize file logger: ${error.message}`, error.stack);
    }
  }

  /**
   * Set context for the logger
   * @param context - Usually the name of the class/service
   */
  setContext(context: string): void {
    super.setContext(context);
    this.contextSet = true;
  }

  /**
   * Get the current context or auto-detect it if not set
   */
  private getContextName(providedContext?: string): string {
    // If context is explicitly provided in the log call, use it
    if (providedContext) {
      return providedContext;
    }

    // If context was previously set via setContext(), use it
    if (this.context && this.contextSet) {
      return this.context;
    }

    // Auto-detect the context by examining the call stack
    const detectedContext = detectContext();
    if (!this.contextSet) {
      super.setContext(detectedContext);
    }

    return detectedContext;
  }

  // ======== SYSTEM LOG METHODS ========
  // These methods log to both console and system log file

  /**
   * Log a message with 'log' level (system)
   */
  log(message: any, context?: string): void {
    const contextName = this.getContextName(context);
    super.log(message, contextName);
    this.logToFile(LogType.SYSTEM, 'info', message, contextName);
  }

  /**
   * Log a message with 'error' level (system)
   */
  error(message: any, trace?: string, context?: string): void {
    const contextName = this.getContextName(context);
    super.error(message, trace, contextName);
    this.logToFile(LogType.SYSTEM, 'error', message, contextName, trace);
  }

  /**
   * Log a message with 'warn' level (system)
   */
  warn(message: any, context?: string): void {
    const contextName = this.getContextName(context);
    super.warn(message, contextName);
    this.logToFile(LogType.SYSTEM, 'warn', message, contextName);
  }

  /**
   * Log a message with 'debug' level (system)
   */
  debug(message: any, context?: string): void {
    const contextName = this.getContextName(context);
    super.debug(message, contextName);
    this.logToFile(LogType.SYSTEM, 'debug', message, contextName);
  }

  /**
   * Log a message with 'verbose' level (system)
   */
  verbose(message: any, context?: string): void {
    const contextName = this.getContextName(context);
    super.verbose(message, contextName);
    this.logToFile(LogType.SYSTEM, 'verbose', message, contextName);
  }

  // ======== CUSTOM LOG METHODS ========
  // These methods log to both console and custom log file

  /**
   * Log a custom message with 'info' level
   */
  customInfo(message: any, context?: string): void {
    const contextName = this.getContextName(context);
    super.log(`[CUSTOM] ${message}`, contextName);
    this.logToFile(LogType.CUSTOM, 'info', message, contextName);
  }

  /**
   * Log a custom message with 'error' level
   */
  customError(message: any, trace?: string, context?: string): void {
    const contextName = this.getContextName(context);
    super.error(`[CUSTOM] ${message}`, trace, contextName);
    this.logToFile(LogType.CUSTOM, 'error', message, contextName, trace);
  }

  /**
   * Log a custom message with 'warn' level
   */
  customWarn(message: any, context?: string): void {
    const contextName = this.getContextName(context);
    super.warn(`[CUSTOM] ${message}`, contextName);
    this.logToFile(LogType.CUSTOM, 'warn', message, contextName);
  }

  /**
   * Log a custom message with 'debug' level
   */
  customDebug(message: any, context?: string): void {
    const contextName = this.getContextName(context);
    super.debug(`[CUSTOM] ${message}`, contextName);
    this.logToFile(LogType.CUSTOM, 'debug', message, contextName);
  }

  /**
   * Log a custom message with 'verbose' level
   */
  customVerbose(message: any, context?: string): void {
    const contextName = this.getContextName(context);
    super.verbose(`[CUSTOM] ${message}`, contextName);
    this.logToFile(LogType.CUSTOM, 'verbose', message, contextName);
  }

  /**
   * Log message to appropriate file if the current log level is enabled for file logging
   */
  private logToFile(logType: LogType, level: string, message: any, context?: string, trace?: string): void {
    const logger = logType === LogType.SYSTEM ? this.systemLogger : this.customLogger;

    if (!logger || !this.shouldLogToFile(level)) {
      return;
    }

    const logEntry = {
      context,
      message,
      trace,
    };

    logger[level](logEntry);
  }

  /**
   * Check if the given log level should be logged to file
   * based on the current environment configuration
   */
  private shouldLogToFile(level: string): boolean {
    const fileLogLevels = loggerConfig.getFileLogLevels();
    return fileLogLevels.includes(level);
  }

  /**
   * Sets custom log levels for console output
   * @param levels - Array of log levels to enable
   */
  setCustomLogLevels(levels: LogLevel[]): void {
    this.setLogLevels(levels);
  }

  /**
   * Sets custom log levels for file logging
   * @param levels - Array of log levels to enable for file logging
   */
  setFileLogLevels(levels: string[]): void {
    // Update logger config file levels dynamically
    loggerConfig.fileLogLevels[config.environment] = levels;
  }
}
