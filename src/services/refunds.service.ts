import type { Order, OrderStatus } from '@prisma/client';
import { BadRequestError, ConflictError, NotFoundError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { emailQueue } from '../lib/queue.js';
import {
  findOrderById,
  setOrderStatus,
  sumRefundedCents,
} from '../repositories/orders.repository.js';
import type { CreateRefundInput } from '../schemas/refund.schema.js';

const REFUNDABLE: OrderStatus[] = ['PAID', 'PARTIALLY_REFUNDED'];

function assertRefundable(order: Order, amountCents: number) {
  if (!REFUNDABLE.includes(order.status)) {
    throw new ConflictError('Only a paid order can be refunded');
  }
  if (amountCents > order.totalCents) {
    throw new BadRequestError('A refund cannot be more than the order total');
  }
}

/** Refunds part or all of a paid order and emails the customer. */
export async function issueRefund(issuedById: string, orderId: string, input: CreateRefundInput) {
  const order = await findOrderById(orderId);
  if (!order) {
    throw new NotFoundError('Order not found');
  }
  assertRefundable(order, input.amountCents);

  const refund = await prisma.$transaction(async (tx) => {
    const created = await tx.refund.create({
      data: { orderId: order.id, amountCents: input.amountCents, reason: input.reason, issuedById },
    });
    const refunded = await sumRefundedCents(order.id, tx);
    await setOrderStatus(
      order.id,
      refunded >= order.totalCents ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      tx,
    );
    return created;
  });

  await emailQueue.add('refund-issued', { kind: 'refund-issued', refundId: refund.id });
  return refund;
}
