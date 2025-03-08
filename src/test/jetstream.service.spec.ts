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
      const subscription = await jetStreamService.subscribe('test.subject', { durable_name: 'test-consumer' });
      expect(mockJetStreamClient.subscribe).toHaveBeenCalledWith('test.subject', { durable_name: 'test-consumer' });
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

  describe('error handling', () => {
    it('should throw an error when initialization fails', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          JetStreamService,
          {
            provide: NatsConnection,
            useValue: {
              getClient: jest.fn().mockImplementation(() => {
                throw new Error('Client not available');
              }),
            },
          },
        ],
      }).compile();
  
      const jetStreamService = moduleRef.get<JetStreamService>(JetStreamService);
      await expect(jetStreamService.init()).rejects.toThrow('Client not available');
    });

    it('should throw an error when accessing uninitialized jetstream client', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          JetStreamService,
          {
            provide: NatsConnection,
            useValue: mockNatsConnection,
          },
        ],
      }).compile();
  
      const jetStreamService = moduleRef.get<JetStreamService>(JetStreamService);
      expect(() => jetStreamService.getJetStreamClient()).toThrow('JetStream client is not initialized');
    });

    it('should throw an error when accessing uninitialized jetstream manager', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          JetStreamService,
          {
            provide: NatsConnection,
            useValue: mockNatsConnection,
          },
        ],
      }).compile();
  
      const jetStreamService = moduleRef.get<JetStreamService>(JetStreamService);
      expect(() => jetStreamService.getJetStreamManager()).toThrow('JetStream manager is not initialized');
    });

    it('should handle errors when creating a stream', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          JetStreamService,
          {
            provide: NatsConnection,
            useValue: mockNatsConnection,
          },
        ],
      }).compile();
  
      const jetStreamService = moduleRef.get<JetStreamService>(JetStreamService);
      await jetStreamService.init();
  
      const mockError = new Error('Failed to create stream');
      mockJetStreamManager.streams.add.mockRejectedValueOnce(mockError);
  
      await expect(jetStreamService.createStream('test-stream', ['test.subject'])).rejects.toThrow('Failed to create stream');
    });

    it('should handle errors when publishing', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          JetStreamService,
          {
            provide: NatsConnection,
            useValue: mockNatsConnection,
          },
        ],
      }).compile();
  
      const jetStreamService = moduleRef.get<JetStreamService>(JetStreamService);
      await jetStreamService.init();
  
      const mockError = new Error('Failed to publish');
      mockJetStreamClient.publish.mockRejectedValueOnce(mockError);
  
      await expect(jetStreamService.publish('test.subject', { test: 'data' })).rejects.toThrow('Failed to publish');
    });

    it('should handle errors when subscribing', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          JetStreamService,
          {
            provide: NatsConnection,
            useValue: mockNatsConnection,
          },
        ],
      }).compile();
  
      const jetStreamService = moduleRef.get<JetStreamService>(JetStreamService);
      await jetStreamService.init();
  
      const mockError = new Error('Failed to subscribe');
      mockJetStreamClient.subscribe.mockRejectedValueOnce(mockError);
  
      await expect(jetStreamService.subscribe('test.subject')).rejects.toThrow('Failed to subscribe');
    });

    it('should handle errors when getting consumer info', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          JetStreamService,
          {
            provide: NatsConnection,
            useValue: mockNatsConnection,
          },
        ],
      }).compile();
  
      const jetStreamService = moduleRef.get<JetStreamService>(JetStreamService);
      await jetStreamService.init();
  
      const mockError = new Error('Failed to get consumer info');
      mockJetStreamManager.consumers.info.mockRejectedValueOnce(mockError);
  
      await expect(jetStreamService.getConsumerInfo('test-stream', 'test-consumer')).rejects.toThrow('Failed to get consumer info');
    });

    it('should handle errors when deleting a stream', async () => {
      const moduleRef = await Test.createTestingModule({
        providers: [
          JetStreamService,
          {
            provide: NatsConnection,
            useValue: mockNatsConnection,
          },
        ],
      }).compile();
  
      const jetStreamService = moduleRef.get<JetStreamService>(JetStreamService);
      await jetStreamService.init();
  
      const mockError = new Error('Failed to delete stream');
      mockJetStreamManager.streams.delete.mockRejectedValueOnce(mockError);
  
      await expect(jetStreamService.deleteStream('test-stream')).rejects.toThrow('Failed to delete stream');
    });
  });
}); 