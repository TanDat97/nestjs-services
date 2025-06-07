import { LoggerService } from '../logger/logger.service';

/**
 * Decorator to log gRPC method calls
 * @param options Optional configuration for the logging
 */
export function GrpcLog(options: { serviceName?: string } = {}) {
  const logger = new LoggerService({ context: 'GrpcMethod' });

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // Store original method
    const originalMethod = descriptor.value;

    // Replace the method with our instrumented version
    descriptor.value = async function (...args: any[]) {
      const start = Date.now();
      const methodName = propertyKey;
      const serviceName = options.serviceName || target.constructor.name;

      try {
        // Log the request data
        logger.log(`[gRPC] ${serviceName}.${methodName} called with data: ${JSON.stringify(args[0])}`);

        // Call the original method
        const result = await originalMethod.apply(this, args);

        // Log the success result
        logger.log(`[gRPC] ${serviceName}.${methodName} completed in ${Date.now() - start}ms with result: ${JSON.stringify(result)}`);

        return result;
      } catch (error) {
        // Log the error
        logger.error(`[gRPC] ${serviceName}.${methodName} failed after ${Date.now() - start}ms with error: ${error.message}`, error.stack);

        // Re-throw the error to maintain normal flow
        throw error;
      }
    };

    return descriptor;
  };
}
