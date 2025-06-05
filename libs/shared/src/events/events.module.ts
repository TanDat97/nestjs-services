import { Global, Module } from '@nestjs/common';
import { EventBusService } from './event.service';
import { EventDispatcherService } from './event-dispatcher.service';
import { DiscoveryModule } from '@nestjs/core';
import { EventSubscribersDiscoverer } from './event-subscribers.discoverer';

@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [EventBusService, EventDispatcherService, EventSubscribersDiscoverer],
  exports: [EventBusService, EventDispatcherService],
})
export class EventsModule {}
