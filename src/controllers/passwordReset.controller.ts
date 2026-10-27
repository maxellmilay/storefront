import type { Request, Response } from 'express';
import { confirmPasswordReset, requestPasswordReset } from '../services/passwordReset.service.js';

export async function requestResetHandler(req: Request, res: Response) {
  await requestPasswordReset(req.body);
  res.status(202).json({ message: 'If that email has an account, a reset link is on its way' });
}

export async function confirmResetHandler(req: Request, res: Response) {
  await confirmPasswordReset(req.body);
  res.status(204).send();
}
