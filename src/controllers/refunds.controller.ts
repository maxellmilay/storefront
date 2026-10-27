import type { Request, Response } from 'express';
import { issueRefund } from '../services/refunds.service.js';

export async function createRefundHandler(req: Request, res: Response) {
  const refund = await issueRefund(req.user!.id, req.params.orderId, req.body);
  res.status(201).json(refund);
}
