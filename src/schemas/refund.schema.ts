import { z } from 'zod';

export const createRefundSchema = z.object({
  amountCents: z.number().int().positive(),
  reason: z.string().trim().min(3).max(500),
});

export type CreateRefundInput = z.infer<typeof createRefundSchema>;
