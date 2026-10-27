import { Router } from 'express';
import {
  addItemHandler,
  applyCouponHandler,
  getCartHandler,
  removeCouponHandler,
  removeItemHandler,
  updateItemHandler,
} from '../controllers/cart.controller.js';
import { validate } from '../middleware/validate.js';
import {
  addCartItemSchema,
  applyCouponSchema,
  updateCartItemSchema,
} from '../schemas/cart.schema.js';

const router = Router();

router.get('/', getCartHandler);

router.post('/items', validate(addCartItemSchema), addItemHandler);
router.patch('/items/:itemId', validate(updateCartItemSchema), updateItemHandler);
router.delete('/items/:itemId', removeItemHandler);

router.post('/coupon', validate(applyCouponSchema), applyCouponHandler);
router.delete('/coupon', removeCouponHandler);

export default router;
