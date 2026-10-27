import type { Request, Response } from 'express';
import { login, signup } from '../services/auth.service.js';

export async function signupHandler(req: Request, res: Response) {
  const result = await signup(req.body);
  res.status(201).json(result);
}

export async function loginHandler(req: Request, res: Response) {
  const result = await login(req.body);
  res.json(result);
}
