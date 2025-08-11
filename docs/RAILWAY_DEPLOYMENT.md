# IM-CONNECTED Railway Deployment Guide

## Overview

IM-CONNECTED has been successfully deployed to Railway, a modern cloud platform that provides seamless deployment for full-stack applications. This document details the Railway implementation strategy, deployment architecture, and configuration specifics.

## Railway Deployment Architecture

### Multi-Service Deployment

Railway supports the microservices architecture of IM-CONNECTED through separate service deployments:

```
┌─────────────────────────────────────────────────────────────┐
│                    RAILWAY CLOUD PLATFORM                   │
├─────────────────────────────────────────────────────────────┤
│  Main App Service                                           │
│  URL: im-connected-production.up.railway.app              │
│  └── Frontend (React) + Forum Backend (Node.js)           │
├─────────────────────────────────────────────────────────────┤
│  Scanner Service                                            │
│  URL: scanner-service.up.railway.app                      │
│  └── OCR + Tesseract + AI Integration                     │
├─────────────────────────────────────────────────────────────┤
│  AI Chatbot Service                                         │
│  URL: ai-chatbot-production-c94d.up.railway.app          │
│  └── OpenAI Assistant API + Next.js                       │
├─────────────────────────────────────────────────────────────┤
│  Database                                                   │
│  Railway MongoDB Plugin                                     │
│  └── Persistent Data Storage                              │
└─────────────────────────────────────────────────────────────┘
```

## Service Configuration

### 1. Main Application Service

**Repository:** Primary IM-CONNECTED repository
**Build Configuration:** `railway.toml`

```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/api/v1/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[env]
NODE_ENV = "production"
```

**Deployment Strategy:**
- Multi-stage Dockerfile build
- Frontend build + Backend serving
- Static asset serving through Express
- Health checks via Forum Backend

**Key Features:**
- Combines React frontend and Node.js backend in single container
- Optimized for Railway's container runtime
- Automatic SSL certificate provisioning
- Custom domain support

### 2. Scanner Service

**Specialized OCR Service:**
- Dedicated Railway service for image processing
- Enhanced Tesseract OCR configuration
- Google Cloud Storage integration
- OpenAI fallback database

**Technical Specifications:**
- Node.js 18 runtime
- Tesseract OCR engine with English language data
- Sharp image processing library
- Multi-variant image preprocessing
- AI-powered medication detection

**Environment Variables:**
```bash
NODE_ENV=production
SCANNER_PORT=3001
MONGODB_URI=${Railway MongoDB Connection String}
OPENAI_API_KEY=${OpenAI API Key}
GOOGLE_CLOUD_PROJECT_ID=${GCP Project ID}
GCS_BUCKET_NAME=${Storage Bucket Name}
```

### 3. AI Chatbot Service

**Next.js Application:**
- OpenAI Assistant API integration
- Railway-optimized build configuration
- CORS setup for cross-service communication
- Conversation thread management

**Environment Variables:**
```bash
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=${OpenAI API Key}
OPENAI_ASSISTANT_ID=${Assistant Configuration ID}
```

## Railway Configuration Files

### 1. Root Dockerfile (Main App)

```dockerfile
# Multi-stage build for Railway deployment
FROM node:20-alpine as frontend-build

# Set memory limit for Node.js
ENV NODE_OPTIONS="--max-old-space-size=1024"

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

# Install backend dependencies
RUN npm install

# Copy built frontend to serve as static files
COPY --from=frontend-build /app/dist ./public

# Expose the port
EXPOSE 5001

# Start the backend server (which will also serve the frontend)
CMD ["npm", "start"]
```

### 2. Railway.toml Configuration

```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/api/v1/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"

[env]
NODE_ENV = "production"
```

### 3. Start Script (start.sh)

```bash
#!/bin/sh

# Railway startup script for frontend
echo "Starting Nginx for frontend..."
echo "Checking if build files exist..."

if [ -d "/usr/share/nginx/html" ]; then
    echo "✓ HTML directory exists"
    ls -la /usr/share/nginx/html/
else
    echo "✗ HTML directory missing"
fi

if [ -f "/usr/share/nginx/html/index.html" ]; then
    echo "✓ Index.html exists"
else
    echo "✗ Index.html missing"
fi

echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
exec nginx -g "daemon off;"
```

## Environment Variable Management

### 1. Production Environment Variables

**Main Application Service:**
```bash
# Database
MONGODB_URI=mongodb://...railway.app:port/database

# Authentication
TOKEN_KEY=secure_jwt_secret_key
TOKEN_EXPIRY=24h

# Email Service
AUTH_EMAIL=notification@example.com
AUTH_PASS=secure_app_password

# Google Cloud Platform
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project
GOOGLE_CLOUD_KEY_JSON={"type":"service_account",...}
GCS_BUCKET_NAME=im-connected-storage

# AI Services
OPENAI_API_KEY=sk-...
GOOGLE_TRANSLATE_API_KEY=your-translate-key

# Application
NODE_ENV=production
PORT=5001
```

