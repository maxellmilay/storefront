import type { Product } from '@prisma/client';
import { BadRequestError, ConflictError, NotFoundError } from '../lib/errors.js';
import { formatCents } from '../lib/money.js';
import {
  type CartWithContents,
  deleteCartItem,
  findCartItem,
  findOrCreateCart,
  saveItemQuantity,
  setCartCoupon,
} from '../repositories/carts.repository.js';
import { findProductOnSale } from '../repositories/products.repository.js';
import {
  type AddCartItemInput,
  type ApplyCouponInput,
  MAX_ITEM_QUANTITY,
  type UpdateCartItemInput,
} from '../schemas/cart.schema.js';
import { assertMinimumMet, findUsableCoupon } from './coupons.service.js';
import { computeTotals, type PricedLine, subtotalOf } from './pricing.service.js';

export function cartLines(cart: CartWithContents): PricedLine[] {
  return cart.items.map((item) => ({
    unitPriceCents: item.product.priceCents,
    quantity: item.quantity,
  }));
}

function assertCanHold(product: Product, quantity: number) {
  if (quantity > MAX_ITEM_QUANTITY) {
    throw new BadRequestError(`You can buy at most ${MAX_ITEM_QUANTITY} of one product`);
  }
  if (quantity > product.stock) {
    throw new ConflictError(`Only ${product.stock} of ${product.name} left in stock`);
  }
}

// The coupon minimum is checked when a coupon is applied, so it must be checked
// again whenever the cart shrinks. Otherwise a shopper could apply the coupon,
// then remove items and still get the discount.
async function dropCouponIfBelowMinimum(userId: string) {
  const cart = await findOrCreateCart(userId);
  if (cart.coupon && subtotalOf(cartLines(cart)) < cart.coupon.minSubtotalCents) {
    await setCartCoupon(cart.id, null);
  }
}

export async function getCart(userId: string) {
  const cart = await findOrCreateCart(userId);
  const totals = computeTotals(cartLines(cart), cart.coupon);

  return {
    id: cart.id,
    items: cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      unitPriceCents: item.product.priceCents,
      quantity: item.quantity,
    })),
    coupon: cart.coupon?.code ?? null,
    ...totals,
    total: formatCents(totals.totalCents),
  };
}

export async function addItem(userId: string, input: AddCartItemInput) {
  const product = await findProductOnSale(input.productId);
  if (!product) {
    throw new NotFoundError('Product not found');
  }

  const cart = await findOrCreateCart(userId);
  const inCart = cart.items.find((item) => item.productId === product.id)?.quantity ?? 0;
  assertCanHold(product, inCart + input.quantity);

  await saveItemQuantity(cart.id, product.id, inCart + input.quantity);
  return getCart(userId);
}

export async function updateItem(userId: string, itemId: string, input: UpdateCartItemInput) {
  const item = await findCartItem(userId, itemId);
  if (!item) {
    throw new NotFoundError('Cart item not found');
  }
  assertCanHold(item.product, input.quantity);

  await saveItemQuantity(item.cartId, item.productId, input.quantity);
  await dropCouponIfBelowMinimum(userId);
  return getCart(userId);
}

export async function removeItem(userId: string, itemId: string) {
  const item = await findCartItem(userId, itemId);
  if (!item) {
    throw new NotFoundError('Cart item not found');
  }

  await deleteCartItem(item.cartId, item.id);
  await dropCouponIfBelowMinimum(userId);
  return getCart(userId);
}

export async function applyCoupon(userId: string, input: ApplyCouponInput) {
  const coupon = await findUsableCoupon(input.code);
  const cart = await findOrCreateCart(userId);
  assertMinimumMet(coupon, subtotalOf(cartLines(cart)));

  await setCartCoupon(cart.id, coupon.id);
  return getCart(userId);
}

export async function removeCoupon(userId: string) {
  const cart = await findOrCreateCart(userId);
  await setCartCoupon(cart.id, null);
  return getCart(userId);
}
