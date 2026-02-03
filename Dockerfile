# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Define build arguments for Vite environment variables
ARG VITE_API_KEY
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GITHUB_CLIENT_ID

# Set them as environment variables for the build
ENV VITE_API_KEY=$VITE_API_KEY
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GITHUB_CLIENT_ID=$VITE_GITHUB_CLIENT_ID

# Install build dependencies for node-pty
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Verify index.html exists before build
RUN ls -la index.html && head -5 index.html

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install runtime dependencies for node-pty
RUN apk add --no-cache python3 make g++

# Install production server dependencies directly
RUN npm install express cors socket.io

# Try to install node-pty (may fail on some platforms, that's OK)
RUN npm install node-pty || echo "node-pty not available, terminal will use browser mode"

# Copy built assets
COPY --from=builder /app/dist ./dist

# Copy server files
COPY production-server.js ./

# Cloud Run uses PORT env variable
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080

# Start the production server with socket.io support
CMD ["node", "production-server.js"]
