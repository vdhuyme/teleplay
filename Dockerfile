# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22-alpine

# ---------- base ----------
FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=true
RUN corepack enable

# ---------- deps ----------
FROM base AS deps
# Copy only manifests first for layer cache
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json   ./apps/api/
COPY apps/bot/package.json   ./apps/bot/
COPY packages/core/package.json     ./packages/core/
COPY packages/youtube/package.json  ./packages/youtube/
RUN pnpm install --frozen-lockfile

# ---------- build ----------
FROM deps AS build
COPY tsconfig.json ./
COPY apps      ./apps
COPY packages  ./packages
RUN pnpm --filter @teleplay/api run build \
 && pnpm --filter @teleplay/bot run build

# ---------- api (runtime) ----------
FROM base AS api
ENV NODE_ENV=production
WORKDIR /app

# tsx runtime: handles ESM bare-specifier imports in compiled output
RUN npm install -g tsx@^4 --omit=dev

COPY --from=build /app/apps/api/dist              ./apps/api/dist
COPY --from=build /app/apps/api/drizzle           ./apps/api/drizzle
COPY --from=build /app/apps/api/drizzle.config.ts ./apps/api/

COPY --from=deps  /app/package.json         ./package.json
COPY --from=deps  /app/pnpm-lock.yaml       ./pnpm-lock.yaml
COPY --from=deps  /app/pnpm-workspace.yaml  ./pnpm-workspace.yaml
COPY --from=deps  /app/apps/api/package.json   ./apps/api/package.json
COPY --from=deps  /app/apps/bot/package.json   ./apps/bot/package.json
COPY --from=build /app/packages                ./packages

# COPY deploy.sh ./deploy.sh
# RUN chmod +x ./deploy.sh

RUN pnpm install --prod --frozen-lockfile \
    --filter @teleplay/api...

ARG PORT=10000
EXPOSE ${PORT}

# ENTRYPOINT ["./deploy.sh"]

CMD ["tsx", "apps/api/dist/index.js"]

# ---------- bot (runtime) ----------
FROM base AS bot
ENV NODE_ENV=production
WORKDIR /app

RUN npm install -g tsx@^4 --omit=dev

COPY --from=build /app/apps/bot/dist ./apps/bot/dist

COPY --from=deps  /app/package.json         ./package.json
COPY --from=deps  /app/pnpm-lock.yaml       ./pnpm-lock.yaml
COPY --from=deps  /app/pnpm-workspace.yaml  ./pnpm-workspace.yaml
COPY --from=deps  /app/apps/api/package.json   ./apps/api/package.json
COPY --from=deps  /app/apps/bot/package.json   ./apps/bot/package.json
COPY --from=build /app/packages                ./packages

RUN pnpm install --prod --frozen-lockfile \
    --filter @teleplay/bot...

CMD ["tsx", "apps/bot/dist/index.js"]