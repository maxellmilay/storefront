import { Router } from 'express';
import {
  confirmResetHandler,
  requestResetHandler,
} from '../controllers/passwordReset.controller.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { confirmResetSchema, requestResetSchema } from '../schemas/passwordReset.schema.js';

const router = Router();

router.post('/', rateLimit(5, 15 * 60 * 1000), validate(requestResetSchema), requestResetHandler);
router.post('/confirm', validate(confirmResetSchema), confirmResetHandler);

export default router;
