/**
 * Base interface for NATS message data
 * This defines the structure of data that can be published/received via NATS
 */
export interface NatsMessageData {
  [key: string]: unknown;
}

/**
 * NATS message interface
 * This represents a message received from NATS
 */
export interface NatsMessage {
  /**
   * The subject of the message
   */
  subject: string;
  
  /**
   * The data contained in the message
   */
  data?: NatsMessageData;
  
  /**
   * The reply subject (if applicable)
   */
  reply?: string;
  
  /**
   * Message headers (if supported by server)
   */
  headers?: Map<string, string[]>;
  
  /**
   * Respond to this message
   */
  respond?(data: Uint8Array): boolean;
  
  /**
   * Acknowledge the message (for JetStream)
   */
  ack?(): void;
  
  /**
   * Negative acknowledge the message (for JetStream)
   */
  nak?(delay?: number): void;
  
  /**
   * Working acknowledge the message (for JetStream)
   */
  working?(): void;
  
  /**
   * Additional properties that might be available
   */
  [key: string]: unknown;
} 