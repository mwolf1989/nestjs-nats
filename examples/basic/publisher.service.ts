import { Injectable, Logger } from '@nestjs/common';
import { NatsConnection } from '../../src';

@Injectable()
export class PublisherService {
  private readonly logger = new Logger(PublisherService.name);

  constructor(private readonly natsConnection: NatsConnection) {}

  publishHello(text: string) {
    this.logger.log(`Publishing hello message: ${text}`);
    this.natsConnection.publish('hello', { text });
    return { sent: true };
  }

  async requestHello(text: string) {
    this.logger.log(`Requesting hello message: ${text}`);
    const response = await this.natsConnection.request<{ response: string }>('hello', { text });
    return response;
  }

  async createOrder(order: any) {
    this.logger.log(`Creating order: ${JSON.stringify(order)}`);
    const response = await this.natsConnection.request('order.created', {
      id: order.id,
      items: order.items,
      total: order.total,
    });
    return response;
  }

  async queueWork(work: any) {
    this.logger.log(`Queuing work: ${JSON.stringify(work)}`);
    const response = await this.natsConnection.request('queue.work', {
      id: work.id,
      type: work.type,
      data: work.data,
    });
    return response;
  }
} 