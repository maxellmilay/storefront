# Storefront


A test repo for another incoming cool app

## Running the shop with its frontend

```bash
docker compose up --build -d
docker compose port web 80   # the host port Docker picked for the shop
```

`compose.yaml` starts Postgres, Redis, the API and `web/`, a React
single-page app served by nginx, which proxies `/api/*` to the API with the
`/api` prefix removed. Only `web` publishes a port. Each API start resets
the database to the seed in `prisma/seed.ts`:

| Who | Email | Password | Actor in `actors.json` |
|---|---|---|---|
| Ana, a customer | ana@shop.test | ana-password | a customer |
| Ben, a customer | ben@shop.test | ben-password | another customer |
| Sam, staff | sam@shop.test | sam-password | a staff member |

Coupons: `SAVE10` (10% off) and `BIG20` (20% off orders of $100.00 or
more). `actors.json` holds a token for each user, signed with the compose
file's development `JWT_SECRET`. A page opened with one of those tokens is
signed in, because the app reads who is signed in from `GET /api/account`.

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
fails on purpose, so a failure screenshot is taken. The plan behind all of
this is `docs/frontend-plan.md`.
