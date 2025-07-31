#!/bin/bash

# IM-CONNECTED Docker Management Script
# This script helps manage the Docker environment for the IM-CONNECTED application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Check if .env file exists
check_env() {
    if [ ! -f .env ]; then
        log_warning ".env file not found. Creating from .env.example..."
        if [ -f .env.example ]; then
            cp .env.example .env
            log_warning "Please edit .env file with your actual values before continuing."
            exit 1
        else
            log_error ".env.example file not found. Please create .env file manually."
            exit 1
        fi
    fi
}

# Show help
show_help() {
    echo "IM-CONNECTED Docker Management Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  start        Start all services"
    echo "  start-dev    Start all services in development mode"
    echo "  stop         Stop all services"
    echo "  restart      Restart all services"
    echo "  build        Build all Docker images"
    echo "  rebuild      Rebuild all Docker images from scratch"
    echo "  logs         Show logs for all services"
    echo "  logs [SERVICE]  Show logs for specific service"
    echo "  status       Show status of all services"
    echo "  clean        Clean up Docker resources"
    echo "  reset        Reset everything (stop, clean, rebuild)"
    echo "  backup       Backup MongoDB database"
    echo "  restore [FILE]  Restore MongoDB database from backup"
    echo "  shell [SERVICE]  Open shell in service container"
    echo "  health       Check health of all services"
    echo "  update       Update and restart services"
    echo ""
    echo "Services: frontend, forum-backend, scanner-backend, ai-chatbot, mongodb"
    echo ""
    echo "Examples:"
    echo "  $0 start                    # Start all services"
    echo "  $0 logs forum-backend       # Show forum backend logs"
    echo "  $0 shell mongodb            # Open shell in MongoDB container"
    echo "  $0 backup                   # Backup database"
}

# Start services
start_services() {
    log_info "Starting IM-CONNECTED services..."
    check_docker
    check_env
    
    if [ "$1" = "dev" ]; then
        log_info "Starting in development mode..."
        docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
    else
        log_info "Starting in production mode..."
        docker-compose up -d
    fi
    
    log_success "Services started successfully!"
    show_urls
}

# Stop services
stop_services() {
    log_info "Stopping IM-CONNECTED services..."
    docker-compose down
    log_success "Services stopped successfully!"
}

# Restart services
restart_services() {
    log_info "Restarting IM-CONNECTED services..."
    docker-compose restart
    log_success "Services restarted successfully!"
    show_urls
}

# Build images
build_images() {
    log_info "Building Docker images..."
    check_docker
    docker-compose build "$@"
    log_success "Images built successfully!"
}

# Rebuild images from scratch
rebuild_images() {
    log_info "Rebuilding Docker images from scratch..."
    check_docker
    docker-compose build --no-cache "$@"
    log_success "Images rebuilt successfully!"
}

# Show logs
show_logs() {
    if [ -n "$1" ]; then
        log_info "Showing logs for $1..."
        docker-compose logs -f "$1"
    else
        log_info "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Show service status
show_status() {
    log_info "Service status:"
    docker-compose ps
}

# Clean up Docker resources
clean_docker() {
    log_warning "This will remove all stopped containers, unused networks, images, and build cache."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning up Docker resources..."
        docker system prune -af --volumes
        log_success "Docker cleanup completed!"
    else
        log_info "Cleanup cancelled."
    fi
}

# Reset everything
reset_all() {
    log_warning "This will stop all services, clean Docker resources, and rebuild everything."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Resetting IM-CONNECTED environment..."
        stop_services
        clean_docker
        rebuild_images
        start_services
        log_success "Reset completed!"
    else
        log_info "Reset cancelled."
    fi
}

# Backup database
backup_database() {
    log_info "Backing up MongoDB database..."
    
    # Create backup directory
    mkdir -p backups
    
    # Generate backup filename with timestamp
    BACKUP_FILE="backups/im-connected-backup-$(date +%Y%m%d_%H%M%S).gz"
    
    # Create backup
    docker-compose exec -T mongodb mongodump --uri="mongodb://admin:password@localhost:27017/im-connected?authSource=admin" --archive | gzip > "$BACKUP_FILE"
    
    log_success "Database backed up to: $BACKUP_FILE"
}

# Restore database
restore_database() {
    if [ -z "$1" ]; then
        log_error "Please specify backup file to restore."
        echo "Usage: $0 restore [BACKUP_FILE]"
        exit 1
    fi
    
    if [ ! -f "$1" ]; then
        log_error "Backup file not found: $1"
        exit 1
    fi
    
    log_warning "This will replace the current database with the backup."
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Restoring database from: $1"
        zcat "$1" | docker-compose exec -T mongodb mongorestore --uri="mongodb://admin:password@localhost:27017/im-connected?authSource=admin" --archive
        log_success "Database restored successfully!"
    else
        log_info "Restore cancelled."
    fi
}

# Open shell in service container
open_shell() {
    if [ -z "$1" ]; then
        log_error "Please specify service name."
        echo "Available services: frontend, forum-backend, scanner-backend, ai-chatbot, mongodb"
        exit 1
    fi
    
    log_info "Opening shell in $1 container..."
    
    if [ "$1" = "mongodb" ]; then
        docker-compose exec "$1" mongosh -u admin -p password im-connected
    else
        docker-compose exec "$1" /bin/sh
    fi
}

# Health check
health_check() {
    log_info "Checking service health..."
    
    # Check if containers are running
    docker-compose ps
    
    echo ""
    log_info "Testing service endpoints..."
    
    # Test frontend
    if curl -s http://localhost:80 > /dev/null; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend is not responding"
    fi
    
    # Test forum backend
    if curl -s http://localhost:5001/api/v1 > /dev/null; then
        log_success "Forum backend is healthy"
    else
        log_error "Forum backend is not responding"
    fi
    
    # Test scanner backend
    if curl -s http://localhost:3001/health > /dev/null; then
        log_success "Scanner backend is healthy"
    else
        log_error "Scanner backend is not responding"
    fi
    
    # Test AI chatbot
    if curl -s http://localhost:3000 > /dev/null; then
        log_success "AI chatbot is healthy"
    else
        log_error "AI chatbot is not responding"
    fi
}

# Update services
update_services() {
    log_info "Updating IM-CONNECTED services..."
    
    # Pull latest images
    docker-compose pull
    
    # Rebuild custom images
    docker-compose build
    
    # Restart services
    docker-compose up -d
    
    log_success "Services updated successfully!"
    show_urls
}

# Show service URLs
show_urls() {
    echo ""
    log_info "Service URLs:"
    echo "🌐 Frontend:        http://localhost:80"
    echo "🔧 Forum API:       http://localhost:5001"
    echo "📱 Scanner API:     http://localhost:3001"
    echo "🤖 AI Chatbot:     http://localhost:3000"
    echo "🔄 Nginx Proxy:    http://localhost:8080"
    echo "🗄️  MongoDB:        mongodb://localhost:27017"
}

# Main script logic
case "$1" in
    start)
        start_services
        ;;
    start-dev)
        start_services dev
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    build)
        build_images "${@:2}"
        ;;
    rebuild)
        rebuild_images "${@:2}"
        ;;
    logs)
        show_logs "$2"
        ;;
    status)
        show_status
        ;;
    clean)
        clean_docker
        ;;
    reset)
        reset_all
        ;;
    backup)
        backup_database
        ;;
    restore)
        restore_database "$2"
        ;;
    shell)
        open_shell "$2"
        ;;
    health)
        health_check
        ;;
    update)
        update_services
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
