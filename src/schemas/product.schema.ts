import { z } from 'zod';

export const listProductsQuery = z.object({
  q: z.string().trim().max(100).optional(),
  categoryId: z.string().optional(),
  includeArchived: z.enum(['true', 'false']).default('false'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const createProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .regex(/^[A-Z0-9-]{3,32}$/, 'SKU must be 3-32 upper-case letters, digits or dashes'),
  name: z.string().trim().min(1).max(200),
  description: z.string().max(5000).optional(),
  priceCents: z.number().int().positive(),
  stock: z.number().int().min(0).default(0),
  categoryId: z.string().optional(),
});

export const updateProductSchema = createProductSchema.omit({ sku: true, stock: true }).partial();

export const adjustStockSchema = z.object({
  delta: z
    .number()
    .int()
    .refine((delta) => delta !== 0, 'Delta must not be zero'),
});

export type ListProductsQuery = z.infer<typeof listProductsQuery>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
