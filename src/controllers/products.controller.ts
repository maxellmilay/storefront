import type { Request, Response } from 'express';
import type { ListProductsQuery } from '../schemas/product.schema.js';
import {
  adjustStock,
  archiveProduct,
  createProduct,
  getProduct,
  listCategories,
  listProducts,
  updateProduct,
} from '../services/products.service.js';

export async function listProductsHandler(req: Request, res: Response) {
  const query: ListProductsQuery = res.locals.query;
  res.json(await listProducts(query, req.user?.role));
}

export async function getProductHandler(req: Request, res: Response) {
  res.json(await getProduct(req.params.productId));
}

export async function createProductHandler(req: Request, res: Response) {
  const product = await createProduct(req.body);
  res.status(201).json(product);
}

export async function updateProductHandler(req: Request, res: Response) {
  res.json(await updateProduct(req.params.productId, req.body));
}

export async function archiveProductHandler(req: Request, res: Response) {
  await archiveProduct(req.params.productId);
  res.status(204).send();
}

export async function adjustStockHandler(req: Request, res: Response) {
  res.json(await adjustStock(req.params.productId, req.body));
}

export async function listCategoriesHandler(_req: Request, res: Response) {
  res.json(await listCategories());
}
