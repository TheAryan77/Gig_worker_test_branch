# 🐳 Docker Deployment Guide

Complete Docker setup for TrustHire platform with Frontend, Backend API, and WebSocket server.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM allocated to Docker
- Ports available: 3000, 4000, 5000

## 🚀 Quick Start

### 1. Setup Environment Files

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
NEXT_PUBLIC_WEBSOCKET_URL=http://localhost:5000

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Razorpay (Public Key)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

**Backend** (`backend/.env`):
```bash
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000

# Gemini AI
GEMINI_API_KEY=your_gemini_key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourPrivateKey\n-----END PRIVATE KEY-----\n"
```

**WebSocket** (`websocket-server/.env`):
```bash
PORT=5000
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=production
```

### 2. Build and Run

**Option A: Using setup script (Recommended)**
```bash
./docker-setup.sh
docker-compose up
```

**Option B: Manual commands**
```bash
# Build all images
docker-compose build

# Start all services
docker-compose up

# Start in detached mode (background)
docker-compose up -d
```

### 3. Access Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **WebSocket**: http://localhost:5000
- **Health Checks**:
  - Backend: http://localhost:4000/api/health
  - WebSocket: http://localhost:5000 (Socket.IO connection)

## 📦 Docker Services

### Frontend Service
- **Container**: `trusthire-frontend`
- **Port**: 3000
- **Base Image**: node:18-alpine
- **Build Context**: ./frontend
- **Depends On**: backend, websocket

### Backend Service
- **Container**: `trusthire-backend`
- **Port**: 4000
- **Base Image**: node:18-alpine
- **Build Context**: ./backend

### WebSocket Service
- **Container**: `trusthire-websocket`
- **Port**: 5000
- **Base Image**: node:18-alpine
- **Build Context**: ./websocket-server

## 🛠️ Docker Commands

### Build
```bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build backend
docker-compose build websocket

# Rebuild without cache
docker-compose build --no-cache
```

### Start/Stop
```bash
# Start all services (foreground)
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Logs
```bash
# View all logs
docker-compose logs

# Follow logs (live)
docker-compose logs -f

# View specific service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f websocket

# View last 100 lines
docker-compose logs --tail=100
```

### Service Management
```bash
# Restart specific service
docker-compose restart frontend
docker-compose restart backend
docker-compose restart websocket

# Stop specific service
docker-compose stop frontend

# Start specific service
docker-compose start frontend

# Scale service (if needed)
docker-compose up -d --scale backend=3
```

### Shell Access
```bash
# Execute shell in container
docker-compose exec frontend sh
docker-compose exec backend sh
docker-compose exec websocket sh

# Execute command in container
docker-compose exec backend npm run migrate
docker-compose exec frontend npm run build
```

### Inspect & Debug
```bash
# View running containers
docker-compose ps

# View container stats
docker stats

# Inspect service configuration
docker-compose config

# View container details
docker inspect trusthire-frontend
docker inspect trusthire-backend
docker inspect trusthire-websocket
```

## 🌐 Network Configuration

All services run on a custom bridge network: `trusthire-network`

Internal service communication:
- Frontend → Backend: `http://backend:4000`
- Frontend → WebSocket: `http://websocket:5000`
- Backend → WebSocket: Not directly connected

External access:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- WebSocket: `http://localhost:5000`

## 🔒 Production Configuration

### Environment Variables

Update `docker-compose.yml` for production:

```yaml
services:
  frontend:
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_BACKEND_URL=https://api.yourdomain.com
      - NEXT_PUBLIC_WEBSOCKET_URL=https://ws.yourdomain.com
      
  backend:
    environment:
      - NODE_ENV=production
      - ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
      
  websocket:
    environment:
      - NODE_ENV=production
      - ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### SSL/TLS Setup

Use a reverse proxy (Nginx/Traefik) for SSL:

**Example nginx.conf**:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/ssl/cert.pem;
    ssl_certificate_key /etc/ssl/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:4000;
    }
}

server {
    listen 443 ssl http2;
    server_name ws.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📊 Monitoring

### Health Checks

Add health checks to `docker-compose.yml`:

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:4000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Resource Limits

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :4000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Remove all containers and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Container Crashes
```bash
# Check logs
docker-compose logs <service-name>

# Check container status
docker-compose ps

# Inspect container
docker inspect <container-name>
```

### Network Issues
```bash
# Check network
docker network ls
docker network inspect trusthire-network

# Recreate network
docker-compose down
docker network rm trusthire-network
docker-compose up
```

### Environment Variables Not Loading
```bash
# Verify env files exist
ls -la frontend/.env.local
ls -la backend/.env
ls -la websocket-server/.env

# Check loaded environment in container
docker-compose exec backend env
```

## 🚀 Deployment Platforms

### Docker Hub
```bash
# Tag images
docker tag trusthire-frontend:latest username/trusthire-frontend:latest
docker tag trusthire-backend:latest username/trusthire-backend:latest
docker tag trusthire-websocket:latest username/trusthire-websocket:latest

# Push to Docker Hub
docker push username/trusthire-frontend:latest
docker push username/trusthire-backend:latest
docker push username/trusthire-websocket:latest
```

### AWS ECS/Fargate
- Upload docker-compose.yml
- Configure task definitions
- Set environment variables in AWS Secrets Manager
- Deploy via ECS service

### Digital Ocean App Platform
```bash
# Use docker-compose.yml directly
doctl apps create --spec docker-compose.yml
```

### Kubernetes (Advanced)
Convert docker-compose to Kubernetes:
```bash
kompose convert -f docker-compose.yml
kubectl apply -f .
```

## 📝 Best Practices

1. **Never commit .env files** - Use .env.example as templates
2. **Use Docker volumes** for persistent data
3. **Implement health checks** for all services
4. **Set resource limits** to prevent memory leaks
5. **Use multi-stage builds** for smaller images (optional optimization)
6. **Regular updates**: `docker-compose pull && docker-compose up -d`
7. **Backup volumes**: `docker run --rm -v trusthire_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data`

## 🔄 Updates and Maintenance

```bash
# Pull latest code
git pull origin main

# Rebuild and restart services
docker-compose down
docker-compose build
docker-compose up -d

# View updated services
docker-compose ps

# Check logs for errors
docker-compose logs -f
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

---

**Status**: ✅ Production Ready  
**Last Updated**: December 16, 2025  
**Docker Version**: 20.10+  
**Docker Compose Version**: 2.0+
