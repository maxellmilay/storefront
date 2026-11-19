# Storefront frontend: plan

A React frontend for the storefront API, so Neomata's browser checks (the
runner's `screen` fixture) can run against it and record videos and
failure screenshots. Its shape copies Automata's
`evidence/test/fixtures/shop-web/` (api/, web/, compose.yaml, checks/,
actors.json).

Branch: `feat/web-frontend`, from `main`.

## Layout

| Path | What |
|---|---|
| `compose.yaml` | `db` (Postgres 17), `redis` (Redis 7), `api` (this repo's root), `web` (nginx). Only `web` publishes a port, `"80"`, with no host port, so Docker picks a free one. |
| `Dockerfile` | The API image: `npm ci`, `prisma generate`; on start `prisma db push`, the seed, then `tsx src/server.ts`. The image doesn't run `tsc`, because `src/` doesn't typecheck against the current `@types/express` (route params are typed `string \| string[]`). That's a problem already in `src/`, left alone here. |
| `prisma/seed.ts` | Resets and seeds the shop: categories, products, users, addresses, coupons. Each start is a new shop. |
| `web/` | React 19 + Vite SPA, react-router `createBrowserRouter`, React Query, one `axios.create({ baseURL: "/api" })` client. Built in its Dockerfile and served by nginx. |
| `web/nginx.conf` | `location /api/ { proxy_pass http://api:4000/; }` (the trailing `/` strips `/api`, so `/api/cart` reaches `/cart`; read by the engine's `screens/base-path.ts`), and `try_files` for the SPA. |
| `actors.json` | `anonymous`, `a customer`, `another customer`, `a staff member`, each with `Authorization: Bearer <JWT>` for a seeded user with a fixed id, signed with the compose file's dev `JWT_SECRET` and no expiry. |
| `checks/` | Hand-written browser specs on the runner's `screen` fixture, importing `./automata/fixtures` like shop-web's. |

The API's own code (`src/`) is unchanged; its routes keep their paths, so
`expected.json` holds.

## Screens

| Path | Screen | Requests (all literal, in the screen's file) |
|---|---|---|
| `/` | Product list, search box | `GET /api/products`, `GET /api/categories` |
| `/products/:id` | Product detail, quantity, Add to cart | `GET /api/products/:id`, `POST /api/cart/items` |
| `/cart` | Cart: quantity, Remove, coupon, totals (subtotal, discount, tax, shipping, total) | `GET /api/cart`, `PATCH /api/cart/items/:id`, `DELETE /api/cart/items/:id`, `POST /api/cart/coupon`, `DELETE /api/cart/coupon` |
| `/checkout` | Pick a saved address or add one, Place order; shows the API's validation errors per field | `GET /api/account/addresses`, `POST /api/account/addresses`, `POST /api/orders` |
| `/sign-in` | Email and password | `POST /api/auth/login` |
| `/orders` | Order history | `GET /api/orders` |
| `/orders/:id` | Order detail, Cancel order while pending | `GET /api/orders/:id`, `POST /api/orders/:id/cancel` |

The layout (`/` and every child) reads who is signed in with
`GET /api/account`: a 200 is signed in, a 401 is signed out. So a page
opened as an actor whose headers carry a token is signed in with no
sign-in step, and the sign-in screen stores its token in `localStorage`
and sends it as `Authorization` for the people who sign in by hand.

Rules the engine reads:
- Every control has an accessible name (visible `<label>` or button text);
  messages use `role="alert"` (errors) and `role="status"` (success).
- Each request is a literal path through the one axios client, at most 3
  calls deep from its screen, and each is used by at most 2 screens.
- No Vite dev-server proxy is relied on; nginx in the compose file proxies.

## Seed

| Who | Email | Password | Actor |
|---|---|---|---|
| Ana, customer | ana@shop.test | ana-password | a customer |
| Ben, customer | ben@shop.test | ben-password | another customer |
| Sam, staff | sam@shop.test | sam-password | a staff member |

Ana and Ben each have one saved address. Products: six across two
categories, one with stock 2 (for the stock error). Coupons: `SAVE10`
(10%, no minimum) and `BIG20` (20%, minimum $100.00, for the minimum
error).

## Example checks (`checks/`)

1. `cart.spec.ts`: a customer opens a product, adds it to the cart, sees
   the totals, removes it. Act `POST /api/cart/items`.
2. `checkout.spec.ts`: a customer adds a product and places the order
   without choosing an address, sees the validation error, then chooses
   the saved one and lands on the order. Act `POST /api/orders`.
3. `missing-button.spec.ts`: fails on purpose (clicks a "Buy now" button
   the page lacks), so Playwright takes a failure screenshot.
   Annotation `harness`.

Each passing or failing check gets the `video` attachment from `screen`.

## Start

```bash
docker compose up --build -d
docker compose port web 80   # the host port Docker picked
```

## Not in scope

Staff and admin screens, sign-up, password reset, payments (the webhook).
