import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { env } from './env.js';

export type EmailJob =
  { kind: 'order-confirmation'; orderId: string } | { kind: 'refund-issued'; refundId: string };

// BullMQ workers block on Redis, so they must not give up on slow commands.
export const redis = new Redis(env.redisUrl, { maxRetriesPerRequest: null });

export const emailQueue = new Queue<EmailJob>('emails', { connection: redis });
