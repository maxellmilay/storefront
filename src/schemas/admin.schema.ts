import { z } from 'zod';

const role = z.enum(['CUSTOMER', 'STAFF', 'ADMIN']);

export const listUsersQuery = z.object({
  role: role.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

export const changeRoleSchema = z.object({
  role,
});

export const salesReportQuery = z
  .object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  })
  .refine((range) => range.from < range.to, { message: '`from` must be before `to`' });

export type ListUsersQuery = z.infer<typeof listUsersQuery>;
export type ChangeRoleInput = z.infer<typeof changeRoleSchema>;
export type SalesReportQuery = z.infer<typeof salesReportQuery>;
