# @mwolf1989/nestjs-nats

A NestJS native module for NATS that supports both RPC and Publish/Subscribe messaging patterns.

## Description

This module features an opinionated set of decorators for common NATS patterns including Publish/Subscribe and RPC using NATS's built-in request-reply functionality.

It allows you to expose normal NestJS service methods as messaging handlers that can be configured to support a variety of messaging patterns.

## Installation

```bash
npm install --save @mwolf1989/nestjs-nats nats
```

or

```bash
yarn add @mwolf1989/nestjs-nats nats
```

## Usage

### Module Initialization

Import and add `NatsModule` to the `imports` array of the module for which you would like to discover handlers. It may make sense for your application to do this in a shared module or to re-export it so it can be used across modules more easily.

```typescript
import { NatsModule } from '@mwolf1989/nestjs-nats';
import { Module } from '@nestjs/common';
import { MessagingController } from './messaging/messaging.controller';
import { MessagingService } from './messaging/messaging.service';

@Module({
  imports: [
    NatsModule.register({
      connectionOptions: {
        servers: 'nats://localhost:4222',
      },
    }),
  ],
  providers: [MessagingService],
  controllers: [MessagingController],
})
export class AppModule {}
```

### Async Configuration

You can also configure the module asynchronously, perhaps getting configuration from a ConfigService:

```typescript
import { NatsModule } from '@mwolf1989/nestjs-nats';
import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';

@Module({
  imports: [
    NatsModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connectionOptions: {
          servers: configService.get('NATS_URL'),
        },
      }),
    }),
  ],
})
export class AppModule {}
```

### Receiving Messages

To receive messages, you can use the `@NatsSubscribe()` decorator to designate a method as a handler for a specific NATS subject:

```typescript
import { Injectable } from '@nestjs/common';
import { NatsSubscribe } from '@mwolf1989/nestjs-nats';

@Injectable()
export class MessagingService {
  @NatsSubscribe('hello')
  handleHello(data: any, msg: any) {
    console.log('Received message:', data);
    // If this is a request-reply pattern and the message has a reply subject,
    // you can return a value which will be sent back to the requester
    return { response: `Hello received: ${data.text}` };
  }
}
```

### Sending Messages

To send messages, you can inject the `NatsConnection` and use it to publish messages or make requests:

```typescript
import { Injectable } from '@nestjs/common';
import { NatsConnection } from '@mwolf1989/nestjs-nats';

@Injectable()
export class OrderService {
  constructor(private readonly natsConnection: NatsConnection) {}

  async createOrder(orderData: any) {
    // Create the order in the database
    const order = await this.orderRepository.save(orderData);
    
    // Publish an event
    this.natsConnection.publish('order.created', order);
    
    return order;
  }
  
  async getOrderStatus(orderId: string) {
    // Make a request and wait for a reply
    const status = await this.natsConnection.request<{ status: string }>(
      'order.status',
      { orderId },
      { timeout: 5000 }, // 5 seconds timeout
    );
    
    return status;
  }
}
```

## JetStream Support

This module includes support for NATS JetStream, which provides persistence, guaranteed delivery, and other advanced features on top of the core NATS messaging system.

### Using JetStream

You can inject the `JetStreamService` into your providers to work with JetStream:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { JetStreamService } from '@mwolf1989/nestjs-nats';

@Injectable()
export class OrderService implements OnModuleInit {
  constructor(private readonly jetStreamService: JetStreamService) {}

  async onModuleInit() {
    // Initialize JetStream client and manager
    await this.jetStreamService.init();
    
    // Create a stream
    await this.jetStreamService.createStream('orders', ['orders.created', 'orders.updated', 'orders.deleted'], {
      storage: 'file',
      retention: 'limits',
    });
  }
  
  async createOrder(orderData: any) {
    // Create the order in the database
    const order = await this.orderRepository.save(orderData);
    
    // Publish an event to JetStream
    const ack = await this.jetStreamService.publish('orders.created', order);
    
    return {
      order,
      eventPublished: true,
      stream: ack.stream,
      sequence: ack.seq,
    };
  }
}
```

### JetStream Subscriptions

You can subscribe to JetStream messages with consumers:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { JetStreamService } from '@mwolf1989/nestjs-nats';

@Injectable()
export class OrderProcessor implements OnModuleInit {
  constructor(private readonly jetStreamService: JetStreamService) {}

  async onModuleInit() {
    await this.jetStreamService.init();
    
    // Create a JetStream subscription with a durable consumer
    const subscription = await this.jetStreamService.subscribe('orders.*', {
      durable: 'order-processor',
      deliverNew: true,
      ackExplicit: true,
    });
    
    // Process messages
    this.processMessages(subscription);
  }
  
  private async processMessages(subscription: any) {
    (async () => {
      for await (const message of subscription) {
        try {
          // Process the message
          console.log(`Received message: ${message.subject}`, message.data);
          
          // Acknowledge the message
          message.ack();
        } catch (error) {
          console.error('Error processing message:', error);
          // Negative acknowledge - will be redelivered
          message.nak();
        }
      }
    })();
  }
}
```

## Advanced Usage

### Direct Client Access

If you need direct access to the NATS client for advanced usage, you can get it from the `NatsConnection`:

```typescript
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NatsConnection } from '@mwolf1989/nestjs-nats';

@Injectable()
export class AdvancedService implements OnModuleInit {
  constructor(private readonly natsConnection: NatsConnection) {}

  async onModuleInit() {
    const client = this.natsConnection.getClient();
    
    // Now you can use the client directly
    const subscription = client.subscribe('some.subject');
    
    // Process messages
    (async () => {
      for await (const message of subscription) {
        console.log('Received message:', message);
      }
    })();
  }
}
```

## Examples

Check out the examples directory for working examples:

- **Basic**: Simple example demonstrating basic NATS publish/subscribe and request/reply patterns
- **JetStream**: Example showing how to use JetStream for persistent messaging

To run the examples:

1. Start a NATS server with JetStream enabled:

```bash
docker-compose up -d
```

2. Run the example applications:

```bash
cd examples/basic
npm install
npm start

# In another terminal
cd examples/jetstream
npm install
npm start
```

## Testing

The package includes comprehensive tests to ensure reliability. You can run them with:

```bash
npm test
```

## License

MIT
