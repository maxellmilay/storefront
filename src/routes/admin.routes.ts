import { Router } from 'express';
import {
  changeRoleHandler,
  createCouponHandler,
  listUsersHandler,
  salesReportHandler,
} from '../controllers/admin.controller.js';
import { validate } from '../middleware/validate.js';
import { changeRoleSchema, listUsersQuery, salesReportQuery } from '../schemas/admin.schema.js';
import { createCouponSchema } from '../schemas/coupon.schema.js';

const router = Router();

router.get('/users', validate(listUsersQuery, 'query'), listUsersHandler);
router.patch('/users/:userId/role', validate(changeRoleSchema), changeRoleHandler);

router.post('/coupons', validate(createCouponSchema), createCouponHandler);

router.get('/reports/sales', validate(salesReportQuery, 'query'), salesReportHandler);

export default router;
