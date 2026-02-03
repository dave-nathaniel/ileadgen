#!/bin/bash
set -e

# Configuration
REPO_DIR="${REPO_DIR:-$(dirname "$(readlink -f "$0")")}"
BRANCH="${BRANCH:-main}"
COMPOSE_FILE="${REPO_DIR}/docker-compose.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Change to repository directory
cd "$REPO_DIR"

log_info "Starting deployment..."

# Pull latest changes from repository
log_info "Pulling latest changes from $BRANCH..."
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

# Check if .env file exists, create from example if not
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    log_warn ".env file not found, copying from .env.example"
    cp .env.example .env
fi

# Build and restart Docker containers
log_info "Building Docker image..."
docker compose -f "$COMPOSE_FILE" build --no-cache

log_info "Stopping existing containers..."
docker compose -f "$COMPOSE_FILE" down

log_info "Starting containers..."
docker compose -f "$COMPOSE_FILE" up -d

# Wait for health check
log_info "Waiting for service to be healthy..."
sleep 5

# Check container status
if docker compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
    log_info "Deployment completed successfully!"
    docker compose -f "$COMPOSE_FILE" ps
else
    log_error "Deployment failed! Container is not running."
    docker compose -f "$COMPOSE_FILE" logs --tail=50
    exit 1
fi

# Cleanup old images
log_info "Cleaning up unused Docker images..."
docker image prune -f

log_info "Done!"
