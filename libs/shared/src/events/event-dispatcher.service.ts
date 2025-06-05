import { Injectable } from '@nestjs/common';
import { EventBusService } from './event.service';
import { BaseEvent, EventType } from './event-type/event.types';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class EventDispatcherService {
  private readonly logger = new LoggerService({ context: EventDispatcherService.name });

  constructor(private readonly eventBus: EventBusService) {}

  /**
   * Dispatch an event to all subscribers
   */
  async dispatch<T extends BaseEvent>(event: T): Promise<void> {
    this.logger.log(`Dispatching event: ${event.type}`);
    try {
      await this.eventBus.publish(event.type, event);
    } catch (error) {
      this.logger.error(`Error dispatching event ${event.type}: ${error.message}`, error.stack);
    }
  }

  /**
   * Helper method to dispatch an event with only the type and payload
   */
  async dispatchByType<T extends BaseEvent>(type: EventType, payload: any): Promise<void> {
    const event: BaseEvent = {
      id: this.generateUniqueId(),
      timestamp: new Date(),
      type,
      payload,
    };

    await this.dispatch(event as T);
  }

  private generateUniqueId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
