# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/seed ./seed

RUN mkdir -p persist
VOLUME /app/persist
EXPOSE 4321

# Seed the database (idempotent) then start the Astro server
CMD ["sh", "-c", "./node_modules/.bin/emdash seed seed/seed.json --database=./persist/data.db --on-conflict skip || true; exec node ./dist/server/entry.mjs"]
