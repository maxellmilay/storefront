import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type Db = Prisma.TransactionClient;

export interface ProductFilter {
  q?: string;
  categoryId?: string;
  includeArchived: boolean;
  skip: number;
  take: number;
}

// Archived products stay in the database for past orders but are no longer sold.
function onSale(where: Prisma.ProductWhereInput): Prisma.ProductWhereInput {
  return { ...where, archivedAt: null };
}

export function listProducts(filter: ProductFilter) {
  const where: Prisma.ProductWhereInput = {
    categoryId: filter.categoryId,
    name: filter.q ? { contains: filter.q, mode: 'insensitive' } : undefined,
  };

  return prisma.product.findMany({
    where: filter.includeArchived ? where : onSale(where),
    orderBy: { name: 'asc' },
    skip: filter.skip,
    take: filter.take,
  });
}

export function findProductById(id: string) {
  return prisma.product.findUnique({ where: { id }, include: { category: true } });
}

export function findProductOnSale(id: string) {
  return prisma.product.findFirst({ where: onSale({ id }) });
}

export function createProduct(data: Prisma.ProductUncheckedCreateInput) {
  return prisma.product.create({ data });
}

export function updateProduct(id: string, data: Prisma.ProductUncheckedUpdateInput) {
  return prisma.product.update({ where: { id }, data });
}

export function archiveProduct(id: string) {
  return prisma.product.update({ where: { id }, data: { archivedAt: new Date() } });
}

/**
 * Adds `delta` to a product's stock in one statement, unless that would take
 * it below zero. Returns how many rows changed: 0 when the stock was short.
 */
export async function changeStock(id: string, delta: number, db: Db = prisma) {
  const { count } = await db.product.updateMany({
    where: { id, stock: { gte: Math.max(0, -delta) } },
    data: { stock: { increment: delta } },
  });
  return count;
}

export function listCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } });
}

export function findCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}
