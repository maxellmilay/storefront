# Storefront


A test repo for another incoming cool app

## Seeded accounts

Sign-up only creates customers. To get an admin and a staff account, seed the
database (safe to rerun; existing accounts are left alone):

```bash
npm run seed                                   # locally
docker compose exec -T api sh -c "npm run seed" # in the compose stack
```

| Role  | Email                   | Password           |
| ----- | ----------------------- | ------------------ |
| ADMIN | `admin@storefront.test` | `admin-password-1` |
| STAFF | `staff@storefront.test` | `staff-password-1` |

These are development credentials; never seed them into production.
