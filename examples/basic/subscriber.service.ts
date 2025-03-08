import { Injectable, Logger } from '@nestjs/common';
import { NatsSubscribe } from '../../src';

@Injectable()
export class SubscriberService {
  private readonly logger = new Logger(SubscriberService.name);

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