**Scanner Service:**
```bash
NODE_ENV=production
SCANNER_PORT=3001
MONGODB_URI=${Shared Database URI}
OPENAI_API_KEY=${Shared OpenAI Key}
GOOGLE_CLOUD_PROJECT_ID=${Shared GCP Project}
GCS_BUCKET_NAME=${Shared Storage Bucket}
```

**AI Chatbot Service:**
```bash
NODE_ENV=production
PORT=3000
OPENAI_API_KEY=${Shared OpenAI Key}
OPENAI_ASSISTANT_ID=asst_...
```

### 2. Railway Environment Variable Sharing

Railway supports shared environment variables across services:
- Database connection strings
- API keys (OpenAI, Google Cloud)
- Storage configuration
- Authentication secrets

## API Configuration for Railway

### 1. Dynamic URL Configuration

```javascript
// API configuration for Railway deployment
const API_BASE_URL = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? (__API_URL__ || 'http://localhost:5001')
  : ''; // Empty string for relative paths in production (same domain)

// Scanner API configuration - for OCR scanning functionality
// In production, use the Railway scanner service URL
const SCANNER_API_BASE_URL = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3001'
  : 'https://scanner-service.up.railway.app';

// AI Chatbot API configuration - for OpenAI assistant functionality
// Now available in production with Railway deployment
const AI_CHATBOT_API_BASE_URL = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : 'https://ai-chatbot-production-c94d.up.railway.app';
```

### 2. CORS Configuration

**Forum Backend:**
```javascript
app.use(cors({
  origin: [
    "http://localhost:5173", // Vite dev server
    "http://localhost:80",   // Docker frontend
    "http://localhost",      // Docker frontend (without port)
    "http://localhost:3000", // Alternative dev port
    "http://localhost:8080", // Nginx proxy
    "http://localhost:5001", // Backend dev server
    /^https:\/\/.*\.railway\.app$/, // Railway deployments
    "https://imconnected-production.up.railway.app", // Specific Railway app
  ],
  credentials: true,
}));
```

**AI Chatbot Service:**
```typescript
const allowedOrigins = [
  "http://localhost:5173",  // Vite dev server
  "http://localhost:3000",  // Local development
  "http://localhost:5001",  // Forum backend
  "https://im-connected-production.up.railway.app", // Main app
  "https://scanner-service.up.railway.app",        // Scanner service
  "https://ai-chatbot-production-c94d.up.railway.app", // AI chatbot service
];
```

## Deployment Pipeline

### 1. Automatic Deployment

Railway provides automatic deployment from Git repositories:

```
Git Push → Railway Build → Container Deploy → Health Check → Live
    ↓            ↓              ↓             ↓         ↓
 Webhook    Dockerfile     Container       HTTP      Traffic
 Trigger     Build         Runtime        Check     Routing
```

### 2. Build Process

**Main Application:**
1. Clone repository
2. Multi-stage Docker build:
   - Stage 1: Build React frontend with Vite
   - Stage 2: Copy backend, install dependencies
   - Stage 3: Copy built frontend to public directory
3. Container optimization
4. Health check validation
5. Traffic routing

**Scanner Service:**
1. Clone repository
2. Install system dependencies (Tesseract, VIPS)
3. Install Node.js dependencies
4. Copy Tesseract training data
5. Container startup
6. Health check validation

### 3. Health Checks

Railway performs automatic health checks:

```javascript
// Health check endpoint for Railway
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'IM-CONNECTED Forum Backend',
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  });
});
```

## Service Communication

### 1. Inter-Service Communication

Railway services communicate via HTTPS with automatic SSL:

```javascript
// AI Chatbot URL determination for cross-service calls
const AI_CHATBOT_URL = process.env.NODE_ENV === 'production'
  ? 'https://ai-chatbot-production-c94d.up.railway.app'
  : 'http://localhost:3000';
```

### 2. Authentication Between Services

- JWT tokens for user authentication
- API keys for service authentication
- Railway internal networking for secure communication

### 3. Load Balancing

Railway provides automatic load balancing:
- Traffic distribution across container instances
- Health check integration
- Automatic failover
- Geographic routing optimization

## Database Integration

### 1. Railway MongoDB Plugin

Railway provides managed MongoDB through plugins:
- Automatic provisioning
- Backup management
- Connection string management
- Performance monitoring

### 2. Connection Configuration

