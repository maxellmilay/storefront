import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type Db = Prisma.TransactionClient;

const cartContents = {
  items: { include: { product: true }, orderBy: { id: 'asc' } },
  coupon: true,
} satisfies Prisma.CartInclude;

export type CartWithContents = Prisma.CartGetPayload<{ include: typeof cartContents }>;

// Item changes are written through the cart so that its `updatedAt` moves,
// which is what the abandoned-cart cleanup reads.

export function findOrCreateCart(userId: string): Promise<CartWithContents> {
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: cartContents,
  });
}

export function findCartItem(userId: string, itemId: string) {
  return prisma.cartItem.findFirst({
    where: { id: itemId, cart: { userId } },
    include: { product: true },
  });
}

export function saveItemQuantity(cartId: string, productId: string, quantity: number) {
  return prisma.cart.update({
    where: { id: cartId },
    data: {
      items: {
        upsert: {
          where: { cartId_productId: { cartId, productId } },
          create: { productId, quantity },
          update: { quantity },
        },
      },
    },
  });
}

export function deleteCartItem(cartId: string, itemId: string) {
  return prisma.cart.update({
    where: { id: cartId },
    data: { items: { delete: { id: itemId } } },
  });
}

export function setCartCoupon(cartId: string, couponId: string | null) {
  return prisma.cart.update({ where: { id: cartId }, data: { couponId } });
}

export function emptyCart(cartId: string, db: Db = prisma) {
  return db.cart.update({
    where: { id: cartId },
    data: { couponId: null, items: { deleteMany: {} } },
  });
}

export function deleteCartsUntouchedSince(cutoff: Date) {
  return prisma.cart.deleteMany({ where: { updatedAt: { lt: cutoff } } });
}
