/**
 * Attempts to automatically detect the caller context
 * This uses the Error stack trace to determine the caller
 * @returns The determined context name or 'Unknown' if unable to detect
 */
export function detectContext(): string {
  try {
    // Create an error to get the stack trace
    const stack = new Error().stack || '';
    
    // Split the stack by lines and find relevant caller
    const stackLines = stack.split('\n');
    
    // Skip first two lines which are this function and its caller in LoggerService
    for (let i = 2; i < stackLines.length; i++) {
      const line = stackLines[i].trim();
      
      // Skip anonymous, internal, and logger-related functions
      if (line.includes('node_modules') 
          || line.includes('logger.service') 
          || line.includes('logger.utils')
          || line.includes('anonymous')
          || line.includes('Module.')) {
        continue;
      }
      
      // Try to extract more context information from the stack trace
      // First, try to match specifically AppService which is commonly used in NestJS apps
      let appServiceMatch = line.match(/at (?:new |)(AppService)\./);
      if (appServiceMatch && appServiceMatch[1]) {
        return appServiceMatch[1];
      }
      
      // Next, try to find service classes specifically (ending with "Service")
      let serviceMatch = line.match(/at (?:new |)([A-Za-z0-9_]+Service)[. ]/);
      if (serviceMatch && serviceMatch[1]) {
        return serviceMatch[1]; // Return the service class name
      }
      
      // If no service found, try controller classes (ending with "Controller")
      let controllerMatch = line.match(/at (?:new |)([A-Za-z0-9_]+Controller)[. ]/);
      if (controllerMatch && controllerMatch[1]) {
        return controllerMatch[1]; // Return the controller class name
      }
      
      // Extract info from the path if available
      let pathMatch = line.match(/\((.+?):\d+:\d+\)/);
      if (pathMatch && pathMatch[1]) {
        const path = pathMatch[1];
        // Look for 'app.service.ts' pattern in the path
        if (path.includes('app.service.ts')) {
          return 'AppService';
        }
      }
      
      // If no service or controller, fall back to any class name
      let match = line.match(/at (?:new |)([A-Za-z0-9_]+)[. ]/);
      if (match && match[1]) {
        return match[1]; // Return the class/function name
      }
    }
    
    // If we couldn't detect from stack trace, try to get from the service name environment variable
    if (process.env.SERVICE_NAME) {
      return `${process.env.SERVICE_NAME}Service`;
    }
    
    return 'Unknown';
  } catch (e) {
    return 'Unknown';
  }
}