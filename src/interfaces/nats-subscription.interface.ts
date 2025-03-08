/**
 * NATS Subscription Options
 */
export interface SubscriptionOptions {
  /**
   * Maximum number of messages to receive - auto unsubscribe
   */
  max?: number;
  /**
   * How long to wait for the first message in milliseconds
   */
  timeout?: number;
  /**
   * The queue group name the subscriber belongs to
   */
  queue?: string;
  /**
   * Any additional options that may be supported by NATS
   */
  [key: string]: unknown;
} 