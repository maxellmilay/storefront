import type { Request, Response } from 'express';
import { handlePaymentEvent } from '../services/payments.service.js';

export async function paymentWebhookHandler(req: Request, res: Response) {
  res.json(await handlePaymentEvent(req.body));
}
