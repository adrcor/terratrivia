FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

FROM base
COPY --from=install /app/node_modules ./node_modules
COPY . .

EXPOSE ${PORT}
CMD ["sh", "-c", "bun db:migrate && bun cmd/api.ts"]
