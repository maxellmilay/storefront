import { deleteCartsUntouchedSince } from '../repositories/carts.repository.js';

const ABANDONED_AFTER_DAYS = 14;

/** Deletes carts nobody has changed for two weeks, with their items; their coupons are kept. */
export async function pruneAbandonedCarts() {
  const cutoff = new Date(Date.now() - ABANDONED_AFTER_DAYS * 24 * 60 * 60 * 1000);
  const { count } = await deleteCartsUntouchedSince(cutoff);

  console.log(`[jobs] deleted ${count} abandoned cart(s)`);
}
