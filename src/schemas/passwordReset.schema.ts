import { z } from 'zod';

export const requestResetSchema = z.object({
  email: z.string().email(),
});

export const confirmResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export type RequestResetInput = z.infer<typeof requestResetSchema>;
export type ConfirmResetInput = z.infer<typeof confirmResetSchema>;
