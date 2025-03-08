import { DynamicModule, Module, Provider } from '@nestjs/common';
import { NatsModuleOptions, NatsModuleAsyncOptions, NatsOptionsFactory } from './interfaces/nats-options.interface';
import { NATS_MODULE_OPTIONS } from './constants';
import { createNatsConnection } from './nats.providers';
import { NatsConnection } from './nats.connection';
import { JetStreamService } from './jetstream';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [DiscoveryModule],
  providers: [NatsConnection, JetStreamService],
  exports: [NatsConnection, JetStreamService],
})
export class NatsModule {
  /**
   * Registers a configured NatsModule for import into the current module
   */
  public static register(options: NatsModuleOptions): DynamicModule {
    return {
      module: NatsModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: NATS_MODULE_OPTIONS,
          useValue: options,
        },
        createNatsConnection(),
        JetStreamService,
      ],
      exports: [NatsConnection, JetStreamService],
    };
  }

  /**
   * Registers a configured NatsModule for import into the current module
   * using dynamic options from a factory
   */
  public static registerAsync(options: NatsModuleAsyncOptions): DynamicModule {
    return {
      module: NatsModule,
      imports: [...(options.imports || []), DiscoveryModule],
      providers: [
        ...this.createAsyncProviders(options),
        createNatsConnection(),
        JetStreamService,
      ],
      exports: [NatsConnection, JetStreamService],
    };
  }

  private static createAsyncProviders(
    options: NatsModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: NatsModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: NATS_MODULE_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
    return {
      provide: NATS_MODULE_OPTIONS,
      useFactory: async (optionsFactory: NatsOptionsFactory) =>
        await optionsFactory.createNatsOptions(),
      inject: [options.useExisting || options.useClass],
    };
  }
} 