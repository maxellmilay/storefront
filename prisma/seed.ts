// Resets the database to a small known shop, so each start of the compose
// file is the same shop. The users' ids are fixed: actors.json holds tokens
// signed for them with the compose file's JWT_SECRET.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TABLES = [
  'PasswordResetToken',
  'WebhookEvent',
  'Refund',
  'Payment',
  'OrderItem',
  'Order',
  'CartItem',
  'Cart',
  'Coupon',
  'Product',
  'Category',
  'Address',
  'User',
];

const USERS = [
  { id: 'user-ana', email: 'ana@shop.test', name: 'Ana', password: 'ana-password', role: 'CUSTOMER' },
  { id: 'user-ben', email: 'ben@shop.test', name: 'Ben', password: 'ben-password', role: 'CUSTOMER' },
  { id: 'user-sam', email: 'sam@shop.test', name: 'Sam', password: 'sam-password', role: 'STAFF' },
] as const;

const CATEGORIES = [
  { id: 'cat-kitchen', name: 'Kitchen', slug: 'kitchen' },
  { id: 'cat-desk', name: 'Desk', slug: 'desk' },
];

const PRODUCTS = [
  { id: 'prod-mug', sku: 'MUG-ENAMEL', name: 'Enamel mug', priceCents: 1800, stock: 40, categoryId: 'cat-kitchen', description: 'A camp mug that survives the dishwasher.' },
  { id: 'prod-kettle', sku: 'KETTLE-GOOSE', name: 'Gooseneck kettle', priceCents: 6400, stock: 12, categoryId: 'cat-kitchen', description: 'Pours slowly, for coffee.' },
  { id: 'prod-board', sku: 'BOARD-OAK', name: 'Oak cutting board', priceCents: 4200, stock: 2, categoryId: 'cat-kitchen', description: 'Two left.' },
  { id: 'prod-notebook', sku: 'NOTE-A5', name: 'A5 notebook', priceCents: 1200, stock: 100, categoryId: 'cat-desk', description: 'Dotted pages, lay-flat binding.' },
  { id: 'prod-lamp', sku: 'LAMP-DESK', name: 'Desk lamp', priceCents: 8900, stock: 8, categoryId: 'cat-desk', description: 'Warm light, dimmable.' },
  { id: 'prod-pen', sku: 'PEN-BRASS', name: 'Brass pen', priceCents: 3500, stock: 25, categoryId: 'cat-desk', description: 'Refillable.' },
];

async function main() {
  const tables = TABLES.map((table) => `"${table}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE`);

  for (const { password, ...user } of USERS) {
    await prisma.user.create({
      data: { ...user, passwordHash: await bcrypt.hash(password, 10) },
    });
  }

  await prisma.address.createMany({
    data: [
      { id: 'addr-ana', userId: 'user-ana', line1: '12 Harbour Road', city: 'Portsmouth', postalCode: 'PO1 3AX', country: 'GB' },
      { id: 'addr-ben', userId: 'user-ben', line1: '400 Pine Street', city: 'Seattle', postalCode: '98101', country: 'US' },
    ],
  });

  await prisma.category.createMany({ data: CATEGORIES });
  await prisma.product.createMany({ data: PRODUCTS });

  await prisma.coupon.createMany({
    data: [
      { code: 'SAVE10', kind: 'PERCENT', amount: 10 },
      { code: 'BIG20', kind: 'PERCENT', amount: 20, minSubtotalCents: 10000 },
    ],
  });

  console.log(`Seeded ${USERS.length} users, ${PRODUCTS.length} products, 2 coupons.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
