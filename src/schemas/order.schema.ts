import { z } from 'zod';

export const checkoutSchema = z.object({
  addressId: z.string().min(1),
});

export const listOrdersQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuery>;
