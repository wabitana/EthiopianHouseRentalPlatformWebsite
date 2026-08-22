# ==========================================
# ETHIOPIAN HOUSE RENTAL BACKEND DOCKERFILE
# Multi-stage production build
# ==========================================

# --- Stage 1: Build & Compile ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install openssl for Prisma binary generation on Alpine
RUN apk add --no-cache openssl

# Copy package files and install all dependencies
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

# Copy source code and build TypeScript
COPY . .
RUN npx prisma generate
RUN npm run build

# --- Stage 2: Production Execution ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install openssl for Prisma engine runtime on Alpine
RUN apk add --no-cache openssl

# Copy dependency definitions and production node_modules from builder
COPY package*.json ./
COPY tsconfig*.json ./
COPY prisma ./prisma/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

# Create uploads directory for local file storage fallback
RUN mkdir -p uploads

EXPOSE 3000

ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]
