import type { Role } from '@prisma/client';
import { BadRequestError, ConflictError, NotFoundError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { emptyCart, findOrCreateCart } from '../repositories/carts.repository.js';
import {
  createOrder,
  findOrderById,
  listOrdersForUser,
  transitionOrder,
} from '../repositories/orders.repository.js';
import type { CheckoutInput, ListOrdersQuery } from '../schemas/order.schema.js';
import { cartLines } from './cart.service.js';
import { assertMinimumMet, isUsable } from './coupons.service.js';
import { reserveStock } from './inventory.service.js';
import { computeTotals, subtotalOf } from './pricing.service.js';

interface Viewer {
  id: string;
  role: Role;
}

async function findShippingAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) {
    throw new BadRequestError('Choose one of your saved addresses');
  }
  const { line1, line2, city, postalCode, country } = address;
  return { line1, line2, city, postalCode, country };
}

/** Turns the caller's cart into a pending order, reserving its stock. */
export async function placeOrder(userId: string, input: CheckoutInput) {
  const shippingAddress = await findShippingAddress(userId, input.addressId);
  const cart = await findOrCreateCart(userId);
  if (cart.items.length === 0) {
    throw new BadRequestError('Your cart is empty');
  }

  const retired = cart.items.find((item) => item.product.archivedAt !== null);
  if (retired) {
    throw new BadRequestError(`${retired.product.name} is no longer sold`);
  }
  if (cart.coupon && !isUsable(cart.coupon)) {
    throw new BadRequestError('The coupon on your cart has expired');
  }
  // Prices can drop after the coupon was applied, so check its minimum again.
  if (cart.coupon) {
    assertMinimumMet(cart.coupon, subtotalOf(cartLines(cart)));
  }

  const totals = computeTotals(cartLines(cart), cart.coupon);
  const lines = cart.items.map((item) => ({
    productId: item.productId,
    name: item.product.name,
    unitPriceCents: item.product.priceCents,
    quantity: item.quantity,
  }));

  return prisma.$transaction(async (tx) => {
    await reserveStock(tx, lines);
    const order = await createOrder(
      {
        userId,
        shippingAddress,
        couponId: cart.coupon?.id,
        ...totals,
        items: { create: lines },
      },
      tx,
    );
    await emptyCart(cart.id, tx);
    return order;
  });
}

export function listOrders(userId: string, query: ListOrdersQuery) {
  return listOrdersForUser(userId, (query.page - 1) * query.limit, query.limit);
}

/** Customers see their own orders; staff and admins see any order. */
export async function getOrder(viewer: Viewer, orderId: string) {
  const order = await findOrderById(orderId);
  if (!order || (viewer.role === 'CUSTOMER' && order.userId !== viewer.id)) {
    throw new NotFoundError('Order not found');
  }
  return order;
}

export async function cancelOrder(userId: string, orderId: string) {
  const order = await findOrderById(orderId);
  if (!order || order.userId !== userId) {
    throw new NotFoundError('Order not found');
  }

  const cancelledAt = new Date();
  const changed = await transitionOrder(order.id, 'PENDING', { status: 'CANCELLED', cancelledAt });
  if (changed === 0) {
    throw new ConflictError('Only an unpaid order can be cancelled');
  }
  return { ...order, status: 'CANCELLED', cancelledAt };
}
