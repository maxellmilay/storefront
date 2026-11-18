import { PrismaClient, type Role } from '@prisma/client';
import bcrypt from 'bcrypt';

// Accounts for local development and automated testing. Sign-up only creates
// customers, so the seed is the only way to get an admin and a staff member.
const users: { email: string; name: string; password: string; role: Role }[] = [
  { email: 'admin@storefront.test', name: 'Store Admin', password: 'admin-password-1', role: 'ADMIN' },
  { email: 'staff@storefront.test', name: 'Store Staff', password: 'staff-password-1', role: 'STAFF' },
];

// Same cost as the sign-up service (src/services/auth.service.ts).
const SALT_ROUNDS = 10;

const prisma = new PrismaClient();

async function main() {
  for (const { email, name, password, role } of users) {
    await prisma.user.upsert({
      where: { email },
      create: { email, name, role, passwordHash: await bcrypt.hash(password, SALT_ROUNDS) },
      update: {},
    });
    console.log(`Seeded ${role} ${email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
