import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { JetStreamService, StringCodec } from '../../src';

@Injectable()
export class JetStreamSubscriberService implements OnModuleInit {
  private readonly logger = new Logger(JetStreamSubscriberService.name);
  private readonly sc = StringCodec();
  private readonly CONSUMER_NAME = 'orders-processor';

  constructor(private readonly jetStreamService: JetStreamService) {}

  async onModuleInit() {
    await this.jetStreamService.init();
    await this.setupSubscriptions();
  }

  private async setupSubscriptions() {
    try {
      // Create a subscription with the durable consumer name
      const subscription = await this.jetStreamService.subscribe('orders.*', {
        queue: 'orders-queue',
        durable: this.CONSUMER_NAME,
        deliverNew: true,
        ackExplicit: true,
        manualAck: true,
      });

      // Process messages in the background
      this.processMessages(subscription);

      this.logger.log(`Subscribed to orders.* with consumer ${this.CONSUMER_NAME}`);
    } catch (error) {
      this.logger.error(`Failed to setup subscriptions: ${error.message}`, error.stack);
    }
  }

  private async processMessages(subscription: any) {
    (async () => {
      for await (const message of subscription) {
        try {
          const data = this.sc.decode(message.data);
          let parsedData;
          
          try {
            parsedData = JSON.parse(data);
          } catch (e) {
            parsedData = data;
          }
          
          this.logger.log(`Received message on subject ${message.subject}: ${JSON.stringify(parsedData)}`);
          
          switch (message.subject) {
            case 'orders.created':
              await this.handleOrderCreated(parsedData);
              break;
            case 'orders.updated':
              await this.handleOrderUpdated(parsedData);
              break;
            case 'orders.deleted':
              await this.handleOrderDeleted(parsedData);
              break;
            default:
              this.logger.warn(`Unhandled subject: ${message.subject}`);
          }
          
          // Acknowledge the message
          message.ack();
        } catch (error) {
          this.logger.error(`Error processing message: ${error.message}`, error.stack);
          // Negative acknowledge the message - it will be redelivered
          message.nak();
        }
      }
    })();
  }

  private async handleOrderCreated(data: any) {
    this.logger.log(`Processing order created: ${JSON.stringify(data)}`);
    // Here you would add your business logic to handle the order creation
    // For example, store it in a database, send a confirmation email, etc.
  }

  private async handleOrderUpdated(data: any) {
    this.logger.log(`Processing order updated: ${JSON.stringify(data)}`);
    // Here you would add your business logic to handle the order update
  }

  private async handleOrderDeleted(data: any) {
    this.logger.log(`Processing order deleted: ${JSON.stringify(data)}`);
    // Here you would add your business logic to handle the order deletion
  }
} 