import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

type Db = Prisma.TransactionClient;

// Everything about a user that may leave the API; never the password hash.
const publicUser = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function getProfile(id: string) {
  return prisma.user.findUnique({ where: { id }, select: publicUser });
}

export function createUser(data: Prisma.UserCreateInput) {
  return prisma.user.create({ data, select: publicUser });
}

export function updateUser(id: string, data: Prisma.UserUpdateInput) {
  return prisma.user.update({ where: { id }, data, select: publicUser });
}

export function updatePassword(id: string, passwordHash: string, db: Db = prisma) {
  return db.user.update({ where: { id }, data: { passwordHash } });
}

export function listUsers(role: Role | undefined, skip: number, take: number) {
  return prisma.user.findMany({
    where: { role },
    select: publicUser,
    orderBy: { createdAt: 'asc' },
    skip,
    take,
  });
}

export function setUserRole(id: string, role: Role) {
  return prisma.user.update({ where: { id }, data: { role }, select: publicUser });
}
