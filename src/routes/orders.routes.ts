import { Router } from 'express';
import {
  cancelOrderHandler,
  checkoutHandler,
  getOrderHandler,
  listOrdersHandler,
} from '../controllers/orders.controller.js';
import { createRefundHandler } from '../controllers/refunds.controller.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { checkoutSchema, listOrdersQuery } from '../schemas/order.schema.js';
import { createRefundSchema } from '../schemas/refund.schema.js';

const router = Router();

router.post('/', validate(checkoutSchema), checkoutHandler);
router.get('/', validate(listOrdersQuery, 'query'), listOrdersHandler);
router.get('/:orderId', getOrderHandler);
router.post('/:orderId/cancel', cancelOrderHandler);

router.post(
  '/:orderId/refunds',
  requireRole('STAFF', 'ADMIN'),
  validate(createRefundSchema),
  createRefundHandler,
);

export default router;
