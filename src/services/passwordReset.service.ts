import { createHash, randomBytes } from 'node:crypto';
import { env } from '../lib/env.js';
import { BadRequestError } from '../lib/errors.js';
import { sendEmail } from '../lib/mailer.js';
import { prisma } from '../lib/prisma.js';
import { findUserByEmail, updatePassword } from '../repositories/users.repository.js';
import type { ConfirmResetInput, RequestResetInput } from '../schemas/passwordReset.schema.js';
import { hashPassword } from './auth.service.js';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

// Only a hash is stored, so a leaked table cannot be used to reset passwords.
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function requestPasswordReset(input: RequestResetInput) {
  const user = await findUserByEmail(input.email.toLowerCase());
  // The caller gets the same answer either way, so emails cannot be probed.
  if (!user) {
    return;
  }

  const token = randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  await sendEmail({
    to: user.email,
    subject: 'Reset your password',
    text: `Choose a new password within the hour: ${env.storeUrl}/reset-password?token=${token}`,
  });
}

export async function confirmPasswordReset(input: ConfirmResetInput) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
  });
  if (!record || record.usedAt || record.expiresAt <= new Date()) {
    throw new BadRequestError('This reset link is invalid or has expired');
  }

  const passwordHash = await hashPassword(input.password);
  await prisma.$transaction(async (tx) => {
    await updatePassword(record.userId, passwordHash, tx);
    // Using one link spends every other open link for the account.
    await tx.passwordResetToken.updateMany({
      where: { userId: record.userId, usedAt: null },
      data: { usedAt: new Date() },
    });
  });
}
