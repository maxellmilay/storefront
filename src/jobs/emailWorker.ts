import { type Job, Worker } from 'bullmq';
import { sendEmail } from '../lib/mailer.js';
import { formatCents } from '../lib/money.js';
import { prisma } from '../lib/prisma.js';
import { type EmailJob, redis } from '../lib/queue.js';
import { findOrderForEmail } from '../repositories/orders.repository.js';

async function sendOrderConfirmation(orderId: string) {
  const order = await findOrderForEmail(orderId);
  if (!order) {
    return;
  }

  const lines = order.items.map(
    (item) =>
      `${item.quantity} x ${item.name}: ${formatCents(item.unitPriceCents * item.quantity)}`,
  );
  await sendEmail({
    to: order.user.email,
    subject: `Your order ${order.id} is confirmed`,
    text: [`Hi ${order.user.name},`, ...lines, `Total paid: ${formatCents(order.totalCents)}`].join(
      '\n',
    ),
  });
}

async function sendRefundNotice(refundId: string) {
  const refund = await prisma.refund.findUnique({
    where: { id: refundId },
    include: { order: { include: { user: { select: { email: true, name: true } } } } },
  });
  if (!refund) {
    return;
  }

  await sendEmail({
    to: refund.order.user.email,
    subject: `Refund for order ${refund.orderId}`,
    text: `Hi ${refund.order.user.name}, we refunded ${formatCents(refund.amountCents)}: ${refund.reason}`,
  });
}

export async function processEmailJob(job: Job<EmailJob>) {
  switch (job.data.kind) {
    case 'order-confirmation':
      return sendOrderConfirmation(job.data.orderId);
    case 'refund-issued':
      return sendRefundNotice(job.data.refundId);
  }
}

export const emailWorker = new Worker<EmailJob>('emails', processEmailJob, {
  connection: redis,
  concurrency: 5,
});
