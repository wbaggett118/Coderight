# Multi-stage Dockerfile for Coderight

FROM node:18-alpine AS builder
WORKDIR /app
# Copy package metadata first to leverage layer caching
COPY package*.json ./
# If a lockfile exists, prefer npm ci, otherwise fall back to npm install
RUN if [ -f package-lock.json ]; then npm ci --only=prod; else npm install --only=prod; fi
COPY . .

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 3000
CMD ["node", "server.js"]
