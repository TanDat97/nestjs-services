import { Injectable } from '@nestjs/common';
import { EventListener, EventSubscriber, EventType, UserLoggedInEvent, UserRegisteredEvent } from '@libs/shared/events';
import { LoggerService } from '@libs/shared/logger/logger.service';

@Injectable()
@EventSubscriber()
export class AuthEventsSubscriber {
  private readonly logger = new LoggerService({ context: AuthEventsSubscriber.name });

  @EventListener(EventType.USER_REGISTERED)
  async onUserRegistered(event: UserRegisteredEvent): Promise<void> {
    this.logger.log(`User registered event received: ${JSON.stringify(event)}`);
    // Handle user registered event
    // e.g., send welcome email, initialize user profile, etc.
  }

  @EventListener(EventType.USER_LOGGED_IN)
  async onUserLoggedIn(event: UserLoggedInEvent): Promise<void> {
    this.logger.log(`User logged in event received: ${JSON.stringify(event)}`);
    // Handle user logged in event
    // e.g., record login activity, update last login timestamp, etc.
  }
}
