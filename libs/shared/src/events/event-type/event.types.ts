// Event types enum for standardization
export enum EventType {
  // Auth events
  USER_REGISTERED = 'user.registered',
  USER_LOGGED_IN = 'user.logged_in',
  USER_LOGGED_OUT = 'user.logged_out',

  // Order events
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_CANCELLED = 'order.cancelled',
  ORDER_COMPLETED = 'order.completed',

  // Product events
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',

  // Payment events
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
}

// Base event interface
export interface BaseEvent {
  id: string;
  timestamp: Date;
  type: EventType;
  payload: any;
}

// User event interfaces
export interface UserRegisteredEvent extends BaseEvent {
  type: EventType.USER_REGISTERED;
  payload: {
    userId: string;
    email: string;
    username: string;
  };
}

export interface UserLoggedInEvent extends BaseEvent {
  type: EventType.USER_LOGGED_IN;
  payload: {
    userId: string;
    timestamp: Date;
  };
}

// Order event interfaces
export interface OrderCreatedEvent extends BaseEvent {
  type: EventType.ORDER_CREATED;
  payload: {
    orderId: string;
    userId: string;
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
  };
}

// Product event interfaces
export interface ProductCreatedEvent extends BaseEvent {
  type: EventType.PRODUCT_CREATED;
  payload: {
    productId: string;
    name: string;
    price: number;
    stock: number;
  };
}

// Utility function to create a new event
export function createEvent<T extends BaseEvent>(type: EventType, payload: Omit<T['payload'], 'id' | 'timestamp'>): T {
  return {
    id: generateUniqueId(),
    timestamp: new Date(),
    type,
    payload,
  } as T;
}

// Helper function to generate a unique ID
function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
