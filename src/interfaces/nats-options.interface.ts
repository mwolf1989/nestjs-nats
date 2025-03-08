import { ModuleMetadata, Type } from '@nestjs/common';
import { ConnectionOptions } from 'nats';
import { SubscriptionOptions } from './nats-subscription.interface';

export interface NatsModuleOptions {
  /**
   * NATS connection options
   */
  connectionOptions: ConnectionOptions;

  /**
   * Subjects to subscribe to
   */
  subjects?: {
    name: string;
    options?: SubscriptionOptions;
  }[];

  /**
   * Whether to automatically setup subscriptions
   * @default true
   */
  autoSetupSubscriptions?: boolean;
}

export interface NatsOptionsFactory {
  createNatsOptions(): Promise<NatsModuleOptions> | NatsModuleOptions;
}

export interface NatsModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<NatsOptionsFactory>;
  useClass?: Type<NatsOptionsFactory>;
  useFactory?: (...args: unknown[]) => Promise<NatsModuleOptions> | NatsModuleOptions;
  inject?: Array<Type<any> | string | symbol>;
} 