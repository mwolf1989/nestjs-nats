import { NatsSubscribe } from '../decorators/nats-subscribe.decorator';
import { NATS_SUBJECT_HANDLER, NATS_SUBSCRIBE_OPTIONS } from '../constants';

describe('NatsSubscribe Decorator', () => {
  class TestClass {
    @NatsSubscribe('test.subject')
    testMethod() {
      return 'test';
    }

    @NatsSubscribe('test.subject.with.options', { queue: 'test-queue' })
    testMethodWithOptions() {
      return 'test with options';
    }
  }

  it('should set the subject handler metadata', () => {
    const instance = new TestClass();
    const subject = Reflect.getMetadata(NATS_SUBJECT_HANDLER, instance, 'testMethod');
    expect(subject).toBe('test.subject');
  });

  it('should not set options metadata when no options are provided', () => {
    const instance = new TestClass();
    const options = Reflect.getMetadata(NATS_SUBSCRIBE_OPTIONS, instance, 'testMethod');
    expect(options).toBeUndefined();
  });

  it('should set the subject handler and options metadata when options are provided', () => {
    const instance = new TestClass();
    const subject = Reflect.getMetadata(NATS_SUBJECT_HANDLER, instance, 'testMethodWithOptions');
    const options = Reflect.getMetadata(NATS_SUBSCRIBE_OPTIONS, instance, 'testMethodWithOptions');
    
    expect(subject).toBe('test.subject.with.options');
    expect(options).toEqual({ queue: 'test-queue' });
  });
}); 