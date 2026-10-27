import { Router } from 'express';
import {
  createAddressHandler,
  deleteAddressHandler,
  getAccountHandler,
  listAddressesHandler,
  updateAccountHandler,
} from '../controllers/account.controller.js';
import { validate } from '../middleware/validate.js';
import { createAddressSchema, updateAccountSchema } from '../schemas/account.schema.js';

const router = Router();

router.get('/', getAccountHandler);
router.patch('/', validate(updateAccountSchema), updateAccountHandler);

router.get('/addresses', listAddressesHandler);
router.post('/addresses', validate(createAddressSchema), createAddressHandler);
router.delete('/addresses/:addressId', deleteAddressHandler);

export default router;
