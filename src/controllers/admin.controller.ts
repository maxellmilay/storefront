import type { Request, Response } from 'express';
import type { ListUsersQuery, SalesReportQuery } from '../schemas/admin.schema.js';
import { createCoupon } from '../services/coupons.service.js';
import { salesReport } from '../services/reports.service.js';
import { changeRole, listAccounts } from '../services/users.service.js';

export async function listUsersHandler(_req: Request, res: Response) {
  const query: ListUsersQuery = res.locals.query;
  res.json(await listAccounts(query));
}

export async function changeRoleHandler(req: Request, res: Response) {
  res.json(await changeRole(req.user!.id, req.params.userId, req.body));
}

export async function createCouponHandler(req: Request, res: Response) {
  const coupon = await createCoupon(req.body);
  res.status(201).json(coupon);
}

export async function salesReportHandler(_req: Request, res: Response) {
  const query: SalesReportQuery = res.locals.query;
  res.json(await salesReport(query));
}
