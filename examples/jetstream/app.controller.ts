import { Controller, Get, Post, Body } from '@nestjs/common';
import { JetStreamPublisherService } from './jetstream-publisher.service';

@Controller()
export class AppController {
  constructor(private readonly publisherService: JetStreamPublisherService) {}

  @Get()
  getHello() {
    return { message: 'NATS JetStream example application is running!' };
  }

  @Post('orders')
  createOrder(@Body() order: any) {
    return this.publisherService.publishOrderCreated(order);
  }

  @Post('orders/update')
  updateOrder(@Body() order: any) {
    return this.publisherService.publishOrderUpdated(order);
  }

  @Post('orders/delete')
  deleteOrder(@Body() body: { id: string }) {
    return this.publisherService.publishOrderDeleted(body.id);
  }
} 