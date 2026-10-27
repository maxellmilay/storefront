import { Router } from 'express';
import { loginHandler, signupHandler } from '../controllers/auth.controller.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, signupSchema } from '../schemas/auth.schema.js';
import passwordResetRouter from './passwordReset.routes.js';

const router = Router();

router.post('/signup', validate(signupSchema), signupHandler);
router.post('/login', rateLimit(10, 15 * 60 * 1000), validate(loginSchema), loginHandler);

router.use('/password-reset', passwordResetRouter);

export default router;
