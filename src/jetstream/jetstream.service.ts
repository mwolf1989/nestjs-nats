import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumerOpts, JetStreamClient, JetStreamManager, PubAck, StreamConfig, StringCodec } from 'nats';
import { NatsConnection } from '../nats.connection';
import { JetStreamPublishOptions, JetStreamStreamOptions } from '../interfaces/jetstream-options.interface';
import { NatsMessageData } from '../interfaces/nats-message.interface';

@Injectable()
export class JetStreamService implements OnModuleInit {
  private readonly logger = new Logger(JetStreamService.name);
  private jetStreamManager: JetStreamManager;
  private jetStreamClient: JetStreamClient;
  private readonly sc = StringCodec();
  private connectionInitialized = false;

  constructor(private readonly natsConnection: NatsConnection) {
    // We'll let onModuleInit handle initialization instead
  }

  /**
   * Initialize JetStream client and manager
   * Called automatically during module initialization
   */
  async init() {
    try {
      let client;
      try {
        client = this.natsConnection.getClient();
      } catch (error) {
        this.logger.warn('NATS client is not yet connected. JetStream services will not be available initially.');
        throw error;
      }

      if (!client) {
        const error = new Error('NATS client is not available');
        this.logger.warn('NATS client is not available. JetStream services will not be available initially.');
        throw error;
      }

      this.jetStreamManager = await client.jetstreamManager();
      this.jetStreamClient = client.jetstream();
      this.connectionInitialized = true;
      this.logger.log('JetStream initialized');
    } catch (error) {
      this.logger.error(`Failed to initialize JetStream: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Automatically initialize when the module is initialized
   */
  async onModuleInit() {
    await this.init();
  }

  /**
   * Get the JetStream client
   * @returns The JetStream client
   */
  getJetStreamClient(): JetStreamClient {
    if (!this.connectionInitialized) {
      this.tryReconnect();
    }
    
    if (!this.jetStreamClient) {
      throw new Error('JetStream client is not initialized');
    }
    return this.jetStreamClient;
  }

  /**
   * Get the JetStream manager
   * @returns The JetStream manager
   */
  getJetStreamManager(): JetStreamManager {
    if (!this.connectionInitialized) {
      this.tryReconnect();
    }
    
    if (!this.jetStreamManager) {
      throw new Error('JetStream manager is not initialized');
    }
    return this.jetStreamManager;
  }

  /**
   * Attempts to reconnect to NATS if not connected
   * @private
   */
  private async tryReconnect() {
    try {
      await this.init();
    } catch (error) {
      this.logger.debug(`Reconnection attempt failed: ${error.message}`);
    }
  }

  /**
   * Create a new stream
   * @param name The name of the stream
   * @param subjects The subjects to include in the stream
   * @param options Additional stream configuration options
   */
  async createStream(name: string, subjects: string[], options?: Partial<JetStreamStreamOptions>): Promise<void> {
    try {
      if (!this.jetStreamManager) {
        await this.init();
      }

      // Convert our custom options to NATS StreamConfig format
      const streamConfig: Partial<StreamConfig> = {
        name,
        subjects,
      };

      // Copy over any additional options
      if (options) {
        Object.keys(options).forEach(key => {
          if (key !== 'name' && key !== 'subjects') {
            streamConfig[key] = options[key];
          }
        });
      }

      await this.jetStreamManager.streams.add(streamConfig);
      this.logger.log(`Stream created: ${name}`);
    } catch (error) {
      this.logger.error(`Failed to create stream: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Publish a message to a JetStream subject
   * @param subject The subject to publish to
   * @param data The data to publish
   * @param options Publish options
   * @returns Promise with the publish acknowledgement
   */
  async publish(subject: string, data: NatsMessageData | string | Uint8Array, options?: JetStreamPublishOptions): Promise<PubAck> {
    try {
      if (!this.jetStreamClient) {
        await this.init();
      }

      let payload: Uint8Array;
      if (typeof data === 'string') {
        payload = this.sc.encode(data);
      } else if (data instanceof Uint8Array) {
        payload = data;
      } else {
        payload = this.sc.encode(JSON.stringify(data));
      }

      const publishAck = await this.jetStreamClient.publish(subject, payload, options);
      this.logger.debug(`Published message to JetStream subject: ${subject}`);
      return publishAck;
    } catch (error) {
      this.logger.error(`Failed to publish message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Subscribe to a JetStream subject
   * @param subject The subject to subscribe to
   * @param options Subscription options
   * @returns The subscription
   */
  async subscribe(subject: string, options?: Record<string, unknown>) {
    try {
      if (!this.jetStreamClient) {
        await this.init();
      }

      const subscription = await this.jetStreamClient.subscribe(subject, options);
      this.logger.log(`Subscribed to JetStream subject: ${subject}`);
      return subscription;
    } catch (error) {
      this.logger.error(`Failed to subscribe: ${error.message}`, error.stack);
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