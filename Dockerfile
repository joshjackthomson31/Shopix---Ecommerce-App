# ============ Stage 1: Build React Frontend ============
FROM node:20-alpine AS builder

WORKDIR /app/client

# Copy package.json and install (lock file excluded via .dockerignore)
COPY client/package.json ./
RUN npm install

# Copy source and build
COPY client/ ./
RUN npm run build

# ============ Stage 2: Production Server ============
FROM node:20-alpine

WORKDIR /app

# Install server dependencies only (no devDependencies)
COPY server/package.json ./server/
RUN cd server && npm install --omit=dev

# Copy server source code
COPY server/ ./server/

# Copy built React app from Stage 1
COPY --from=builder /app/client/dist ./client/dist

# Create uploads directory
RUN mkdir -p server/uploads

# Expose the port the server runs on
EXPOSE 5000

# Set production environment
ENV NODE_ENV=production

# Start the server
CMD ["node", "server/server.js"]
