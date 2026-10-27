import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

/** Tags each request with an id, kept from the caller when it sends one, for support. */
export function requestId(req: Request, res: Response, next: NextFunction) {
  const incoming = req.get('x-request-id');
  req.requestId = incoming && incoming.length <= 64 ? incoming : randomUUID();
  res.setHeader('X-Request-Id', req.requestId);
  next();
}
