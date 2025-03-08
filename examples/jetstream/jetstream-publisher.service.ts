import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JetStreamService } from '../../src';

@Injectable()
export class JetStreamPublisherService implements OnModuleInit {
  private readonly logger = new Logger(JetStreamPublisherService.name);
  private readonly STREAM_NAME = 'orders';
  private readonly SUBJECTS = ['orders.created', 'orders.updated', 'orders.deleted'];

  constructor(private readonly jetStreamService: JetStreamService) {}

  async onModuleInit() {
    await this.jetStreamService.init();
    await this.setupStream();
  }

  private async setupStream() {
    try {
      await this.jetStreamService.createStream(this.STREAM_NAME, this.SUBJECTS, {
        storage: 'memory',
        retention: 'limits',
      });
    } catch (error) {
      this.logger.error(`Failed to setup stream: ${error.message}`, error.stack);
    }
  }

  async publishOrderCreated(order: any) {
    this.logger.log(`Publishing order created event: ${JSON.stringify(order)}`);
    const ack = await this.jetStreamService.publish('orders.created', order);
    return {
      published: true,
      stream: ack.stream,
      sequence: ack.seq,
    };
  }

  async publishOrderUpdated(order: any) {
    this.logger.log(`Publishing order updated event: ${JSON.stringify(order)}`);
    const ack = await this.jetStreamService.publish('orders.updated', order);
    return {
      published: true,
      stream: ack.stream,
      sequence: ack.seq,
    };
  }

  async publishOrderDeleted(orderId: string) {
    this.logger.log(`Publishing order deleted event: ${orderId}`);
    const ack = await this.jetStreamService.publish('orders.deleted', { id: orderId });
    return {
      published: true,
      stream: ack.stream,
      sequence: ack.seq,
    };
  }
} 