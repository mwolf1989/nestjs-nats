import { NATS_SUBJECT_HANDLER, NATS_SUBSCRIBE_OPTIONS } from '../constants';

/**
 * Subscribe to a NATS subject
 * @param subject The subject to subscribe to
 * @param options Subscription options
 */
export function NatsSubscribe(subject: string, options?: any): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    Reflect.defineMetadata(NATS_SUBJECT_HANDLER, subject, target, key);
    
    if (options) {
      Reflect.defineMetadata(NATS_SUBSCRIBE_OPTIONS, options, target, key);
    }
    
    return descriptor;
  };
} 