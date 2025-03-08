import { ModuleMetadata, Type } from '@nestjs/common';
import { ConnectionOptions } from 'nats';

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
    options?: any;
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
  useFactory?: (...args: any[]) => Promise<NatsModuleOptions> | NatsModuleOptions;
  inject?: any[];
} 