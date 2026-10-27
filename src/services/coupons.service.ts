import type { Coupon } from '@prisma/client';
import { BadRequestError, NotFoundError } from '../lib/errors.js';
import { formatCents } from '../lib/money.js';
import { prisma } from '../lib/prisma.js';
import type { CreateCouponInput } from '../schemas/coupon.schema.js';

export function isUsable(coupon: Coupon, now = new Date()): boolean {
  return coupon.active && (coupon.expiresAt === null || coupon.expiresAt > now);
}

export async function findUsableCoupon(code: string) {
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !isUsable(coupon)) {
    throw new NotFoundError('This coupon does not exist or has expired');
  }
  return coupon;
}

export function assertMinimumMet(coupon: Coupon, subtotalCents: number) {
  if (subtotalCents < coupon.minSubtotalCents) {
    throw new BadRequestError(
      `This coupon needs an order of at least ${formatCents(coupon.minSubtotalCents)}`,
    );
  }
}

export function createCoupon(input: CreateCouponInput) {
  return prisma.coupon.create({ data: input });
}
