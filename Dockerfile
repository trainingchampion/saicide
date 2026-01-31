# Use Node.js for building and running
FROM node:20-slim

# Set working directory
WORKDIR /app

# Install system dependencies needed for some node packages (like node-pty)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the frontend
RUN npm run build

# Expose the port the server runs on
EXPOSE 4000

# Start the server
CMD ["npm", "start"]
