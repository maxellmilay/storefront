import { z } from 'zod';

export const createCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9]{4,32}$/, 'Code must be 4-32 letters or digits'),
    kind: z.enum(['PERCENT', 'FIXED']),
    amount: z.number().int().positive(),
    minSubtotalCents: z.number().int().min(0).default(0),
    expiresAt: z.coerce.date().optional(),
  })
  .refine((coupon) => coupon.kind !== 'PERCENT' || coupon.amount <= 100, {
    message: 'A percentage coupon cannot take off more than 100%',
    path: ['amount'],
  });

export type CreateCouponInput = z.infer<typeof createCouponSchema>;
