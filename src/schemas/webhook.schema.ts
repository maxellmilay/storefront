import { z } from 'zod';

export const paymentEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  data: z.object({
    orderId: z.string().min(1),
    paymentId: z.string().min(1),
    amountCents: z.number().int(),
  }),
});

export type PaymentEvent = z.infer<typeof paymentEventSchema>;
