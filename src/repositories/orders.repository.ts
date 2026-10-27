import type { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type Db = Prisma.TransactionClient;

const orderDetails = {
  items: true,
  refunds: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.OrderInclude;

export type OrderWithDetails = Prisma.OrderGetPayload<{ include: typeof orderDetails }>;

export function createOrder(data: Prisma.OrderUncheckedCreateInput, db: Db = prisma) {
  return db.order.create({ data, include: orderDetails });
}

export function findOrderById(id: string, db: Db = prisma): Promise<OrderWithDetails | null> {
  return db.order.findUnique({ where: { id }, include: orderDetails });
}

export function listOrdersForUser(userId: string, skip: number, take: number) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip,
    take,
  });
}

export function findOrderForEmail(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { email: true, name: true } } },
  });
}

export function findPendingOrdersCreatedBefore(cutoff: Date) {
  return prisma.order.findMany({
    where: { status: 'PENDING', createdAt: { lt: cutoff } },
    include: { items: true },
  });
}

/**
 * Moves an order out of `from` only if it is still there, so two writers
 * (a payment and a cancellation) cannot both win. Returns the rows changed.
 */
export async function transitionOrder(
  id: string,
  from: OrderStatus,
  data: Prisma.OrderUpdateManyMutationInput,
  db: Db = prisma,
) {
  const { count } = await db.order.updateMany({ where: { id, status: from }, data });
  return count;
}

export function setOrderStatus(id: string, status: OrderStatus, db: Db = prisma) {
  return db.order.update({ where: { id }, data: { status } });
}

export async function sumRefundedCents(orderId: string, db: Db = prisma) {
  const result = await db.refund.aggregate({ where: { orderId }, _sum: { amountCents: true } });
  return result._sum.amountCents ?? 0;
}
