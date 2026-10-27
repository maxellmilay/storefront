import type { Prisma } from '@prisma/client';
import { BadRequestError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { emailQueue } from '../lib/queue.js';
import { findOrderById, transitionOrder } from '../repositories/orders.repository.js';
import { type PaymentEvent, paymentEventSchema } from '../schemas/webhook.schema.js';

function parseEvent(rawBody: Buffer): PaymentEvent {
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString('utf8'));
  } catch {
    throw new BadRequestError('The webhook body is not JSON');
  }
  return paymentEventSchema.parse(payload);
}

/**
 * Records a payment against its order. Returns the paid order's id, or null
 * when the payment cannot apply (unknown order, wrong amount, or an order no
 * longer waiting for payment).
 */
async function applyPayment(event: PaymentEvent, tx: Prisma.TransactionClient) {
  const order = await findOrderById(event.data.orderId, tx);
  if (!order || order.totalCents !== event.data.amountCents) {
    console.warn(`[payments] event ${event.id} does not match order ${event.data.orderId}`);
    return null;
  }

  const changed = await transitionOrder(
    order.id,
    'PENDING',
    { status: 'PAID', paidAt: new Date() },
    tx,
  );
  if (changed === 0) {
    console.warn(`[payments] order ${order.id} was ${order.status} when its payment arrived`);
    return null;
  }

  await tx.payment.create({
    data: {
      orderId: order.id,
      providerPaymentId: event.data.paymentId,
      amountCents: event.data.amountCents,
    },
  });
  return order.id;
}

/**
 * Handles one provider event at most once: its id is stored in the same
 * transaction as its effects, so a retried delivery is acknowledged and skipped.
 */
export async function handlePaymentEvent(rawBody: Buffer) {
  const event = parseEvent(rawBody);

  const seen = await prisma.webhookEvent.findUnique({ where: { id: event.id } });
  if (seen) {
    return { received: true, duplicate: true };
  }

  const paidOrderId = await prisma.$transaction(async (tx) => {
    await tx.webhookEvent.create({ data: { id: event.id, type: event.type } });
    return event.type === 'payment.succeeded' ? applyPayment(event, tx) : null;
  });

  if (paidOrderId) {
    await emailQueue.add('order-confirmation', {
      kind: 'order-confirmation',
      orderId: paidOrderId,
    });
  }
  return { received: true, duplicate: false };
}
