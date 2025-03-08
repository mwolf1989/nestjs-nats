import { Test } from '@nestjs/testing';
import { NatsConnection } from '../nats.connection';
import { NATS_MODULE_OPTIONS } from '../constants';

// Mock the NATS client
const mockSubscribe = jest.fn();
const mockPublish = jest.fn();
const mockRequest = jest.fn();
const mockDrain = jest.fn();

jest.mock('nats', () => {
  return {
    connect: jest.fn().mockImplementation(() => {
      return {
        drain: mockDrain.mockResolvedValue(undefined),
        subscribe: mockSubscribe.mockReturnValue({
          getProcessed: jest.fn().mockReturnValue(0),
          getReceived: jest.fn().mockReturnValue(0),
          getMax: jest.fn().mockReturnValue(0),
          getPending: jest.fn().mockReturnValue(0),
          [Symbol.asyncIterator]: () => ({
            next: async () => ({ done: true }),
          }),
        }),
        publish: mockPublish,
        request: mockRequest.mockResolvedValue({
          data: new TextEncoder().encode(JSON.stringify({ success: true })),
        }),
      };
    }),
    StringCodec: jest.fn().mockReturnValue({
      encode: jest.fn().mockImplementation((data) => {
        if (typeof data === 'string') {
          return new TextEncoder().encode(data);
        }
        return new TextEncoder().encode(JSON.stringify(data));
      }),
      decode: jest.fn().mockImplementation((data) => new TextDecoder().decode(data)),
    }),
  };
});

describe('NatsConnection', () => {
  let natsConnection: NatsConnection;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        NatsConnection,
        {
          provide: NATS_MODULE_OPTIONS,
          useValue: {
            connectionOptions: {
              servers: 'nats://localhost:4222',
            },
          },
        },
      ],
    }).compile();

    natsConnection = module.get<NatsConnection>(NatsConnection);
    await natsConnection.onModuleInit();
  });

  afterEach(async () => {
    await natsConnection.onApplicationShutdown();
  });

  describe('connect', () => {
    it('should connect to the NATS server', async () => {
      const { connect } = require('nats');
      expect(connect).toHaveBeenCalledWith({
        servers: 'nats://localhost:4222',
      });
    });
  });

  describe('subscribe', () => {
    it('should subscribe to a subject', () => {
      natsConnection.subscribe('test.subject');
      expect(mockSubscribe).toHaveBeenCalledWith('test.subject', undefined);
    });

    it('should subscribe to a subject with options', () => {
      const options = { queue: 'test-queue' };
      natsConnection.subscribe('test.subject', options);
      expect(mockSubscribe).toHaveBeenCalledWith('test.subject', options);
    });
  });

  describe('publish', () => {
    it('should publish a string message', () => {
      natsConnection.publish('test.subject', 'test message');
      expect(mockPublish).toHaveBeenCalled();
    });

    it('should publish an object message', () => {
      const message = { test: 'data' };
      natsConnection.publish('test.subject', message);
      expect(mockPublish).toHaveBeenCalled();
    });
  });

  describe('request', () => {
    it('should send a request and return the response', async () => {
      const response = await natsConnection.request('test.subject', 'test message');
      expect(mockRequest).toHaveBeenCalled();
      expect(response).toEqual({ success: true });
    });

    it('should send a request with options', async () => {
      const options = { timeout: 5000 };
      await natsConnection.request('test.subject', 'test message', options);
      expect(mockRequest).toHaveBeenCalled();
    });
  });

  describe('close', () => {
    it('should drain the connection when closing', async () => {
      await natsConnection.close();
      expect(mockDrain).toHaveBeenCalled();
    });
  });
}); 