# Storefront API

The backend of a small online shop. Shoppers browse the catalog, fill a cart,
apply a coupon and check out. An order waits for payment: the payment
provider calls our webhook when the charge succeeds, and an order left unpaid
for too long is cancelled and its stock put back. Shoppers get an email when
their order is paid and when it is refunded.

Every account has a role: **customers** shop, **staff** manage the catalog and
issue refunds, and **admins** also manage accounts, coupons and the sales
report.

## Getting started

Set `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET` and `PAYMENT_WEBHOOK_SECRET` in
`.env`, then:

```bash
npm install
npx prisma migrate dev
npm run dev
```

The API listens on `PORT` (default 4000). The catalog is public. Accounts,
carts, orders and administration need an `Authorization: Bearer <token>`
header with the token returned by `POST /auth/login`.

## Background work

- Every 15 minutes, unpaid orders past the payment window are cancelled and
  their stock returned.
- Every night at 03:00, carts nobody has touched for two weeks are deleted.
- The `emails` queue sends order confirmations and refund notices; run Redis
  next to the API.
