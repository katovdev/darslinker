#!/bin/bash

#############################################
# Backend Deployment Script for AWS EC2
# Darslinker Blog Backend
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="darslinker-backend"
APP_DIR="/home/$(whoami)/apps/${APP_NAME}"
BACKUP_DIR="/home/$(whoami)/backups/backend"
LOG_DIR="/home/$(whoami)/logs"
NODE_VERSION="18"

echo -e "${GREEN}🚀 Darslinker Backend Deployment Script${NC}"
echo "============================================"

# Check if running on EC2
if [ ! -f /sys/hypervisor/uuid ] || ! grep -q ec2 /sys/hypervisor/uuid 2>/dev/null; then
    echo -e "${YELLOW}⚠️  Warning: This doesn't appear to be an EC2 instance${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check Node.js version
echo -e "\n${GREEN}📋 Checking Node.js version...${NC}"
if command -v node &> /dev/null; then
    NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    echo "Current Node.js version: $(node -v)"
    if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
        echo -e "${RED}❌ Node.js ${NODE_VERSION}.x or higher is required${NC}"
        echo "Install it with: curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash - && sudo apt-get install -y nodejs"
        exit 1
    fi
else
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if PM2 is installed
echo -e "\n${GREEN}📋 Checking PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PM2 is not installed. Installing...${NC}"
    sudo npm install -g pm2
    pm2 startup
    echo -e "${GREEN}✅ PM2 installed successfully${NC}"
else
    echo "PM2 version: $(pm2 -v)"
fi

# Create necessary directories
echo -e "\n${GREEN}📁 Creating directories...${NC}"
mkdir -p "$APP_DIR"
mkdir -p "$BACKUP_DIR"
mkdir -p "$LOG_DIR"

# Backup existing deployment
if [ -d "$APP_DIR/dist" ]; then
    echo -e "\n${GREEN}📦 Creating backup...${NC}"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$BACKUP_FILE" -C "$APP_DIR" . 2>/dev/null || echo "Backup skipped"

    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t backup-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
fi

# Stop current application
echo -e "\n${GREEN}🛑 Stopping current application...${NC}"
pm2 stop "$APP_NAME" 2>/dev/null || echo "App not running"

# Navigate to app directory
cd "$APP_DIR"

# Pull latest code (if this is a git repository)
if [ -d ".git" ]; then
    echo -e "\n${GREEN}📥 Pulling latest code...${NC}"
    git fetch origin
    git reset --hard origin/main
    cd backend
else
    echo -e "${YELLOW}⚠️  Not a git repository. Make sure files are already in place.${NC}"
fi

# Install dependencies
echo -e "\n${GREEN}📥 Installing dependencies...${NC}"
npm ci --production

# Build application
echo -e "\n${GREEN}🔨 Building application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

# Check environment file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"

    if [ -f ".env.example" ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env file with your configuration${NC}"
        echo "Required variables: MONGODB_URI, PORT, NODE_ENV, etc."
        read -p "Press Enter to continue after editing .env..."
    else
        echo -e "${RED}❌ .env.example not found. Please create .env file manually${NC}"
        exit 1
    fi
fi

# Start application with PM2
echo -e "\n${GREEN}🚀 Starting application...${NC}"

pm2 start dist/main.js \
    --name "$APP_NAME" \
    --instances 2 \
    --exec-mode cluster \
    --time \
    --max-memory-restart 500M \
    --log "$LOG_DIR/${APP_NAME}.log" \
    --error "$LOG_DIR/${APP_NAME}-error.log" \
    --merge-logs \
    || pm2 restart "$APP_NAME"

# Save PM2 configuration
pm2 save

# Wait for application to start
echo -e "\n${GREEN}⏳ Waiting for application to start...${NC}"
sleep 5

# Health check
echo -e "\n${GREEN}🏥 Running health check...${NC}"

# Get port from .env
PORT=$(grep "^PORT=" .env | cut -d'=' -f2 || echo "5001")

# Check if process is running
if pm2 status | grep -q "$APP_NAME.*online"; then
    echo -e "${GREEN}✅ PM2 process is running${NC}"
else
    echo -e "${RED}❌ PM2 process is not running${NC}"
    pm2 logs "$APP_NAME" --lines 50 --nostream
    exit 1
fi

# Check if port is listening
if netstat -tuln | grep -q ":$PORT "; then
    echo -e "${GREEN}✅ Application is listening on port $PORT${NC}"
else
    echo -e "${RED}❌ Application is not listening on port $PORT${NC}"
    exit 1
fi

# Try HTTP health check
sleep 3
if curl -f http://localhost:$PORT/api/blogs > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is responding correctly${NC}"
else
    echo -e "${YELLOW}⚠️  API health check failed${NC}"
    echo "Check logs with: pm2 logs $APP_NAME"
fi

# Display status
echo -e "\n${GREEN}📊 Deployment Status:${NC}"
pm2 status "$APP_NAME"

echo -e "\n${GREEN}📝 Recent Logs:${NC}"
pm2 logs "$APP_NAME" --lines 20 --nostream

echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
echo "============================================"
echo "View logs: pm2 logs $APP_NAME"
echo "Stop app: pm2 stop $APP_NAME"
echo "Restart app: pm2 restart $APP_NAME"
echo "Monitor: pm2 monit"
echo "============================================"
