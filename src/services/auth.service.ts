import bcrypt from 'bcrypt';
import { ConflictError, HttpError } from '../lib/errors.js';
import { signToken } from '../lib/jwt.js';
import { createUser, findUserByEmail } from '../repositories/users.repository.js';
import type { LoginInput, SignupInput } from '../schemas/auth.schema.js';

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function signup(input: SignupInput) {
  const email = input.email.toLowerCase();
  if (await findUserByEmail(email)) {
    throw new ConflictError('An account with this email already exists');
  }

  const user = await createUser({
    email,
    name: input.name,
    passwordHash: await hashPassword(input.password),
  });

  return { user, token: signToken(user.id) };
}

export async function login(input: LoginInput) {
  const user = await findUserByEmail(input.email.toLowerCase());

  // Same answer for an unknown email and a wrong password.
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  return {
    token: signToken(user.id),
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  };
}
