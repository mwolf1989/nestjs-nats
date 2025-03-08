import { Module } from '@nestjs/common';
// In a real application, you would import from '@mwolf1989/nestjs-nats'
import { NatsModule } from '../../src';
import { JetStreamPublisherService } from './jetstream-publisher.service';
import { JetStreamSubscriberService } from './jetstream-subscriber.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    NatsModule.register({
      connectionOptions: {
        servers: 'nats://localhost:4222',
        reconnect: true,
        reconnectTimeWait: 2000,
        maxReconnectAttempts: 10,
        timeout: 20000
      },
    }),
  ],
  controllers: [AppController],
  providers: [JetStreamPublisherService, JetStreamSubscriberService],
})
export class AppModule {} 