import type { Prisma } from '@prisma/client';
import { ConflictError } from '../lib/errors.js';
import { changeStock } from '../repositories/products.repository.js';

interface StockLine {
  productId: string;
  name: string;
  quantity: number;
}

/** Takes each line's quantity out of stock, or fails the whole transaction. */
export async function reserveStock(tx: Prisma.TransactionClient, lines: StockLine[]) {
  for (const line of lines) {
    const changed = await changeStock(line.productId, -line.quantity, tx);
    if (changed === 0) {
      throw new ConflictError(`${line.name} is out of stock`);
    }
  }
}

export async function restock(tx: Prisma.TransactionClient, lines: StockLine[]) {
  for (const line of lines) {
    await changeStock(line.productId, line.quantity, tx);
  }
}
