import { Test } from '@nestjs/testing';
import { JetStreamService } from '../jetstream/jetstream.service';
import { NatsConnection } from '../nats.connection';

// Mock the NATS client
const mockJetStreamClient = {
  publish: jest.fn().mockResolvedValue({ seq: 1, stream: 'test-stream' }),
  subscribe: jest.fn().mockResolvedValue({
    getProcessed: jest.fn().mockReturnValue(0),
    getReceived: jest.fn().mockReturnValue(0),
    getMax: jest.fn().mockReturnValue(0),
    getPending: jest.fn().mockReturnValue(0),
    [Symbol.asyncIterator]: () => ({
      next: async () => ({ done: true }),
    }),
  }),
};

const mockJetStreamManager = {
  streams: {
    add: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
  },
  consumers: {
    info: jest.fn().mockResolvedValue({}),
  },
};

const mockNatsClient = {
  jetstream: jest.fn().mockReturnValue(mockJetStreamClient),
  jetstreamManager: jest.fn().mockResolvedValue(mockJetStreamManager),
};

const mockNatsConnection = {
  getClient: jest.fn().mockReturnValue(mockNatsClient),
};

jest.mock('nats', () => {
  return {
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

describe('JetStreamService', () => {
  let jetStreamService: JetStreamService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module = await Test.createTestingModule({
      providers: [
        JetStreamService,
        {
          provide: NatsConnection,
          useValue: mockNatsConnection,
        },
      ],
    }).compile();

    jetStreamService = module.get<JetStreamService>(JetStreamService);
  });

  describe('init', () => {
    it('should initialize the JetStream client and manager', async () => {
      await jetStreamService.init();
      expect(mockNatsConnection.getClient).toHaveBeenCalled();
      expect(mockNatsClient.jetstream).toHaveBeenCalled();
      expect(mockNatsClient.jetstreamManager).toHaveBeenCalled();
    });
  });

  describe('createStream', () => {
    it('should create a stream', async () => {
      await jetStreamService.init();
      await jetStreamService.createStream('test-stream', ['test.subject'], { storage: 'memory' });
      expect(mockJetStreamManager.streams.add).toHaveBeenCalledWith({
        name: 'test-stream',
        subjects: ['test.subject'],
        storage: 'memory',
      });
    });
  });

  describe('publish', () => {
    it('should publish a message to JetStream', async () => {
      await jetStreamService.init();
      const result = await jetStreamService.publish('test.subject', { test: 'data' });
      expect(mockJetStreamClient.publish).toHaveBeenCalled();
      expect(result).toEqual({ seq: 1, stream: 'test-stream' });
    });
  });

  describe('subscribe', () => {
    it('should subscribe to a JetStream subject', async () => {
      await jetStreamService.init();
      const subscription = await jetStreamService.subscribe('test.subject', { durable: 'test-consumer' });
      expect(mockJetStreamClient.subscribe).toHaveBeenCalledWith('test.subject', { durable: 'test-consumer' });
      expect(subscription).toBeDefined();
    });
  });

  describe('deleteStream', () => {
    it('should delete a stream', async () => {
      await jetStreamService.init();
      await jetStreamService.deleteStream('test-stream');
      expect(mockJetStreamManager.streams.delete).toHaveBeenCalledWith('test-stream');
    });
  });
}); 