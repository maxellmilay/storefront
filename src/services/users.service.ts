import { ForbiddenError, NotFoundError } from '../lib/errors.js';
import { findUserById, listUsers, setUserRole } from '../repositories/users.repository.js';
import type { ChangeRoleInput, ListUsersQuery } from '../schemas/admin.schema.js';

export function listAccounts(query: ListUsersQuery) {
  return listUsers(query.role, (query.page - 1) * query.limit, query.limit);
}

export async function changeRole(actorId: string, userId: string, input: ChangeRoleInput) {
  if (userId === actorId && input.role !== 'ADMIN') {
    throw new ForbiddenError('You cannot remove your own admin role');
  }

  if (!(await findUserById(userId))) {
    throw new NotFoundError('User not found');
  }
  return setUserRole(userId, input.role);
}
