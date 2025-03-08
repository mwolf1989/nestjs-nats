import { Inject, Injectable, Logger, OnApplicationShutdown, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { connect, ConnectionOptions, NatsConnection as NatsClient, StringCodec, Subscription } from 'nats';
import { NATS_MODULE_OPTIONS, NATS_SUBJECT_HANDLER, NATS_SUBSCRIBE_OPTIONS } from './constants';
import { NatsModuleOptions } from './interfaces/nats-options.interface';

@Injectable()
export class NatsConnection implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(NatsConnection.name);
  private client: NatsClient;
  private subscriptions: Subscription[] = [];
  private readonly sc = StringCodec();

  constructor(
    @Inject(NATS_MODULE_OPTIONS) private readonly options: NatsModuleOptions,
    private readonly discoveryService?: DiscoveryService,
    private readonly metadataScanner?: MetadataScanner,
  ) {}

  async onModuleInit() {
    await this.connect();
    
    if (this.options.autoSetupSubscriptions !== false && this.discoveryService && this.metadataScanner) {
      await this.setupSubscriptions();
    }
  }

  async onApplicationShutdown() {
    await this.close();
  }

  async connect() {
    try {
      this.client = await connect(this.options.connectionOptions);
      this.logger.log(`Connected to NATS server at ${this.options.connectionOptions.servers}`);
      
      // Setup predefined subjects if any
      if (this.options.subjects && this.options.subjects.length > 0) {
        for (const subject of this.options.subjects) {
          this.subscribe(subject.name, subject.options);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to connect to NATS server: ${error.message}`, error.stack);
      throw error;
    }
  }

  async close() {
    if (this.client) {
      // Drain ensures all messages are processed before closing
      await this.client.drain();
      this.logger.log('Disconnected from NATS server');
    }
  }

  getClient(): NatsClient {
    if (!this.client) {
      throw new Error('NATS client is not connected');
    }
    return this.client;
  }

  /**
   * Subscribe to a subject
   * @param subject The subject to subscribe to
   * @param options Subscription options
   * @returns Subscription
   */
  subscribe(subject: string, options?: any): Subscription {
    if (!this.client) {
      throw new Error('NATS client is not connected');
    }

    const subscription = this.client.subscribe(subject, options);
    this.subscriptions.push(subscription);
    this.logger.log(`Subscribed to subject: ${subject}`);
    return subscription;
  }

  /**
   * Publish a message to a subject
   * @param subject The subject to publish to
   * @param data The data to publish
   */
  publish(subject: string, data: any): void {
    if (!this.client) {
      throw new Error('NATS client is not connected');
    }

    let payload: Uint8Array;
    if (typeof data === 'string') {
      payload = this.sc.encode(data);
    } else if (data instanceof Uint8Array) {
      payload = data;
    } else {
      payload = this.sc.encode(JSON.stringify(data));
    }

    this.client.publish(subject, payload);
    this.logger.debug(`Published message to subject: ${subject}`);
  }

  /**
   * Request-reply pattern
   * @param subject The subject to send the request to
   * @param data The data to send
   * @param options Request options
   * @returns Promise with the response
   */
  async request<T = any>(subject: string, data: any, options?: { timeout?: number }): Promise<T> {
    if (!this.client) {
      throw new Error('NATS client is not connected');
    }

    let payload: Uint8Array;
    if (typeof data === 'string') {
      payload = this.sc.encode(data);
    } else if (data instanceof Uint8Array) {
      payload = data;
    } else {
      payload = this.sc.encode(JSON.stringify(data));
    }

    const response = await this.client.request(subject, payload, options);
    const decodedResponse = this.sc.decode(response.data);
    
    try {
      return JSON.parse(decodedResponse) as T;
    } catch (e) {
      return decodedResponse as unknown as T;
    }
  }

  /**
   * Setup subscriptions based on decorators
   */
  private async setupSubscriptions() {
    const providers = this.discoveryService.getProviders();
    
    providers.forEach(provider => {
      const { instance } = provider;
      
      if (!instance || !Object.getPrototypeOf(instance)) {
        return;
      }
      
      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        method => {
          const subjectHandler = Reflect.getMetadata(
            NATS_SUBJECT_HANDLER,
            instance,
            method,
          );
          
          if (subjectHandler) {
            const options = Reflect.getMetadata(
              NATS_SUBSCRIBE_OPTIONS,
              instance,
              method,
            );
            
            const subscription = this.subscribe(subjectHandler, options);
            
            // Process messages
            (async () => {
              for await (const message of subscription) {
                try {
                  const data = this.sc.decode(message.data);
                  let parsedData;
                  
                  try {
                    parsedData = JSON.parse(data);
                  } catch (e) {
                    parsedData = data;
                  }
                  
                  const result = await instance[method](parsedData, message);
                  
                  // If the message has a reply subject, send the result back
                  if (message.reply) {
                    let response: Uint8Array;
                    
                    if (typeof result === 'string') {
                      response = this.sc.encode(result);
                    } else if (result instanceof Uint8Array) {
                      response = result;
                    } else {
                      response = this.sc.encode(JSON.stringify(result));
                    }
                    
                    message.respond(response);
                  }
                } catch (error) {
                  this.logger.error(
                    `Error processing message on subject ${subjectHandler}: ${error.message}`,
                    error.stack,
                  );
                }
              }
            })();
          }
        },
      );
    });
  }
} 