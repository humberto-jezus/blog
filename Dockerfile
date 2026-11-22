# Stage 1: Build frontend and server
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npx esbuild server.ts \
  --bundle \
  --platform=node \
  --format=esm \
  --packages=external \
  --outfile=dist-server/server.mjs

# Stage 2: Production runtime (hardened, non-root)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder --chown=node:node /app/data ./data

RUN chown -R node:node /app

# Security: run as non-root user
USER node

EXPOSE 3000

CMD ["node", "dist-server/server.mjs"]
