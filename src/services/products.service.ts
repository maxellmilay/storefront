import type { Role } from '@prisma/client';
import { BadRequestError, ConflictError, NotFoundError } from '../lib/errors.js';
import * as products from '../repositories/products.repository.js';
import type {
  AdjustStockInput,
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from '../schemas/product.schema.js';

const CATALOG_MANAGERS: Role[] = ['STAFF', 'ADMIN'];

async function assertCategoryExists(categoryId: string | undefined) {
  if (categoryId && !(await products.findCategoryById(categoryId))) {
    throw new BadRequestError('Unknown category');
  }
}

export function listProducts(query: ListProductsQuery, viewerRole: Role | undefined) {
  // Only people who manage the catalog may ask to see archived products.
  const canSeeArchived = viewerRole !== undefined && CATALOG_MANAGERS.includes(viewerRole);

  return products.listProducts({
    q: query.q,
    categoryId: query.categoryId,
    includeArchived: canSeeArchived && query.includeArchived === 'true',
    skip: (query.page - 1) * query.limit,
    take: query.limit,
  });
}

export async function getProduct(productId: string) {
  const product = await products.findProductById(productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }
  return product;
}

export async function createProduct(input: CreateProductInput) {
  await assertCategoryExists(input.categoryId);
  return products.createProduct(input);
}

export async function updateProduct(productId: string, input: UpdateProductInput) {
  await assertCategoryExists(input.categoryId);
  return products.updateProduct(productId, input);
}

export async function archiveProduct(productId: string) {
  await products.archiveProduct(productId);
}

export async function adjustStock(productId: string, input: AdjustStockInput) {
  await getProduct(productId);

  const changed = await products.changeStock(productId, input.delta);
  if (changed === 0) {
    throw new ConflictError('Stock cannot go below zero');
  }
  return getProduct(productId);
}

export function listCategories() {
  return products.listCategories();
}
