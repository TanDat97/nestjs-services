import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { EventBusService } from './event.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class EventSubscribersDiscoverer implements OnModuleInit {
  private readonly logger = new LoggerService({ context: EventSubscribersDiscoverer.name });

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly eventBusService: EventBusService,
  ) {}

  async onModuleInit() {
    this.logger.log('Discovering event subscribers...');
    await this.discover();
  }

  async discover() {
    const providers = this.discoveryService.getProviders();
    const controllers = this.discoveryService.getControllers();
    const wrappers = [...providers, ...controllers];

    // Find all instances that have the EventSubscriber metadata
    const subscribers = wrappers
      .filter((wrapper) => wrapper.instance && this.isEventSubscriber(wrapper))
      .map((wrapper) => wrapper.instance);

    for (const subscriber of subscribers) {
      this.eventBusService.registerSubscriber(subscriber);
    }

    this.logger.log(`Discovered ${subscribers.length} event subscribers`);
  }

  private isEventSubscriber(wrapper: InstanceWrapper): boolean {
    const { instance } = wrapper;
    if (!instance) return false;

    // Check if the instance has the 'eventSubscriber' property set by the decorator
    const prototype = Object.getPrototypeOf(instance);
    return Reflect.getMetadata('eventSubscriber', prototype.constructor) === true;
  }
}
