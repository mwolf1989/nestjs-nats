import { Test } from '@nestjs/testing';
import { NatsModule } from '../nats.module';
import { NatsConnection } from '../nats.connection';
import { NATS_MODULE_OPTIONS } from '../constants';

jest.mock('nats', () => {
  return {
    connect: jest.fn().mockImplementation(() => {
      return {
        drain: jest.fn().mockResolvedValue(undefined),
        subscribe: jest.fn().mockReturnValue({
          getProcessed: jest.fn().mockReturnValue(0),
          getReceived: jest.fn().mockReturnValue(0),
          getMax: jest.fn().mockReturnValue(0),
          getPending: jest.fn().mockReturnValue(0),
          [Symbol.asyncIterator]: () => ({
            next: async () => ({ done: true }),
          }),
        }),
        publish: jest.fn(),
        request: jest.fn().mockResolvedValue({
          data: new TextEncoder().encode(JSON.stringify({ success: true })),
        }),
      };
    }),
    StringCodec: jest.fn().mockReturnValue({
      encode: jest.fn().mockImplementation((data) => new TextEncoder().encode(data)),
      decode: jest.fn().mockImplementation((data) => new TextDecoder().decode(data)),
    }),
  };
});

describe('NatsModule', () => {
  describe('register', () => {
    it('should provide the nats connection', async () => {
      const module = await Test.createTestingModule({
        imports: [
          NatsModule.register({
            connectionOptions: {
              servers: 'nats://localhost:4222',
            },
          }),
        ],
      }).compile();

      const natsConnection = module.get<NatsConnection>(NatsConnection);
      expect(natsConnection).toBeDefined();
    });

    it('should provide the module options', async () => {
      const options = {
        connectionOptions: {
          servers: 'nats://localhost:4222',
        },
      };

      const module = await Test.createTestingModule({
        imports: [NatsModule.register(options)],
      }).compile();

      const moduleOptions = module.get(NATS_MODULE_OPTIONS);
      expect(moduleOptions).toEqual(options);
    });
  });

  describe('registerAsync', () => {
    it('should provide the nats connection using useFactory', async () => {
      const module = await Test.createTestingModule({
        imports: [
          NatsModule.registerAsync({
            useFactory: () => ({
              connectionOptions: {
                servers: 'nats://localhost:4222',
              },
            }),
          }),
        ],
      }).compile();

      const natsConnection = module.get<NatsConnection>(NatsConnection);
      expect(natsConnection).toBeDefined();
    });

    it('should provide the module options using useFactory', async () => {
      const options = {
        connectionOptions: {
          servers: 'nats://localhost:4222',
        },
      };

      const module = await Test.createTestingModule({
        imports: [
          NatsModule.registerAsync({
            useFactory: () => options,
          }),
        ],
      }).compile();

      const moduleOptions = module.get(NATS_MODULE_OPTIONS);
      expect(moduleOptions).toEqual(options);
    });
  });
}); 