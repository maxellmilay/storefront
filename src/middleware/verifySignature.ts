import { createHmac, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../lib/env.js';

/**
 * Accepts a payment webhook only when its `X-Signature` header is the
 * HMAC-SHA256 of the raw body under the shared secret.
 */
export function verifyPaymentSignature(req: Request, res: Response, next: NextFunction) {
  const signature = req.get('x-signature');
  if (!signature || !Buffer.isBuffer(req.body)) {
    return res.status(401).json({ error: 'Missing signature' });
  }

  const expected = createHmac('sha256', env.paymentWebhookSecret).update(req.body).digest('hex');
  const given = Buffer.from(signature, 'utf8');
  const wanted = Buffer.from(expected, 'utf8');
  if (given.length !== wanted.length || !timingSafeEqual(given, wanted)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  next();
}
