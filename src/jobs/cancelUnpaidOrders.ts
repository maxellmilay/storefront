import { prisma } from '../lib/prisma.js';
import {
  findPendingOrdersCreatedBefore,
  transitionOrder,
} from '../repositories/orders.repository.js';
import { restock } from '../services/inventory.service.js';

const UNPAID_ORDER_WINDOW_MS = 30 * 60 * 1000;

/** Cancels orders still unpaid after the payment window and returns their stock. */
export async function cancelUnpaidOrders() {
  const cutoff = new Date(Date.now() - UNPAID_ORDER_WINDOW_MS);
  const stale = await findPendingOrdersCreatedBefore(cutoff);

  let cancelled = 0;
  for (const order of stale) {
    const changed = await prisma.$transaction(async (tx) => {
      // A payment may have arrived since the query; only a still-pending order is cancelled.
      const moved = await transitionOrder(
        order.id,
        'PENDING',
        { status: 'CANCELLED', cancelledAt: new Date() },
        tx,
      );
      if (moved > 0) {
        await restock(tx, order.items);
      }
      return moved;
    });
    cancelled += changed;
  }

  console.log(`[jobs] cancelled ${cancelled} unpaid order(s)`);
}
