# Use Node.js 20 Alpine as base image (has better crypto support)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Global install
RUN npm install -g @nestjs/cli

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Create uploads directory with proper permissions
RUN mkdir -p /app/uploads/images && chmod -R 755 /app/uploads

# Set environment variable for port
ENV PORT=6001

# Expose port
EXPOSE 6001

# Start the application with host binding for Docker
CMD ["node", "dist/src/main.js"]