import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { NatsSubscribe, NatsConnection } from '../../src';

@Injectable()
export class SubscriberService implements OnModuleInit {
  private readonly logger = new Logger(SubscriberService.name);

  constructor(private readonly natsConnection: NatsConnection) {}

  async onModuleInit() {
    // Manually register subscribers
    const helloSub = this.natsConnection.subscribe('hello');
    const orderSub = this.natsConnection.subscribe('order.created');
    const workSub = this.natsConnection.subscribe('queue.work', { queue: 'workers' });

    // Process hello messages
    (async () => {
      for await (const msg of helloSub) {
        try {
          const data = JSON.parse(new TextDecoder().decode(msg.data));
          this.logger.log(`Received hello message: ${JSON.stringify(data)}`);
          const response = { response: `Hello received: ${data.text}` };
          if (msg.reply) {
            msg.respond(new TextEncoder().encode(JSON.stringify(response)));
          }
        } catch (error) {
          this.logger.error(`Error processing hello message: ${error.message}`);
        }
      }
    })();

    // Process order messages
    (async () => {
      for await (const msg of orderSub) {
        try {
          const data = JSON.parse(new TextDecoder().decode(msg.data));
          this.logger.log(`Order created: ${JSON.stringify(data)}`);
          const response = { status: 'processed', orderId: data.id };
          if (msg.reply) {
            msg.respond(new TextEncoder().encode(JSON.stringify(response)));
          }
        } catch (error) {
          this.logger.error(`Error processing order message: ${error.message}`);
        }
      }
    })();

    // Process work messages
    (async () => {
      for await (const msg of workSub) {
        try {
          const data = JSON.parse(new TextDecoder().decode(msg.data));
          this.logger.log(`Processing work: ${JSON.stringify(data)}`);
          const response = { processed: true, workId: data.id };
          if (msg.reply) {
            msg.respond(new TextEncoder().encode(JSON.stringify(response)));
          }
        } catch (error) {
          this.logger.error(`Error processing work message: ${error.message}`);
        }
      }
    })();
  }

  // Keep the decorators for documentation, but they won't be auto-discovered
  @NatsSubscribe('hello')
  handleHello(data: any, msg: any) {
    this.logger.log(`Received message: ${JSON.stringify(data)}`);
    return { response: `Hello received: ${data.text}` };
  }

  @NatsSubscribe('order.created')
  handleOrderCreated(data: any, msg: any) {
    this.logger.log(`Order created: ${JSON.stringify(data)}`);
    return { status: 'processed', orderId: data.id };
  }

  @NatsSubscribe('queue.work', { queue: 'workers' })
  handleQueueWork(data: any, msg: any) {
    this.logger.log(`Processing work: ${JSON.stringify(data)}`);
    return { processed: true, workId: data.id };
  }
} 