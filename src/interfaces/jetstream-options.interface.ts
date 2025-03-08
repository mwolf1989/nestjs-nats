/**
 * JetStream Stream Configuration Options
 * These are simplified options - for full type safety, use the StreamConfig type from 'nats'
 */
export interface JetStreamStreamOptions {
  /**
   * Name of the stream
   */
  name: string;
  
  /**
   * Subjects that the stream is subscribed to
   */
  subjects?: string[];
  
  /**
   * Maximum number of messages in the stream
   */
  max_msgs?: number;
  
  /**
   * Maximum size of the stream in bytes
   */
  max_bytes?: number;
  
  /**
   * Maximum age of messages in the stream
   */
  max_age?: number;
  
  /**
   * Maximum size of a single message
   */
  max_msg_size?: number;
  
  /**
   * Storage type (memory or file)
   * Note: When using with NATS directly, use the StorageType enum from 'nats'
   */
  storage?: string;
  
  /**
   * Number of replicas to keep
   */
  num_replicas?: number;
  
  /**
   * Should messages be duplicated
   */
  no_ack?: boolean;
  
  /**
   * Template owner
   */
  template_owner?: string;
  
  /**
   * Should messages be discarded when the stream is full
   */
  discard?: string;
  
  /**
   * Should the stream be discarded when all consumers are gone
   */
  discard_new_per_subject?: boolean;
  
  /**
   * Additional properties that might be available
   */
  [key: string]: unknown;
}

/**
 * JetStream Publish Options
 * These are simplified options - for full type safety, use the proper types from 'nats'
 */
export interface JetStreamPublishOptions {
  /**
   * Expected last message ID
   */
  expect?: {
    /**
     * Last message ID
     */
    lastMsgID?: string;
    
    /**
     * Stream
     */
    streamName?: string;
  };
  
  /**
   * Message ID
   */
  msgID?: string;
  
  /**
   * Expected last sequence
   */
  expect_last_sequence?: number;
  
  /**
   * Expected last subject sequence
   */
  expect_last_subject_sequence?: number;
  
  /**
   * Expected stream
   */
  expect_stream?: string;
  
  /**
   * Expected last message ID
   */
  expect_last_msg_id?: string;
  
  /**
   * Additional properties that might be available
   */
  [key: string]: unknown;
}

/**
 * JetStream Consumer Options
 * These are simplified options - for full type safety, use the ConsumerOpts type from 'nats'
 */
export interface JetStreamConsumerOptions {
  /**
   * Durable name of the consumer
   */
  durable?: string;
  
  /**
   * Deliver subject
   */
  deliver_subject?: string;
  
  /**
   * Deliver group
   */
  deliver_group?: string;
  
  /**
   * Deliver policy
   */
  deliver_policy?: string;
  
  /**
   * ACK policy
   */
  ack_policy?: string;
  
  /**
   * Wait for ACK timeout in nanoseconds
   */
  ack_wait?: number;
  
  /**
   * Maximum delivery count
   */
  max_deliver?: number;
  
  /**
   * Replay policy
   */
  replay_policy?: string;
  
  /**
   * Filter subject
   */
  filter_subject?: string;
  
  /**
   * Start sequence
   */
  opt_start_seq?: number;
  
  /**
   * Start time
   */
  opt_start_time?: string;
  
  /**
   * Flow control
   */
  flow_control?: boolean;
  
  /**
   * Additional properties that might be available
   */
  [key: string]: unknown;
} 