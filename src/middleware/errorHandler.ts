import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/errors.js';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.flatten().fieldErrors });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: a unique constraint, such as an email or a SKU, is already taken.
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'This value is already in use' });
    }
    // P2025: the record an update or delete targets does not exist.
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Resource not found' });
    }
  }

  console.error(`[${req.requestId}]`, err);
  return res.status(500).json({ error: 'Internal server error', requestId: req.requestId });
}
