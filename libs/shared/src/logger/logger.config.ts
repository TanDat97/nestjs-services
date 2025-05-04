import { LogLevel } from '@nestjs/common';
import { config } from '../configs';
import { resolve } from 'path';

// Default log directory
const LOG_DIR = config.logDir;

// Helper function to parse log levels from environment variables
const parseLogLevels = (envValue: string | undefined, defaultLevels: string[]): string[] => {
  if (!envValue) {
    return defaultLevels;
  }
  return envValue.split(',').map((level) => level.trim());
};

// Default log level configurations
const defaultConsoleLogLevels = {
  dev: ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'],
  uat: ['log', 'error', 'warn', 'debug'],
  prod: ['log', 'error', 'warn'],
};

const defaultFileLogLevels = {
  dev: ['error', 'warn'],
  uat: ['error', 'warn'],
  prod: ['error'],
};

// Environment-specific log configurations
export const loggerConfig = {
  // Console logging levels by environment
  consoleLogLevels: {
    dev: parseLogLevels(config.consoleLogLevel, defaultConsoleLogLevels.dev),
    uat: parseLogLevels(config.consoleLogLevel, defaultConsoleLogLevels.uat),
    prod: parseLogLevels(config.consoleLogLevel, defaultConsoleLogLevels.prod),
  },

  // File logging levels by environment
  fileLogLevels: {
    dev: parseLogLevels(config.fileLogLevel, defaultFileLogLevels.dev),
    uat: parseLogLevels(config.fileLogLevel, defaultFileLogLevels.uat),
    prod: parseLogLevels(config.fileLogLevel, defaultFileLogLevels.prod),
  },

  // Log file configurations
  logFiles: {
    directory: LOG_DIR,
    filename: `%DATE%-${config.namespace || 'app'}.log`,
    systemFilename: `%DATE%-${config.namespace || 'app'}.log`,
    customFilename: `%DATE%-${config.namespace || 'app'}.log`,
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d', // Keep logs for 14 days
    zippedArchive: true,
  },

  // Get console log levels based on current environment
  getConsoleLogLevels(): LogLevel[] {
    const env = config.environment;
    return parseLogLevels(config.consoleLogLevel, this.consoleLogLevels[env] || this.consoleLogLevels.dev) as LogLevel[];
  },

  // Get file log levels based on current environment
  getFileLogLevels(): string[] {
    const env = config.environment;
    return parseLogLevels(config.fileLogLevel, this.fileLogLevels[env] || this.fileLogLevels.dev);
  },

  // Get log directory path
  getLogDirectory(): string {
    return resolve(process.cwd(), this.logFiles.directory);
  },
};
