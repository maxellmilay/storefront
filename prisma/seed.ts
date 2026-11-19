import { PrismaClient, type Role } from '@prisma/client';
import bcrypt from 'bcrypt';

// Accounts and a small catalog for local development and automated testing.
// Sign-up only creates customers, so the seed is the only way to get an admin
// and a staff member. Safe to rerun: what exists is left alone, nothing is
// deleted. Users are created with fixed ids, because actors.json holds tokens
// signed for those ids with the compose file's default JWT_SECRET.
const users: { id: string; email: string; name: string; password: string; role: Role }[] = [
  { id: 'user-admin', email: 'admin@storefront.test', name: 'Store Admin', password: 'admin-password-1', role: 'ADMIN' },
  { id: 'user-staff', email: 'staff@storefront.test', name: 'Store Staff', password: 'staff-password-1', role: 'STAFF' },
  { id: 'user-ana', email: 'ana@shop.test', name: 'Ana', password: 'ana-password', role: 'CUSTOMER' },
  { id: 'user-ben', email: 'ben@shop.test', name: 'Ben', password: 'ben-password', role: 'CUSTOMER' },
];

const addresses = [
  { id: 'addr-ana', userId: 'user-ana', line1: '12 Harbour Road', city: 'Portsmouth', postalCode: 'PO1 3AX', country: 'GB' },
  { id: 'addr-ben', userId: 'user-ben', line1: '400 Pine Street', city: 'Seattle', postalCode: '98101', country: 'US' },
];

const categories = [
  { id: 'cat-kitchen', name: 'Kitchen', slug: 'kitchen' },
  { id: 'cat-desk', name: 'Desk', slug: 'desk' },
];

const products = [
  { id: 'prod-mug', sku: 'MUG-ENAMEL', name: 'Enamel mug', priceCents: 1800, stock: 40, categoryId: 'cat-kitchen', description: 'A camp mug that survives the dishwasher.' },
  { id: 'prod-kettle', sku: 'KETTLE-GOOSE', name: 'Gooseneck kettle', priceCents: 6400, stock: 12, categoryId: 'cat-kitchen', description: 'Pours slowly, for coffee.' },
  { id: 'prod-board', sku: 'BOARD-OAK', name: 'Oak cutting board', priceCents: 4200, stock: 2, categoryId: 'cat-kitchen', description: 'Two left.' },
  { id: 'prod-notebook', sku: 'NOTE-A5', name: 'A5 notebook', priceCents: 1200, stock: 100, categoryId: 'cat-desk', description: 'Dotted pages, lay-flat binding.' },
  { id: 'prod-lamp', sku: 'LAMP-DESK', name: 'Desk lamp', priceCents: 8900, stock: 8, categoryId: 'cat-desk', description: 'Warm light, dimmable.' },
  { id: 'prod-pen', sku: 'PEN-BRASS', name: 'Brass pen', priceCents: 3500, stock: 25, categoryId: 'cat-desk', description: 'Refillable.' },
];

const coupons = [
  { code: 'SAVE10', kind: 'PERCENT' as const, amount: 10 },
  { code: 'BIG20', kind: 'PERCENT' as const, amount: 20, minSubtotalCents: 10000 },
];

// Same cost as the sign-up service (src/services/auth.service.ts).
const SALT_ROUNDS = 10;

const prisma = new PrismaClient();

async function main() {
  for (const { id, email, name, password, role } of users) {
    await prisma.user.upsert({
      where: { email },
      create: { id, email, name, role, passwordHash: await bcrypt.hash(password, SALT_ROUNDS) },
      update: {},
    });
    console.log(`Seeded ${role} ${email}`);
  }

  for (const address of addresses) {
    await prisma.address.upsert({ where: { id: address.id }, create: address, update: {} });
  }
  for (const category of categories) {
    await prisma.category.upsert({ where: { id: category.id }, create: category, update: {} });
  }
  for (const product of products) {
    await prisma.product.upsert({ where: { id: product.id }, create: product, update: {} });
  }
  for (const coupon of coupons) {
    await prisma.coupon.upsert({ where: { code: coupon.code }, create: coupon, update: {} });
  }
  console.log(`Seeded ${products.length} products and ${coupons.length} coupons`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
