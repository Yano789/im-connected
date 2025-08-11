# IM-CONNECTED Dockerization Guide

## Overview

The IM-CONNECTED project has been fully containerized using Docker and Docker Compose to ensure consistent deployment across different environments. This document explains the dockerization strategy, architecture, and implementation details.

## Architecture Overview

The application follows a microservices architecture with each component containerized separately:

```
┌─────────────────────────────────────────────────────────────┐
│                    IM-CONNECTED STACK                       │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)     │  Port: 80                   │
│  Served by Nginx             │  Container: frontend        │
├─────────────────────────────────────────────────────────────┤
│  Forum Backend (Node.js)     │  Port: 5001                 │
│  Express + MongoDB           │  Container: forum-backend   │
├─────────────────────────────────────────────────────────────┤
│  Scanner Backend (Node.js)   │  Port: 3001                 │
│  OCR + Tesseract + OpenAI    │  Container: scanner-backend │
├─────────────────────────────────────────────────────────────┤
│  AI Chatbot (Next.js)        │  Port: 3000                 │
│  OpenAI Assistant API        │  Container: ai-chatbot      │
├─────────────────────────────────────────────────────────────┤
│  MongoDB Database            │  Port: 27017                │
│  Document Store              │  Container: mongodb         │
├─────────────────────────────────────────────────────────────┤
│  Nginx Proxy (Optional)      │  Port: 8080                 │
│  Load Balancer & SSL         │  Container: nginx-proxy     │
└─────────────────────────────────────────────────────────────┘
```

## Container Details

### 1. Frontend Container (`frontend`)

**Base Image:** `node:20-alpine`

**Build Process:**
- Multi-stage build for optimization
- First stage: Build React app with Vite
- Second stage: Serve static files with Nginx

**Key Features:**
- Production-optimized build
- Static file serving
- Health checks via HTTP
- Memory-efficient Alpine Linux

**Dockerfile Location:** `/Dockerfile` (root)

### 2. Forum Backend Container (`forum-backend`)

**Base Image:** `node:20-alpine`

**Features:**
- Express.js server
- MongoDB integration
- JWT authentication
- File upload handling
- Google Cloud Storage integration
- Email notification service
- Translation API support

**Environment Variables:**
- `MONGODB_URI`: Database connection string
- `TOKEN_KEY`: JWT secret
- `AUTH_EMAIL` / `AUTH_PASS`: Email service credentials
- `GOOGLE_CLOUD_PROJECT_ID`: GCP project ID
- `OPENAI_API_KEY`: OpenAI API key

**Health Check:** `GET /api/v1/health`

### 3. Scanner Backend Container (`scanner-backend`)

**Base Image:** `node:18-alpine`

**Specialized Dependencies:**
- `vips-dev`: Image processing library
- `tesseract-ocr`: OCR engine
- `tesseract-ocr-data-eng`: English language data
- `python3`, `make`, `g++`: Build tools for native modules

**Features:**
- Advanced OCR with Tesseract
- Multi-variant image preprocessing
- Sharp image manipulation
- OpenAI integration for fallback medication detection
- Google Cloud Storage for image uploads
- MongoDB integration for data persistence

**Key Processing Pipeline:**
1. Image upload and validation
2. Multi-variant preprocessing (enhanced, contrast, denoise, sharpen, box-optimized, text-focused)
3. OCR text extraction with multiple confidence algorithms
4. Medication name detection and correction
5. Online database lookup (FDA, NIH, RxNav)
6. AI fallback for unrecognized medications
7. Data storage and response formatting

**Health Check:** `GET /health`

**Dockerfile Location:** `/BACKEND/Scanner/Dockerfile`

### 4. AI Chatbot Container (`ai-chatbot`)

**Base Image:** `node:20-alpine`

**Features:**
- Next.js application
- OpenAI Assistant API integration
- CORS configuration for cross-service communication
- Thread management for conversation continuity

**Environment Variables:**
- `OPENAI_API_KEY`: OpenAI API key
- `OPENAI_ASSISTANT_ID`: Pre-configured assistant ID

**Health Check:** `GET /api/health`

### 5. MongoDB Container (`mongodb`)

**Base Image:** `mongo:7`

**Configuration:**
- Root user: `admin` / `password`
- Database: `im-connected`
- Persistent data volume
- Custom initialization script

**Features:**
- Document-based data storage
- Replica set support (configurable)
- Automated backups
- Connection pooling

**Initialization:** Custom script at `/init-mongo.js`

### 6. Nginx Proxy Container (`nginx-proxy`)

**Base Image:** `nginx:alpine`

**Purpose:**
- Reverse proxy for all services
- Load balancing (when scaling)
- SSL termination (production)
- Request routing based on paths

**Configuration:** `/nginx-proxy.conf`

## Docker Compose Configuration

### Service Dependencies

```yaml
Frontend → Forum Backend → MongoDB
        → Scanner Backend → MongoDB  
        → AI Chatbot
```

### Network Architecture

- **Internal Network:** `im-connected-network` (bridge mode)
- **Service Discovery:** By container name
- **External Access:** Published ports

### Volume Management

1. **Persistent Data:**
   - `mongodb_data`: Database files
   - `forum_uploads`: User uploaded files
   - `scanner_uploads`: Medication images

2. **Configuration:**
   - `./nginx-proxy.conf:/etc/nginx/nginx.conf:ro`
   - `./init-mongo.js:/docker-entrypoint-initdb.d/init-mongo.js:ro`

