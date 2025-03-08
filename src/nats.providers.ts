import { Provider } from '@nestjs/common';
import { DiscoveryModule, DiscoveryService, MetadataScanner } from '@nestjs/core';
import { NatsConnection } from './nats.connection';

export const createNatsConnection = (): Provider => ({
  provide: NatsConnection,
  useFactory: (options, discoveryService, metadataScanner) => {
    return new NatsConnection(options, discoveryService, metadataScanner);
  },
  inject: ['NATS_MODULE_OPTIONS', DiscoveryService, MetadataScanner],
});

export const createNatsClient = (): Provider => ({
  provide: 'NATS_CLIENT',
  useFactory: (connection: NatsConnection) => {
    return connection.getClient();
  },
  inject: [NatsConnection],
}); 