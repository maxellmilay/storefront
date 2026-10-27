import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required('DATABASE_URL'),
  redisUrl: required('REDIS_URL'),
  jwtSecret: required('JWT_SECRET'),
  paymentWebhookSecret: required('PAYMENT_WEBHOOK_SECRET'),
  storeUrl: process.env.STORE_URL ?? 'http://localhost:3000',
  port: Number(process.env.PORT ?? 4000),
};
