import { z } from 'zod';

export const MAX_ITEM_QUANTITY = 20;

const quantity = z.number().int().min(1).max(MAX_ITEM_QUANTITY);

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: quantity.default(1),
});

export const updateCartItemSchema = z.object({
  quantity,
});

export const applyCouponSchema = z.object({
  code: z.string().trim().min(1).max(32).toUpperCase(),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
