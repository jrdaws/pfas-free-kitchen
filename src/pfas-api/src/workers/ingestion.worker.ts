/**
 * Ingestion Worker
 * Processes products from ingestion queue
 */

import type { CanonicalProduct, IngestionEvent } from '../types/canonical-product.types.js';
import { 
  productIngestionWorkflow, 
  setEventPublisher,
  type EventPublisher,
} from '../workflows/product-ingestion.workflow.js';
import { logger } from '../config/logger.js';

// ============================================================
// QUEUE CONSUMER INTERFACE
// ============================================================

export interface QueueMessage {
  id: string;
  body: string;
  receiptHandle?: string;
  attributes?: Record<string, string>;
}

export interface QueueConsumer {
  receiveMessages(maxMessages?: number): Promise<QueueMessage[]>;
  deleteMessage(receiptHandle: string): Promise<void>;
  sendMessage(body: string, attributes?: Record<string, string>): Promise<void>;
}

// ============================================================
// MOCK QUEUE (For development/testing)
// ============================================================

class InMemoryQueue implements QueueConsumer {
  private messages: QueueMessage[] = [];
  private messageId = 0;

  async receiveMessages(maxMessages = 10): Promise<QueueMessage[]> {
    const batch = this.messages.splice(0, maxMessages);
    return batch;
  }

  async deleteMessage(_receiptHandle: string): Promise<void> {
    // Already removed on receive in this mock
  }

  async sendMessage(body: string, attributes?: Record<string, string>): Promise<void> {
    this.messages.push({
      id: String(++this.messageId),
      body,
      receiptHandle: String(this.messageId),
      attributes,
    });
  }

  get length(): number {
    return this.messages.length;
  }
}

// ============================================================
// SQS QUEUE (Production - Stub)
// ============================================================

export interface SQSQueueConfig {
  queueUrl: string;
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  visibilityTimeout?: number;
  waitTimeSeconds?: number;
}

/**
 * SQS Queue Consumer (Stub - implement with @aws-sdk/client-sqs)
 */
export class SQSQueue implements QueueConsumer {
  private config: SQSQueueConfig;

  constructor(config: SQSQueueConfig) {
    this.config = config;
  }

  async receiveMessages(_maxMessages = 10): Promise<QueueMessage[]> {
    // TODO: Implement with AWS SDK
    // const command = new ReceiveMessageCommand({
    //   QueueUrl: this.config.queueUrl,
    //   MaxNumberOfMessages: maxMessages,
    //   VisibilityTimeout: this.config.visibilityTimeout || 300,
    //   WaitTimeSeconds: this.config.waitTimeSeconds || 20,
    // });
    throw new Error('SQS not implemented. Use InMemoryQueue for development.');
  }

  async deleteMessage(_receiptHandle: string): Promise<void> {
    // TODO: Implement with AWS SDK
    throw new Error('SQS not implemented.');
  }

  async sendMessage(_body: string, _attributes?: Record<string, string>): Promise<void> {
    // TODO: Implement with AWS SDK
    throw new Error('SQS not implemented.');
  }
}

// ============================================================
// EVENT PUBLISHER IMPLEMENTATIONS
// ============================================================

/**
 * Console Event Publisher (for development/testing)
 */
export class ConsoleEventPublisher implements EventPublisher {
  async publish(event: IngestionEvent): Promise<void> {
    logger.info({
      eventType: event.eventType,
      productId: event.productId,
      source: event.source,
      sourceId: event.sourceId,
    }, `Event: ${event.eventType}`);
  }
}

/**
 * Queue-based Event Publisher
 */
export class QueueEventPublisher implements EventPublisher {
  private queues: Map<string, QueueConsumer> = new Map();

  registerQueue(eventType: string, queue: QueueConsumer): void {
    this.queues.set(eventType, queue);
  }

  async publish(event: IngestionEvent): Promise<void> {
    const queue = this.queues.get(event.eventType);
    
    if (queue) {
      await queue.sendMessage(JSON.stringify(event), {
        eventType: event.eventType,
        source: event.source,
        timestamp: event.timestamp.toISOString(),
      });
    }
    
    logger.debug({ eventType: event.eventType }, 'Event published to queue');
  }
}

// ============================================================
// WORKER IMPLEMENTATION
// ============================================================

export interface IngestionWorkerConfig {
  queue: QueueConsumer;
  eventPublisher?: EventPublisher;
  batchSize?: number;
  pollInterval?: number;
  maxRetries?: number;
}

export class IngestionWorker {
  private config: IngestionWorkerConfig;
  private running = false;
  private processedCount = 0;
  private errorCount = 0;

  constructor(config: IngestionWorkerConfig) {
    this.config = {
      batchSize: 10,
      pollInterval: 1000,
      maxRetries: 3,
      ...config,
    };

    // Set up event publisher
    if (config.eventPublisher) {
      setEventPublisher(config.eventPublisher);
    }
  }

  /**
   * Start processing queue
   */
  async start(): Promise<void> {
    this.running = true;
    logger.info('Ingestion worker started');

    while (this.running) {
      try {
        await this.processBatch();
      } catch (err) {
        logger.error({ err }, 'Error processing batch');
        this.errorCount++;
      }

      // Wait before next poll
      await this.sleep(this.config.pollInterval!);
    }

    logger.info({
      processed: this.processedCount,
      errors: this.errorCount,
    }, 'Ingestion worker stopped');
  }

  /**
   * Stop processing
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Process a single batch of messages
   */
  private async processBatch(): Promise<void> {
    const messages = await this.config.queue.receiveMessages(this.config.batchSize);

    if (messages.length === 0) {
      return;
    }

    logger.debug({ count: messages.length }, 'Processing batch');

    for (const message of messages) {
      try {
        await this.processMessage(message);
        
        if (message.receiptHandle) {
          await this.config.queue.deleteMessage(message.receiptHandle);
        }
        
        this.processedCount++;
      } catch (err) {
        this.errorCount++;
        logger.error({
          err,
          messageId: message.id,
        }, 'Failed to process message');
        
        // Message will become visible again after visibility timeout
      }
    }
  }

  /**
   * Process a single message
   */
  private async processMessage(message: QueueMessage): Promise<void> {
    const product = JSON.parse(message.body) as CanonicalProduct;
    
    logger.debug({
      messageId: message.id,
      productName: product.name.substring(0, 50),
      source: product.source,
    }, 'Processing product');

    await productIngestionWorkflow(product);
  }

  /**
   * Get worker statistics
   */
  getStats(): { processed: number; errors: number; running: boolean } {
    return {
      processed: this.processedCount,
      errors: this.errorCount,
      running: this.running,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================
// FACTORY FUNCTIONS
// ============================================================

/**
 * Create worker for development (in-memory queue)
 */
export function createDevWorker(): { worker: IngestionWorker; queue: InMemoryQueue } {
  const queue = new InMemoryQueue();
  const eventPublisher = new ConsoleEventPublisher();
  
  const worker = new IngestionWorker({
    queue,
    eventPublisher,
    pollInterval: 100, // Faster for dev
  });

  return { worker, queue };
}

/**
 * Create worker for production (SQS)
 */
export function createProductionWorker(config: SQSQueueConfig): IngestionWorker {
  const queue = new SQSQueue(config);
  const eventPublisher = new QueueEventPublisher();
  
  return new IngestionWorker({
    queue,
    eventPublisher,
  });
}
