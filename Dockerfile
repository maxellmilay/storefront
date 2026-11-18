# syntax=docker/dockerfile:1

FROM node:22-bookworm-slim
# Prisma's query engine needs OpenSSL.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

EXPOSE 4000
# The app runs from source with tsx: `tsc` currently reports type errors on
# req.params under @types/express 5. The repo has no migrations yet, so the
# schema is synced with `prisma db push` before starting.
CMD ["sh", "-c", "npx prisma db push --skip-generate && npx tsx src/server.ts"]
