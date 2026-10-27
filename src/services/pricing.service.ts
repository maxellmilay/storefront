import type { Coupon } from '@prisma/client';
import { percentOf } from '../lib/money.js';

export const TAX_RATE_PERCENT = 8;
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000;
export const FLAT_SHIPPING_CENTS = 599;

export interface PricedLine {
  unitPriceCents: number;
  quantity: number;
}

export interface Totals {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
}

export function subtotalOf(lines: PricedLine[]): number {
  return lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
}

export function couponDiscount(coupon: Coupon | null, subtotalCents: number): number {
  if (!coupon) {
    return 0;
  }
  const discount =
    coupon.kind === 'PERCENT' ? percentOf(subtotalCents, coupon.amount) : coupon.amount;
  // A fixed coupon worth more than the goods brings them to zero, never below.
  return Math.min(discount, subtotalCents);
}

/** Shipping is charged on the goods after the discount, before tax. */
export function shippingFor(discountedCents: number): number {
  return discountedCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : FLAT_SHIPPING_CENTS;
}

/** The price breakdown shown in the cart and charged at checkout. */
export function computeTotals(lines: PricedLine[], coupon: Coupon | null): Totals {
  const subtotalCents = subtotalOf(lines);
  const discountCents = couponDiscount(coupon, subtotalCents);
  const discountedCents = subtotalCents - discountCents;
  const taxCents = percentOf(discountedCents, TAX_RATE_PERCENT);
  const shippingCents = lines.length === 0 ? 0 : shippingFor(discountedCents);

  return {
    subtotalCents,
    discountCents,
    taxCents,
    shippingCents,
    totalCents: discountedCents + taxCents + shippingCents,
  };
}
