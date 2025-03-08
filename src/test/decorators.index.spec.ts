import 'reflect-metadata';
import * as decoratorExports from '../decorators';
import { NatsSubscribe } from '../decorators/nats-subscribe.decorator';

describe('Decorators index exports', () => {
  it('should export NatsSubscribe decorator', () => {
    expect(decoratorExports.NatsSubscribe).toBe(NatsSubscribe);
  });
}); 