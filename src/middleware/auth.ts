import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../lib/jwt.js';
import { findUserById } from '../repositories/users.repository.js';

function bearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  return header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : undefined;
}

// The role is read from the database on every request, so a role change
// takes effect at once rather than when the token expires.
async function userFromToken(token: string) {
  let userId: string;
  try {
    userId = verifyToken(token).sub;
  } catch {
    return undefined;
  }

  const user = await findUserById(userId);
  return user ? { id: user.id, email: user.email, role: user.role } : undefined;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const user = await userFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = user;
  next();
}

/** Identifies the caller when a valid token is sent; anyone else browses anonymously. */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = bearerToken(req);
  if (token) {
    req.user = await userFromToken(token);
  }
  next();
}