```javascript
// MongoDB connection with Railway
const connectDatabase = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log(`Database Connected: ${connection.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};
```

## Security Implementation

### 1. HTTPS Everywhere

Railway enforces HTTPS for all services:
- Automatic SSL certificate provisioning
- HTTP to HTTPS redirection
- Secure cookie configuration
- HSTS headers

### 2. Environment Security

- Encrypted environment variables
- Secret rotation capabilities
- Access control and audit logging
- Network isolation between services

### 3. Authentication Flow

```javascript
// JWT authentication with Railway
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, process.env.TOKEN_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
```

## Monitoring and Logging

### 1. Railway Dashboard

Railway provides comprehensive monitoring:
- Real-time performance metrics
- Resource usage tracking
- Error rate monitoring
- Response time analytics
- Build and deployment logs

### 2. Application Logging

```javascript
// Enhanced logging for Railway environment
const logRequest = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(JSON.stringify({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    }));
  });
  
  next();
};
```

### 3. Error Tracking

```javascript
// Error handling middleware for Railway
const errorHandler = (err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};
```

## Performance Optimization

### 1. Container Optimization

```dockerfile
# Memory optimization for Railway
ENV NODE_OPTIONS="--max-old-space-size=1024"

# Production optimizations
RUN npm ci --only=production && npm cache clean --force
```

### 2. Caching Strategies

- Application-level caching for medication information
- Static asset caching with appropriate headers
- Database query optimization
- CDN integration for global distribution

### 3. Resource Management

Railway automatically handles:
- Memory allocation based on usage patterns
- CPU scaling during peak loads
- Storage optimization
- Network bandwidth management

## Backup and Recovery

### 1. Database Backups

Railway provides automated database backups:
- Daily incremental backups
- Point-in-time recovery
- Cross-region backup replication
- Manual backup triggers

### 2. Application State

- Stateless application design
- Session management in database
- File uploads to Google Cloud Storage
- Configuration in environment variables

### 3. Disaster Recovery

- Multi-region deployment capability
- Automatic failover mechanisms
- Data replication strategies
- Recovery time objectives (RTO) < 5 minutes

## Cost Optimization

### 1. Resource Allocation

Railway pricing based on:
- CPU usage (measured in vCPU hours)
- Memory consumption
- Network bandwidth
- Storage utilization

### 2. Optimization Strategies

- Efficient container sizing
- Resource monitoring and right-sizing
- Scheduled scaling based on usage patterns
- Caching to reduce compute requirements

### 3. Usage Monitoring

```javascript
// Resource usage tracking
const trackResourceUsage = () => {
  const usage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  console.log('Resource Usage:', {
    memory: {
      rss: `${Math.round(usage.rss / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)} MB`
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    uptime: process.uptime()
  });
};
```

## Troubleshooting

### 1. Common Issues

**Build Failures:**
- Check Dockerfile syntax
- Verify dependency versions
- Review build logs in Railway dashboard
- Ensure environment variables are set

**Service Communication Errors:**
- Verify CORS configuration
- Check service URLs and networking
- Validate authentication tokens
- Review firewall settings

**Database Connection Issues:**
- Verify MongoDB URI format
- Check network connectivity
- Review connection pool settings
- Monitor database performance metrics

### 2. Debugging Tools

**Railway CLI:**
```bash
# Login to Railway
railway login

# View service logs
railway logs

# Connect to service shell
railway shell

# Deploy specific branch
railway up --service scanner-service
```

**Log Analysis:**
```bash
# Filter error logs
railway logs --filter error

# Real-time log streaming
railway logs --follow

# Service-specific logs
railway logs --service ai-chatbot
```

### 3. Performance Debugging

```javascript
// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const startTime = process.hrtime.bigint();
  
  res.on('finish', () => {
    const endTime = process.hrtime.bigint();
    const duration = Number(endTime - startTime) / 1000000; // Convert to ms
    
    if (duration > 1000) {
      console.warn('Slow request detected:', {
        method: req.method,
        url: req.url,
        duration: `${duration.toFixed(2)}ms`,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  next();
};
```

## Future Enhancements

### 1. Advanced Railway Features

- **Railway Volumes:** Persistent storage for file uploads
- **Railway Secrets:** Enhanced secret management
- **Railway Databases:** Additional database options (PostgreSQL, Redis)
- **Railway Crons:** Scheduled task execution

### 2. Scaling Improvements

- **Auto-scaling:** Based on CPU/memory thresholds
- **Load Testing:** Performance validation under load
- **Cache Layers:** Redis for session and application caching
- **CDN Integration:** Global content delivery

### 3. DevOps Integration

- **CI/CD Pipelines:** Automated testing and deployment
- **Environment Promotion:** Staging to production workflows
- **Feature Flags:** A/B testing and gradual rollouts
- **Monitoring Integration:** External monitoring services

## Conclusion

Railway deployment of IM-CONNECTED provides:

- **Simplified Deployment:** Git-based automatic deployments
- **Microservices Support:** Independent service scaling and management
- **Production Ready:** SSL, monitoring, and automatic scaling
- **Cost Effective:** Pay-per-use pricing model
- **Developer Friendly:** Excellent developer experience with minimal configuration
- **Secure:** Built-in security features and compliance
- **Scalable:** Automatic scaling based on demand

The Railway platform enables IM-CONNECTED to deliver a robust medical application with advanced OCR capabilities, AI integration, and real-time communication while maintaining enterprise-grade reliability and security standards.
