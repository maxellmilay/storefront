import jwt from 'jsonwebtoken';
import { env } from './env.js';

const TOKEN_TTL = '7d';

export interface TokenPayload {
  sub: string;
}

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
}