## Development vs Production

### Development Configuration (`docker-compose.dev.yml`)

```yaml
# Override file for development
services:
  frontend:
    environment:
      - NODE_ENV=development
    volumes:
      - ./src:/app/src # Hot reload
  
  forum-backend:
    environment:
      - NODE_ENV=development
    volumes:
      - ./BACKEND/Forum/src:/app/src # Hot reload
```

### Production Configuration

- Optimized builds
- Security hardening
- Resource limits
- Health checks
- Restart policies

## Build Optimization Strategies

### 1. Multi-Stage Builds

**Frontend Example:**
```dockerfile
# Build stage
FROM node:20-alpine as frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=frontend-build /app/dist /usr/share/nginx/html
```

### 2. Layer Caching

- Package files copied before source code
- Dependencies installed first
- Source code copied last for optimal caching

### 3. Image Size Optimization

- Alpine Linux base images
- `.dockerignore` files
- Production-only dependencies
- Asset optimization

## Security Implementation

### 1. Container Security

- Non-root user execution (where applicable)
- Minimal base images (Alpine)
- Regular security updates
- Secret management via environment variables

### 2. Network Security

- Internal network isolation
- Exposed ports minimization
- CORS configuration
- JWT token validation

### 3. Data Security

- Environment variable encryption
- Database authentication
- File upload validation
- API key protection

## Health Check Implementation

Each service includes comprehensive health checks:

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5001/api/v1/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 60s
```

**Health Check Endpoints:**
- Frontend: `GET /` (200 OK)
- Forum Backend: `GET /api/v1/health`
- Scanner Backend: `GET /health`
- AI Chatbot: `GET /api/health`
- MongoDB: Internal ping command

## Logging and Monitoring

### 1. Container Logs

```bash
# View all service logs
docker-compose logs

# Follow specific service logs
docker-compose logs -f scanner-backend

# View logs with timestamps
docker-compose logs -t frontend
```

### 2. Log Rotation

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### 3. Performance Monitoring

```bash
# Resource usage monitoring
docker stats $(docker-compose ps -q)

# Service status check
docker-compose ps
```

## Backup and Recovery

### 1. Database Backup

```bash
# Automated backup script
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mongodb mongodump \
  --uri="mongodb://admin:password@localhost:27017/im-connected?authSource=admin" \
  --archive | gzip > backup_$DATE.gz
```

### 2. Volume Backup

```bash
# Backup persistent volumes
docker run --rm -v im-connected_mongodb_data:/backup-source \
  -v $(pwd):/backup alpine tar czf /backup/mongodb_data_backup.tar.gz -C /backup-source .
```

### 3. Configuration Backup

- Docker Compose files
- Environment configurations
- Nginx configurations
- Initialization scripts

## Scaling and Load Balancing

### 1. Horizontal Scaling

```bash
# Scale specific services
docker-compose up --scale forum-backend=3 --scale scanner-backend=2
```

### 2. Load Balancing Configuration

Nginx proxy configuration supports multiple backend instances:

```nginx
upstream forum_backend {
    server forum-backend_1:5001;
    server forum-backend_2:5001;
    server forum-backend_3:5001;
}
```

## Troubleshooting

### 1. Common Issues

**Port Conflicts:**
```bash
# Check port usage
lsof -i :80 -i :3000 -i :3001 -i :5001 -i :27017
```

**Memory Issues:**
```bash
# Check Docker resource usage
docker system df
docker stats
```

**Build Failures:**
```bash
# Clean build cache
docker builder prune
docker-compose build --no-cache
```

### 2. Service-Specific Issues

**Scanner Backend OCR Issues:**
- Verify Tesseract installation: `docker-compose exec scanner-backend tesseract --version`
- Check language data: `docker-compose exec scanner-backend ls /usr/share/tessdata/`
- Monitor OCR processing: `docker-compose logs -f scanner-backend`

**MongoDB Connection Issues:**
- Verify network connectivity: `docker-compose exec forum-backend ping mongodb`
- Check MongoDB logs: `docker-compose logs mongodb`
- Test connection: `docker-compose exec mongodb mongosh -u admin -p password`

## Performance Optimization

### 1. Resource Limits

```yaml
services:
  scanner-backend:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.5'
        reservations:
          memory: 1G
          cpus: '0.5'
```

### 2. Caching Strategies

- Redis for session management (future enhancement)
- Application-level caching for medication info
- CDN for static assets (production)

### 3. Database Optimization

- Connection pooling
- Index optimization
- Query optimization
- Regular maintenance

## Future Enhancements

### 1. Service Mesh Integration

- Istio for advanced traffic management
- Service-to-service encryption
- Advanced observability

### 2. Container Orchestration

- Kubernetes deployment
- Helm charts
- Auto-scaling policies

### 3. CI/CD Integration

- Automated testing in containers
- Multi-stage deployment pipelines
- Blue-green deployments

## Conclusion

The dockerization of IM-CONNECTED provides:

- **Consistency:** Same environment across development, testing, and production
- **Scalability:** Easy horizontal scaling of individual services
- **Maintainability:** Clear separation of concerns and dependencies
- **Portability:** Platform-independent deployment
- **Security:** Isolated execution environments
- **Monitoring:** Comprehensive health checks and logging

This containerized architecture supports the complex requirements of a medical application with OCR processing, AI integration, and real-time communication while maintaining high availability and security standards.
