import { Injectable, Logger } from '@nestjs/common';
import { JetStreamClient, JetStreamManager, StringCodec } from 'nats';
import { NatsConnection } from '../nats.connection';

@Injectable()
export class JetStreamService {
  private readonly logger = new Logger(JetStreamService.name);
  private jetStreamClient: JetStreamClient;
  private jetStreamManager: JetStreamManager;
  private readonly sc = StringCodec();

  constructor(private readonly natsConnection: NatsConnection) {}

  /**
   * Initialize JetStream client and manager
   */
  async init(): Promise<void> {
    try {
      const client = this.natsConnection.getClient();
      this.jetStreamClient = client.jetstream();
      this.jetStreamManager = await client.jetstreamManager();
      this.logger.log('JetStream service initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize JetStream: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get the JetStream client
   */
  getJetStreamClient(): JetStreamClient {
    if (!this.jetStreamClient) {
      throw new Error('JetStream client is not initialized');
    }
    return this.jetStreamClient;
  }

  /**
   * Get the JetStream manager
   */
  getJetStreamManager(): JetStreamManager {
    if (!this.jetStreamManager) {
      throw new Error('JetStream manager is not initialized');
    }
    return this.jetStreamManager;
  }

  /**
   * Create a stream
   * @param name Stream name
   * @param subjects Subjects to include in the stream
   * @param options Stream options
   */
  async createStream(name: string, subjects: string[], options?: any): Promise<void> {
    try {
      const jsm = this.getJetStreamManager();
      await jsm.streams.add({
        name,
        subjects,
        ...options,
      });
      this.logger.log(`Stream ${name} created with subjects: ${subjects.join(', ')}`);
    } catch (error) {
      if (error.code === '400' && error.message.includes('stream name already in use')) {
        this.logger.log(`Stream ${name} already exists`);
      } else {
        this.logger.error(`Failed to create stream ${name}: ${error.message}`, error.stack);
        throw error;
      }
    }
  }

  /**
   * Publish a message to JetStream
   * @param subject Subject to publish to
   * @param data Data to publish
   * @param options Publish options
   */
  async publish(subject: string, data: any, options?: any): Promise<any> {
    try {
      const js = this.getJetStreamClient();
      let payload: Uint8Array;
      
      if (typeof data === 'string') {
        payload = this.sc.encode(data);
      } else if (data instanceof Uint8Array) {
        payload = data;
      } else {
        payload = this.sc.encode(JSON.stringify(data));
      }
      
      const ack = await js.publish(subject, payload, options);
      this.logger.debug(`Published message to JetStream subject: ${subject}`);
      return ack;
    } catch (error) {
      this.logger.error(`Failed to publish to JetStream subject ${subject}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Subscribe to a JetStream subject
   * @param subject Subject to subscribe to
   * @param options Subscription options
   */
  async subscribe(subject: string, options?: any) {
    try {
      const js = this.getJetStreamClient();
      const subscription = await js.subscribe(subject, options);
      this.logger.log(`Subscribed to JetStream subject: ${subject}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to subscribe to JetStream subject ${subject}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get consumer info
   * @param stream Stream name
   * @param consumer Consumer name
   */
  async getConsumerInfo(stream: string, consumer: string) {
    try {
      const jsm = this.getJetStreamManager();
      return await jsm.consumers.info(stream, consumer);
    } catch (error) {
      this.logger.error(`Failed to get consumer info: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a stream
   * @param name Stream name
   */
  async deleteStream(name: string): Promise<void> {
    try {
      const jsm = this.getJetStreamManager();
      await jsm.streams.delete(name);
      this.logger.log(`Stream ${name} deleted`);
    } catch (error) {
      this.logger.error(`Failed to delete stream ${name}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 