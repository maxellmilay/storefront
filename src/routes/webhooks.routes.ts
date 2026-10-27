import express, { Router } from 'express';
import { paymentWebhookHandler } from '../controllers/webhooks.controller.js';
import { verifyPaymentSignature } from '../middleware/verifySignature.js';

const router = Router();

router.post(
  '/payments',
  express.raw({ type: 'application/json', limit: '1mb' }),
  verifyPaymentSignature,
  paymentWebhookHandler,
);

export default router;
