import type { Request, Response } from 'express';
import type { ListOrdersQuery } from '../schemas/order.schema.js';
import { cancelOrder, getOrder, listOrders, placeOrder } from '../services/orders.service.js';

export async function checkoutHandler(req: Request, res: Response) {
  const order = await placeOrder(req.user!.id, req.body);
  res.status(201).json(order);
}

export async function listOrdersHandler(req: Request, res: Response) {
  const query: ListOrdersQuery = res.locals.query;
  res.json(await listOrders(req.user!.id, query));
}

export async function getOrderHandler(req: Request, res: Response) {
  res.json(await getOrder(req.user!, req.params.orderId));
}

export async function cancelOrderHandler(req: Request, res: Response) {
  res.json(await cancelOrder(req.user!.id, req.params.orderId));
}
