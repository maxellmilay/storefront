FROM node:24.17.0-bookworm-slim
# Prisma's query engine needs OpenSSL.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
# Dev dependencies stay: the start runs the Prisma CLI and the seed with tsx.
RUN npm ci
COPY prisma/ prisma/
RUN npx prisma generate
COPY tsconfig.json ./
COPY src/ src/
EXPOSE 4000
# The repository has no migrations, so the schema is pushed; the seed then
# resets the shop, so each start is the same shop. The API runs with tsx, as
# `npm run dev` does, since `tsc` refuses src/ against the current
# @types/express (route params typed `string | string[]`).
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss && npx tsx prisma/seed.ts && npx tsx src/server.ts"]
