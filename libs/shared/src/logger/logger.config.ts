import { LogLevel } from '@nestjs/common';
import { config } from '../configs';
import { resolve } from 'path';

// Default log directory
const LOG_DIR = process.env.LOG_DIR || 'logs';

// Environment-specific log configurations
export const loggerConfig = {
  // Console logging levels by environment
  consoleLogLevels: {
    dev: ['log', 'error', 'warn', 'debug', 'verbose'],
    uat: ['log', 'error', 'warn', 'debug'],
    prod: ['log', 'error', 'warn'],
  },
  
  // File logging levels by environment
  fileLogLevels: {
    dev: ['error', 'warn'],
    uat: ['error', 'warn'],
    prod: ['error'],
  },
  
  // Log file configurations
  logFiles: {
    directory: LOG_DIR,
    filename: `%DATE%-${config.namespace || 'app'}.log`,
    systemFilename: `%DATE%-${config.namespace || 'app'}.log`,
    customFilename: `%DATE%-${config.namespace || 'app'}.log`,
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',  // Keep logs for 14 days
    zippedArchive: true,
  },
  
  // Get console log levels based on current environment
  getConsoleLogLevels(): LogLevel[] {
    const env = config.environment;
    return this.consoleLogLevels[env] || this.consoleLogLevels.dev;
  },
  
  // Get file log levels based on current environment
  getFileLogLevels(): string[] {
    const env = config.environment;
    return this.fileLogLevels[env] || this.fileLogLevels.dev;
  },
  
  // Get log directory path
  getLogDirectory(): string {
    return resolve(process.cwd(), this.logFiles.directory);
  }
};