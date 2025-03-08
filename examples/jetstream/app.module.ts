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
      },
    }),
  ],
  controllers: [AppController],
  providers: [JetStreamPublisherService, JetStreamSubscriberService],
})
export class AppModule {} 