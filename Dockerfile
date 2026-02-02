# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install only express for the server
RUN npm install express

# Copy built assets and server
COPY --from=builder /app/dist ./dist
COPY server.js ./

# Cloud Run uses PORT env variable
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
