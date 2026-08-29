# Simple Dockerfile for Coderight
# Builds a minimal image running Node 18

FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better cache)
COPY package*.json ./

# Install only production deps in image
RUN npm ci --only=production || npm install --no-audit --no-fund

# Copy app sources
COPY . .

EXPOSE 3000

CMD ["node","server.js"]
