import { z } from 'zod';

export const updateAccountSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    email: z.string().email().optional(),
  })
  .refine((input) => input.name !== undefined || input.email !== undefined, {
    message: 'Nothing to update',
  });

export const createAddressSchema = z.object({
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(3).max(12),
  country: z.string().length(2).toUpperCase(),
});

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;
