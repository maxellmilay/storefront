import { Router } from 'express';
import {
  adjustStockHandler,
  archiveProductHandler,
  createProductHandler,
  getProductHandler,
  listProductsHandler,
  updateProductHandler,
} from '../controllers/products.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import {
  adjustStockSchema,
  createProductSchema,
  listProductsQuery,
  updateProductSchema,
} from '../schemas/product.schema.js';

const router = Router();

router.get('/', validate(listProductsQuery, 'query'), listProductsHandler);
router.get('/:productId', getProductHandler);

router.post(
  '/',
  requireAuth,
  requireRole('STAFF', 'ADMIN'),
  validate(createProductSchema),
  createProductHandler,
);
router.patch(
  '/:productId',
  requireAuth,
  requireRole('STAFF', 'ADMIN'),
  validate(updateProductSchema),
  updateProductHandler,
);
router.delete('/:productId', requireAuth, requireRole('STAFF', 'ADMIN'), archiveProductHandler);
router.patch(
  '/:productId/stock',
  requireAuth,
  requireRole('STAFF', 'ADMIN'),
  validate(adjustStockSchema),
  adjustStockHandler,
);

export default router;
