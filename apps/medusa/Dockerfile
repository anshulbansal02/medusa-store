FROM node:24-bookworm-slim AS build-base

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates g++ make python3 \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable

FROM build-base AS builder

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build
RUN cp package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc .medusa/server/

FROM build-base AS prod-deps

COPY --from=builder /app/.medusa/server ./
RUN pnpm install --prod --frozen-lockfile

FROM node:24-bookworm-slim AS runner

WORKDIR /app

ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV PORT=9000

COPY --from=prod-deps --chown=node:node /app ./

USER node

EXPOSE 9000

CMD ["./node_modules/.bin/medusa", "start", "--host", "0.0.0.0", "--port", "9000"]
