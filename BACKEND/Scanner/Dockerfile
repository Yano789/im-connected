# Scanner Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install system dependencies for Sharp and Tesseract
RUN apk add --no-cache \
  vips-dev \
  tesseract-ocr \
  tesseract-ocr-data-eng \
  python3 \
  make \
  g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Download tesseract training data
COPY eng.traineddata ./

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]
