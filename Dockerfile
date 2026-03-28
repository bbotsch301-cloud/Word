FROM node:20-slim AS base

# Install build tools for native modules (better-sqlite3, bcrypt)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy app source
COPY . .

# Build Next.js
RUN npm run build

# Production environment
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

# Start the app
CMD ["npm", "start"]
