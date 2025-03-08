import { Controller, Get, Post, Body } from '@nestjs/common';
import { PublisherService } from './publisher.service';

@Controller()
export class AppController {
  constructor(private readonly publisherService: PublisherService) {}

  @Get()
  getHello() {
    return { message: 'NATS example application is running!' };
  }

  @Post('publish')
  publishMessage(@Body() body: { text: string }) {
    return this.publisherService.publishHello(body.text);
  }

  @Post('request')
  async requestMessage(@Body() body: { text: string }) {
    return this.publisherService.requestHello(body.text);
  }

  @Post('order')
  async createOrder(@Body() order: any) {
    return this.publisherService.createOrder(order);
  }

  @Post('work')
  async queueWork(@Body() work: any) {
    return this.publisherService.queueWork(work);
  }
} 