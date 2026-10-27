import { BadRequestError, NotFoundError } from '../lib/errors.js';
import { prisma } from '../lib/prisma.js';
import { getProfile, updateUser } from '../repositories/users.repository.js';
import type { CreateAddressInput, UpdateAccountInput } from '../schemas/account.schema.js';

const MAX_ADDRESSES = 5;

export async function getAccount(userId: string) {
  const profile = await getProfile(userId);
  if (!profile) {
    throw new NotFoundError('Account not found');
  }
  return profile;
}

export function updateAccount(userId: string, input: UpdateAccountInput) {
  return updateUser(userId, {
    name: input.name,
    email: input.email?.toLowerCase(),
  });
}

export function listAddresses(userId: string) {
  return prisma.address.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
}

export async function addAddress(userId: string, input: CreateAddressInput) {
  const saved = await prisma.address.count({ where: { userId } });
  if (saved >= MAX_ADDRESSES) {
    throw new BadRequestError(`You can save at most ${MAX_ADDRESSES} addresses`);
  }

  return prisma.address.create({ data: { ...input, userId } });
}

export async function removeAddress(userId: string, addressId: string) {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) {
    throw new NotFoundError('Address not found');
  }

  await prisma.address.delete({ where: { id: address.id } });
}
