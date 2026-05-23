# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy source code and prisma schema
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src/

# Generate prisma client and build TS code
RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:22-alpine

WORKDIR /usr/src/app

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy generated Prisma client
COPY --from=builder /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /usr/src/app/node_modules/.prisma ./node_modules/.prisma

# Copy prisma schema for migrations/db push at startup
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts

# Copy built code and swagger doc
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/src/docs/swagger.yaml ./dist/docs/swagger.yaml

# Expose API port
EXPOSE 3000

# Start command
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm start"]
