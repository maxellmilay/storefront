import type { OrderStatus } from '@prisma/client';
import { formatCents } from '../lib/money.js';
import { prisma } from '../lib/prisma.js';
import type { SalesReportQuery } from '../schemas/admin.schema.js';

// Every order that was paid at some point, including those refunded since.
const SOLD: OrderStatus[] = ['PAID', 'PARTIALLY_REFUNDED', 'REFUNDED'];

/** Sales paid within [from, to), less the refunds issued in the same window. */
export async function salesReport({ from, to }: SalesReportQuery) {
  const [sales, refunds] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { in: SOLD }, paidAt: { gte: from, lt: to } },
      _count: true,
      _sum: { totalCents: true },
    }),
    prisma.refund.aggregate({
      where: { createdAt: { gte: from, lt: to } },
      _sum: { amountCents: true },
    }),
  ]);

  const grossCents = sales._sum.totalCents ?? 0;
  const refundedCents = refunds._sum.amountCents ?? 0;
  return {
    from,
    to,
    orders: sales._count,
    grossCents,
    refundedCents,
    netCents: grossCents - refundedCents,
    net: formatCents(grossCents - refundedCents),
  };
}
