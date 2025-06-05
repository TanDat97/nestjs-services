import 'reflect-metadata';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';

// Event handler interface
export interface EventHandler {
  handle(data: any): Promise<void> | void;
}

// Event metadata storage
export class EventMetadataStorage {
  private static handlers: Map<string, Array<{ handler: any; methodName: string }>> = new Map();

  static addHandler(eventName: string, handler: any, methodName: string): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push({ handler, methodName });
  }

  static getHandlers(eventName: string): Array<{ handler: any; methodName: string }> {
    return this.handlers.get(eventName) || [];
  }
}

// Event listener decorator
export function EventListener(eventName: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    EventMetadataStorage.addHandler(eventName, target.constructor.name, propertyKey);
    return descriptor;
  };
}

// Event subscriber decorator for classes
export function EventSubscriber() {
  return (target: any) => {
    Reflect.defineMetadata('eventSubscriber', true, target);
    return target;
  };
}

@Injectable()
export class EventBusService implements OnModuleInit {
  private readonly logger = new LoggerService({ context: EventBusService.name });
  private readonly subscribers: Map<string, any> = new Map();

  constructor() {}

  onModuleInit() {
    this.logger.log('Event bus service initialized');
  }

  /**
   * Register an event subscriber instance
   */
  registerSubscriber(subscriber: any): void {
    const name = subscriber.constructor.name;
    this.subscribers.set(name, subscriber);
    this.logger.log(`Registered event subscriber: ${name}`);
  }

  /**
   * Publish an event to all subscribers
   */
  async publish<T = any>(eventName: string, data: T): Promise<void> {
    this.logger.log(`Publishing event: ${eventName}`);

    const handlers = EventMetadataStorage.getHandlers(eventName);
    if (!handlers || handlers.length === 0) {
      this.logger.warn(`No handlers registered for event: ${eventName}`);
      return;
    }

    for (const { handler, methodName } of handlers) {
      const subscriberInstance = this.subscribers.get(handler);

      if (!subscriberInstance) {
        this.logger.warn(`Subscriber ${handler} not registered but has handlers for ${eventName}`);
        continue;
      }

      try {
        await subscriberInstance[methodName](data);
        this.logger.log(`Event ${eventName} handled by ${handler}.${methodName}`);
      } catch (error) {
        this.logger.error(`Error handling event ${eventName} in ${handler}.${methodName}: ${error.message}`, error.stack);
      }
    }
  }
}
