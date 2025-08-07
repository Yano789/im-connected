# Multi-stage build for Railway deployment
FROM node:20-alpine as frontend-build

# Set memory limit for Node.js
ENV NODE_OPTIONS="--max-old-space-size=2048"

WORKDIR /app

# Copy package files for frontend
COPY package.json package-lock.json* ./

# Install frontend dependencies
RUN npm install

# Copy frontend source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:20-alpine

# Set memory limit for Node.js
ENV NODE_OPTIONS="--max-old-space-size=1024"

WORKDIR /app

# Copy backend files
COPY BACKEND/Forum/ ./

# Copy environment file (for development/testing)
COPY .env .env

# Install backend dependencies
RUN npm ci --only=production

# Copy built frontend to serve as static files
COPY --from=frontend-build /app/dist ./public

# Expose the port
EXPOSE 5001

# Start the backend server (which will also serve the frontend)
CMD ["npm", "start"]
