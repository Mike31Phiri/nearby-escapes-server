# ─── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies required by Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy package descriptors and configs
COPY package*.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies needed for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy compiler configs and source code
COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src

# Compile TypeScript into dist/
RUN npm run build

# Remove development dependencies to keep the image lightweight
RUN npm prune --omit=dev

# ─── Stage 2: Production Runner ──────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime OpenSSL required by Prisma
RUN apk add --no-cache openssl libc6-compat

ENV NODE_ENV=production
ENV PORT=3000

# Copy package descriptor
COPY package.json ./

# Copy production artifacts and generated Prisma Client from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Expose server port
EXPOSE 3000

# Run container as non-root node user for security
USER node

# Start the application
CMD ["node", "dist/src/main.js"]
