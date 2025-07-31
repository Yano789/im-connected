# IM-CONNECTED Docker Setup

This guide will help you dockerize and run the IM-CONNECTED application using Docker and Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB of available RAM
- At least 2GB of free disk space

## Quick Start

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd IM-CONNECTED
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file with your actual values
   ```

3. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Frontend: http://localhost:80
   - Forum API: http://localhost:5001
   - Scanner API: http://localhost:3001
   - AI Chatbot: http://localhost:3000
   - Nginx Proxy: http://localhost:8080

## Services Overview

### Frontend (React + Vite)
- **Port:** 80
- **Description:** React frontend application served by Nginx
- **Health Check:** http://localhost:80

### Forum Backend (Node.js + Express)
- **Port:** 5001
- **Description:** Main backend API for user management, posts, comments
- **Health Check:** http://localhost:5001/api/v1/health

### Scanner Backend (Node.js + Express + Tesseract)
- **Port:** 3001
- **Description:** OCR-based medication scanner with image processing
- **Health Check:** http://localhost:3001/health

### AI Chatbot (Next.js + OpenAI)
- **Port:** 3000
- **Description:** AI-powered chatbot service
- **Health Check:** http://localhost:3000

### MongoDB
- **Port:** 27017
- **Description:** Document database for application data
- **Credentials:** admin/password

## Environment Configuration

### Required Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
MONGODB_URI=mongodb://admin:password@mongodb:27017/im-connected?authSource=admin

# Security
JWT_SECRET=your-super-secret-jwt-key

# Email (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# AI Services
OPENAI_API_KEY=your-openai-api-key
```

## Development vs Production

### Development Mode
```bash
# Start with development configuration
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

### Production Mode
```bash
# Start with production configuration
docker-compose up -d
```

## Common Commands

### Build and Start
```bash
# Build all images and start services
docker-compose up --build

# Start in detached mode
docker-compose up -d

# Start specific service
docker-compose up frontend
```

### Stop and Clean
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all
```

### Logs and Debugging
```bash
# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f scanner-backend
```

### Database Management
```bash
# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password

# Backup database
docker-compose exec mongodb mongodump --uri="mongodb://admin:password@localhost:27017/im-connected?authSource=admin" --out=/backup

# Restore database
docker-compose exec mongodb mongorestore --uri="mongodb://admin:password@localhost:27017/im-connected?authSource=admin" /backup/im-connected
```

## Service Dependencies

```
Frontend → Forum Backend → MongoDB
        → Scanner Backend → MongoDB
        → AI Chatbot
```

## Volumes and Persistence

- **mongodb_data:** Persistent MongoDB database files
- **forum_uploads:** File uploads from forum backend
- **scanner_uploads:** Medication images from scanner

## Networking

All services communicate through the `im-connected-network` bridge network:
- Internal service discovery via service names
- External access via published ports
- Nginx proxy for unified API gateway (optional)

## Health Checks

Each service includes health checks:
- **Frontend:** HTTP GET /
- **Forum Backend:** HTTP GET /api/v1/health
- **Scanner Backend:** HTTP GET /health
- **AI Chatbot:** HTTP GET /api/health
- **MongoDB:** MongoDB ping command

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   lsof -i :80 -i :3000 -i :3001 -i :5001 -i :27017
   ```

2. **Memory issues:**
   ```bash
   # Check Docker resource usage
   docker stats
   ```

3. **Build failures:**
   ```bash
   # Clean build cache
   docker builder prune
   docker-compose build --no-cache
   ```

4. **Database connection issues:**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

### Logs Location

- Application logs: `docker-compose logs [service-name]`
- MongoDB logs: Available through `docker-compose logs mongodb`
- Nginx logs: `/var/log/nginx/` inside the container

### Performance Tuning

1. **Increase MongoDB memory:**
   ```yaml
   # In docker-compose.yml
   mongodb:
     deploy:
       resources:
         limits:
           memory: 2G
   ```

2. **Enable MongoDB oplog:**
   ```yaml
   mongodb:
     command: mongod --replSet rs0 --oplogSize 128
   ```

## Security Considerations

### Production Deployment

1. **Change default passwords:**
   - Update MongoDB credentials
   - Use strong JWT secrets
   - Rotate API keys regularly

2. **Use secrets management:**
   ```yaml
   # Use Docker secrets instead of environment variables
   secrets:
     jwt_secret:
       file: ./secrets/jwt_secret.txt
   ```

3. **Enable SSL/TLS:**
   - Configure SSL certificates
   - Use HTTPS in production
   - Enable MongoDB authentication

4. **Network security:**
   - Use internal networks
   - Restrict external port access
   - Implement firewall rules

## Monitoring and Maintenance

### Health Monitoring
```bash
# Check service health
docker-compose ps

# Monitor resource usage
docker stats $(docker-compose ps -q)
```

### Backup Strategy
```bash
# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T mongodb mongodump --uri="mongodb://admin:password@localhost:27017/im-connected?authSource=admin" --archive | gzip > backup_$DATE.gz
```

### Log Rotation
Configure log rotation to prevent disk space issues:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

## Scaling

### Horizontal Scaling
```yaml
# Scale specific services
docker-compose up --scale forum-backend=3 --scale scanner-backend=2
```

### Load Balancing
Use the included nginx proxy configuration for load balancing multiple instances.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Docker and application logs
3. Ensure all environment variables are properly set
4. Verify port availability and Docker resources
