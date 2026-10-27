import type { Request, Response } from 'express';
import {
  addItem,
  applyCoupon,
  getCart,
  removeCoupon,
  removeItem,
  updateItem,
} from '../services/cart.service.js';

export async function getCartHandler(req: Request, res: Response) {
  res.json(await getCart(req.user!.id));
}

export async function addItemHandler(req: Request, res: Response) {
  const cart = await addItem(req.user!.id, req.body);
  res.status(201).json(cart);
}

export async function updateItemHandler(req: Request, res: Response) {
  res.json(await updateItem(req.user!.id, req.params.itemId, req.body));
}

export async function removeItemHandler(req: Request, res: Response) {
  res.json(await removeItem(req.user!.id, req.params.itemId));
}

export async function applyCouponHandler(req: Request, res: Response) {
  res.json(await applyCoupon(req.user!.id, req.body));
}

export async function removeCouponHandler(req: Request, res: Response) {
  res.json(await removeCoupon(req.user!.id));
}
