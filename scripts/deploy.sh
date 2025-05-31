#!/bin/bash

# Piloo.ai Deployment Script
# This script helps deploy the Dockerized Piloo.ai application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment argument is provided
if [ $# -eq 0 ]; then
    print_error "Please specify environment: development, staging, or production"
    echo "Usage: ./deploy.sh [development|staging|production]"
    exit 1
fi

ENVIRONMENT=$1

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment. Use: development, staging, or production"
    exit 1
fi

print_status "Starting Piloo.ai deployment for $ENVIRONMENT environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if environment file exists
ENV_FILE=".env.$ENVIRONMENT"
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file $ENV_FILE not found!"
    print_warning "Please copy .env.example to $ENV_FILE and configure it."
    exit 1
fi

# Source environment file
set -a
source "$ENV_FILE"
set +a

print_status "Using environment file: $ENV_FILE"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down

# Pull latest images (for production)
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Pulling latest images..."
    docker-compose pull
fi

# Build and start containers
print_status "Building and starting containers..."
if [ "$ENVIRONMENT" = "development" ]; then
    docker-compose --env-file "$ENV_FILE" up --build -d
else
    docker-compose --env-file "$ENV_FILE" --profile production up --build -d
fi

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check health of main application
print_status "Checking application health..."
if curl -f http://localhost:${APP_PORT:-5000}/api/health > /dev/null 2>&1; then
    print_status "✅ Application is healthy!"
else
    print_warning "Application might still be starting up. Check logs with: docker-compose logs"
fi

# Run database migrations if needed
if [ "$ENVIRONMENT" != "development" ]; then
    print_status "Running database migrations..."
    docker-compose exec piloo-app npm run db:push
fi

print_status "🚀 Piloo.ai deployment completed successfully!"
print_status "Application is running at: http://localhost:${APP_PORT:-5000}"

if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Production deployment checklist:"
    echo "  ✅ Set strong passwords in $ENV_FILE"
    echo "  ✅ Configure SSL certificates in nginx/ssl/"
    echo "  ✅ Update domain name in nginx/nginx.conf"
    echo "  ✅ Set up firewall rules"
    echo "  ✅ Configure backup strategy"
fi