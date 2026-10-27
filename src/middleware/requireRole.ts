import type { Role } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

/** Lets the request through only when the signed-in user has one of `roles`. */
export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to do this' });
    }
    next();
  };
}
