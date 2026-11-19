# Storefront


A test repo for another incoming cool app

## Running the shop with its frontend

```bash
docker compose up --build -d
```

`compose.yaml` starts Postgres, Redis, the API on <http://localhost:4000>
(`PORT`) and `web/` on <http://localhost:8080> (`WEB_PORT`). `web/` is a React
single-page app served by nginx, which proxies `/api/*` to the API with the
`/api` prefix removed. Each API start runs the seed.

| Path | Screen |
|---|---|
| `/` | Product list, with search and category |
| `/products/:id` | Product detail, with Add to cart |
| `/cart` | Cart: quantities, Remove, coupon, totals |
| `/checkout` | Choose or add an address, Place order |
| `/sign-in` | Sign in with email and password |
| `/orders` | Order history |
| `/orders/:id` | Order detail, with Cancel order while unpaid |

`checks/` holds example browser checks written for Neomata's runner (its
`screen` fixture, imported as `./automata/fixtures`). `missing-button.spec.ts`
fails on purpose, so a failure screenshot is taken. Since both `api` and
`web` publish ports, Neomata's Repository settings → Connection → Runs name
`api` as the app service and `web` as the screens service. The plan behind
the frontend is `docs/frontend-plan.md`.

## Seeded accounts

Sign-up only creates customers. The seed adds an admin, a staff member, two
customers with a saved address each, six products and two coupons. It runs
on every start of the compose stack and is safe to rerun: existing records
are left alone, nothing is deleted.

```bash
npm run seed                                   # locally
docker compose exec -T api sh -c "npm run seed" # in the compose stack
```

| Role     | Email                   | Password           | Actor in `actors.json` |
| -------- | ----------------------- | ------------------ | ---------------------- |
| ADMIN    | `admin@storefront.test` | `admin-password-1` | an admin               |
| STAFF    | `staff@storefront.test` | `staff-password-1` | a staff member         |
| CUSTOMER | `ana@shop.test`         | `ana-password`     | a customer             |
| CUSTOMER | `ben@shop.test`         | `ben-password`     | another customer       |

Coupons: `SAVE10` (10% off) and `BIG20` (20% off orders of $100.00 or more).

`actors.json` holds a token for each account, signed with the compose file's
default `JWT_SECRET` for the account's fixed id (`user-admin`, `user-staff`,
`user-ana`, `user-ben`). A page opened with one of those tokens is signed in,
because the app reads who is signed in from `GET /api/account`. A database
seeded before the ids were fixed keeps its old ids, so the admin and staff
tokens won't match it; `docker compose down -v` starts it over.

These are development credentials; never seed them into production.
