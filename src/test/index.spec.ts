import 'reflect-metadata';
import * as indexExports from '../index';
import { NatsModule } from '../nats.module';
import { NatsConnection } from '../nats.connection';
import { StringCodec } from 'nats';
import * as decoratorExports from '../decorators';
import * as constantsExports from '../constants';
import * as jetstreamExports from '../jetstream';

describe('Index exports', () => {
  it('should export NatsModule', () => {
    expect(indexExports.NatsModule).toBe(NatsModule);
  });

  it('should export NatsConnection', () => {
    expect(indexExports.NatsConnection).toBe(NatsConnection);
  });

  it('should export StringCodec from nats', () => {
    expect(indexExports.StringCodec).toBe(StringCodec);
  });

  it('should export decorators', () => {
    expect(Object.keys(decoratorExports).length).toBeGreaterThan(0);
    Object.keys(decoratorExports).forEach(key => {
      expect(indexExports).toHaveProperty(key);
      expect(indexExports[key]).toBe(decoratorExports[key]);
    });
  });

  it('should export constants', () => {
    expect(Object.keys(constantsExports).length).toBeGreaterThan(0);
    Object.keys(constantsExports).forEach(key => {
      expect(indexExports).toHaveProperty(key);
      expect(indexExports[key]).toBe(constantsExports[key]);
    });
  });

  it('should export jetstream', () => {
    expect(Object.keys(jetstreamExports).length).toBeGreaterThan(0);
    Object.keys(jetstreamExports).forEach(key => {
      expect(indexExports).toHaveProperty(key);
      expect(indexExports[key]).toBe(jetstreamExports[key]);
    });
  });
}); 