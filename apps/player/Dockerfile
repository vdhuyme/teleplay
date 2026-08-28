# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=22-alpine

# ---------- base ----------
FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=true \
    NEXT_TELEMETRY_DISABLED=1
RUN corepack enable

# ---------- deps ----------
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/player/package.json        ./apps/player/
COPY packages/core/package.json      ./packages/core/
RUN pnpm install --frozen-lockfile

# ---------- build ----------
FROM deps AS build
COPY tsconfig.json ./
COPY apps     ./apps
COPY packages ./packages
RUN pnpm --filter @teleplay/player run build

# ---------- player (runtime) ----------
FROM base AS player
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/apps/player/.next      ./apps/player/.next
COPY --from=build /app/apps/player/public     ./apps/player/public
COPY --from=build /app/packages               ./packages

COPY --from=deps  /app/package.json         ./package.json
COPY --from=deps  /app/pnpm-lock.yaml       ./pnpm-lock.yaml
COPY --from=deps  /app/pnpm-workspace.yaml  ./pnpm-workspace.yaml
COPY --from=deps  /app/apps/player/package.json   ./apps/player/package.json
COPY --from=deps  /app/packages/core/package.json ./packages/core/package.json

RUN pnpm install --prod --frozen-lockfile \
    --filter @teleplay/player...

ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["pnpm", "--filter", "@teleplay/player", "start"]
