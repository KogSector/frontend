# =============================================================================
# Frontend - Dockerfile
# Port: 3000
# Role: Next.js 14 frontend application
# =============================================================================

# Multi-stage build for Next.js frontend
# Use Node 22 LTS for latest features and long-term support
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files only
COPY frontend/package.json frontend/package-lock.json ./
# Install all dependencies for build time (PostCSS/autoprefixer)
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . ./

# Create feature-toggles.json if not present (for standalone builds)
RUN echo '{}' > ../feature-toggles.json 2>/dev/null || true

# Build the frontend
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check optimized for Azure Container Apps
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
