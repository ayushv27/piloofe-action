# Piloo.ai Deployment Guide

This guide provides step-by-step instructions for deploying the Piloo.ai CCTV monitoring platform using Docker on Ubuntu servers.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Docker Configuration](#docker-configuration)
- [Django Backend Integration](#django-backend-integration)
- [Deployment Instructions](#deployment-instructions)
- [SSL Configuration](#ssl-configuration)
- [Monitoring and Maintenance](#monitoring-and-maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements
- Ubuntu 20.04 LTS or newer
- Minimum 4GB RAM, 8GB recommended
- Minimum 2 CPU cores, 4 cores recommended
- 50GB free disk space minimum
- Root or sudo access

### Software Dependencies
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget git unzip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again to apply Docker group membership
```

## Environment Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd piloo-ai
```

### 2. Configure Environment Files

#### Development Environment
```bash
cp .env.example .env.development
nano .env.development
```

#### Production Environment
```bash
cp .env.example .env.production
nano .env.production
```

**Important Production Settings:**
```bash
# Change these values for production
NODE_ENV=production
POSTGRES_PASSWORD=your_secure_database_password
REDIS_PASSWORD=your_secure_redis_password
SESSION_SECRET=your_super_secret_session_key_64_characters_minimum

# Django Backend API (Configure your Django backend URL)
DJANGO_API_ROOT=https://your-django-api.domain.com/api

# Optional: Add your API keys for full functionality
OPENAI_API_KEY=sk-your-openai-key
STRIPE_SECRET_KEY=sk_your-stripe-secret
VITE_STRIPE_PUBLIC_KEY=pk_your-stripe-public
SENDGRID_API_KEY=SG.your-sendgrid-key
```

### 3. Generate Secure Secrets
```bash
# Generate a secure session secret
openssl rand -base64 64

# Generate secure passwords
openssl rand -base64 32
```

## Docker Configuration

The application uses multi-stage Docker builds with different targets for each environment:

### Development Deployment
```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Deploy development environment
./scripts/deploy.sh development
```

### Production Deployment
```bash
# Deploy production environment with Nginx
./scripts/deploy.sh production
```

### Manual Docker Commands
```bash
# Build the application
docker build -t piloo-app .

# Development with live reload
docker-compose --env-file .env.development up --build

# Production with Nginx reverse proxy
docker-compose --env-file .env.production --profile production up -d
```

## Django Backend Integration

### Django API Configuration

The application is designed to work with a separate Django backend for AI video processing. Configure the Django backend URL in your environment file:

```bash
# In your .env file
DJANGO_API_ROOT=http://your-django-backend:8000/api
```

### Common Django Backend Endpoints

The frontend expects these Django API endpoints:

```
GET /api/video/search - AI-powered video search
POST /api/video/analyze - Video analysis
GET /api/alerts/ai - AI-generated alerts
POST /api/detection/motion - Motion detection
```

### Adding Django Backend to Docker Compose

If you have a Django backend Docker image, add it to `docker-compose.yml`:

```yaml
django-backend:
  image: your-django-backend:latest
  container_name: piloo-django
  environment:
    DATABASE_URL: postgresql://postgres:password@postgres:5432/piloo_db_django
  ports:
    - "8000:8000"
  depends_on:
    - postgres
  networks:
    - piloo-network
```

## Deployment Instructions

### Step 1: Prepare the Server
```bash
# Create application directory
sudo mkdir -p /opt/piloo-ai
cd /opt/piloo-ai

# Clone repository
git clone <your-repo-url> .

# Set permissions
sudo chown -R $USER:$USER /opt/piloo-ai
```

### Step 2: Configure Environment
```bash
# Copy and edit production environment
cp .env.example .env.production

# Edit with your production values
nano .env.production
```

### Step 3: Deploy Application
```bash
# Make deploy script executable
chmod +x scripts/deploy.sh

# Deploy production environment
./scripts/deploy.sh production
```

### Step 4: Verify Deployment
```bash
# Check running containers
docker-compose ps

# Check application health
curl http://localhost:5000/api/health

# View logs
docker-compose logs -f piloo-app
```

## SSL Configuration

### Using Let's Encrypt (Recommended)

1. **Install Certbot:**
```bash
sudo apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

2. **Generate SSL Certificate:**
```bash
sudo certbot certonly --standalone -d your-domain.com
```

3. **Configure Nginx:**
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Copy certificates
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Update nginx.conf to enable HTTPS section
nano nginx/nginx.conf
```

4. **Restart with SSL:**
```bash
docker-compose restart nginx
```

### Using Custom SSL Certificates

1. Place your certificates in `nginx/ssl/`:
   - `cert.pem` - Your SSL certificate
   - `key.pem` - Your private key

2. Uncomment the HTTPS server block in `nginx/nginx.conf`

3. Update the server name to your domain

4. Restart Nginx: `docker-compose restart nginx`

## Monitoring and Maintenance

### Health Checks
```bash
# Application health
curl http://localhost:5000/api/health

# Database connection
docker-compose exec postgres pg_isready

# Container status
docker-compose ps
```

### Log Management
```bash
# View application logs
docker-compose logs -f piloo-app

# View specific service logs
docker-compose logs -f postgres
docker-compose logs -f nginx

# Export logs for analysis
docker-compose logs --no-color > piloo-logs.txt
```

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres piloo_production > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U postgres piloo_production < backup.sql
```

### Updates and Maintenance
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose --env-file .env.production up --build -d

# Run database migrations
docker-compose exec piloo-app npm run db:push
```

## Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check logs
docker-compose logs piloo-app

# Check environment variables
docker-compose exec piloo-app env | grep NODE_ENV

# Verify database connection
docker-compose exec piloo-app npm run db:push
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
docker-compose exec postgres pg_isready

# Test connection
docker-compose exec postgres psql -U postgres -c "SELECT version();"

# Reset database
docker-compose down -v
docker-compose up -d postgres
```

#### Performance Issues
```bash
# Check resource usage
docker stats

# Monitor application
docker-compose logs -f --tail=100 piloo-app

# Check disk space
df -h
```

#### SSL Certificate Issues
```bash
# Test SSL configuration
openssl s_client -connect your-domain.com:443

# Renew Let's Encrypt certificate
sudo certbot renew

# Check certificate expiry
openssl x509 -in nginx/ssl/cert.pem -text -noout | grep "Not After"
```

### Environment-Specific Commands

#### Development
```bash
# Start development environment
./scripts/deploy.sh development

# Access development database
docker-compose exec postgres psql -U postgres piloo_dev
```

#### Production
```bash
# Start production environment
./scripts/deploy.sh production

# Check production health
curl https://your-domain.com/health
```

### Port Configuration

- **5000**: Main application (HTTP)
- **80**: Nginx (HTTP)
- **443**: Nginx (HTTPS)
- **5432**: PostgreSQL
- **6379**: Redis
- **8000**: Django backend

### Security Checklist

- [ ] Change default passwords in environment files
- [ ] Configure SSL certificates
- [ ] Set up firewall rules (`ufw enable`)
- [ ] Regular security updates (`apt update && apt upgrade`)
- [ ] Monitor logs for suspicious activity
- [ ] Backup database regularly
- [ ] Use strong session secrets
- [ ] Configure API rate limiting

## Support and Maintenance

For ongoing support and maintenance:

1. Monitor application logs regularly
2. Set up automated backups
3. Keep Docker images updated
4. Monitor system resources
5. Test disaster recovery procedures

## API Integration Notes

The application provides centralized configuration for the Django backend API root through the `DJANGO_API_ROOT` environment variable. This allows easy switching between development, staging, and production Django backends without code changes.

All Django API calls are proxied through the Nginx configuration under the `/django-api/` path, which maps to your Django backend's `/api/` endpoints.