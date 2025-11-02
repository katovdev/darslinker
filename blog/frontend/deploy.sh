#!/bin/bash

#############################################
# Frontend Deployment Script for AWS EC2
# Darslinker Blog Frontend
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="darslinker-frontend"
APP_DIR="/var/www/${APP_NAME}"
BACKUP_DIR="/home/$(whoami)/backups/frontend"
NODE_VERSION="18"

echo -e "${GREEN}🚀 Darslinker Frontend Deployment Script${NC}"
echo "============================================"

# Check if running as root for Nginx operations
if [ "$EUID" -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Running as root. This is not recommended.${NC}"
    SUDO=""
else
    SUDO="sudo"
fi

# Check Node.js version
echo -e "\n${GREEN}📋 Checking Node.js version...${NC}"
if command -v node &> /dev/null; then
    NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    echo "Current Node.js version: $(node -v)"
    if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
        echo -e "${RED}❌ Node.js ${NODE_VERSION}.x or higher is required${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

# Check if Nginx is installed
echo -e "\n${GREEN}📋 Checking Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nginx is not installed. Installing...${NC}"
    $SUDO apt-get update
    $SUDO apt-get install -y nginx
    echo -e "${GREEN}✅ Nginx installed successfully${NC}"
else
    echo "Nginx version: $(nginx -v 2>&1 | cut -d'/' -f2)"
fi

# Create necessary directories
echo -e "\n${GREEN}📁 Creating directories...${NC}"
$SUDO mkdir -p "$APP_DIR"
$SUDO chown -R $(whoami):$(whoami) "$APP_DIR"
mkdir -p "$BACKUP_DIR"

# Backup existing deployment
if [ "$(ls -A $APP_DIR)" ]; then
    echo -e "\n${GREEN}📦 Creating backup...${NC}"
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    tar -czf "$BACKUP_FILE" -C "$APP_DIR" . 2>/dev/null || echo "Backup skipped"

    # Keep only last 5 backups
    cd "$BACKUP_DIR"
    ls -t backup-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
fi

# Navigate to source directory
CURRENT_DIR=$(pwd)
echo -e "\n${GREEN}📂 Current directory: $CURRENT_DIR${NC}"

# Pull latest code (if this is a git repository)
if [ -d ".git" ]; then
    echo -e "\n${GREEN}📥 Pulling latest code...${NC}"
    git fetch origin
    git reset --hard origin/main
    cd frontend
elif [ -d "../.git" ]; then
    echo -e "\n${GREEN}📥 Pulling latest code...${NC}"
    cd ..
    git fetch origin
    git reset --hard origin/main
    cd frontend
else
    echo -e "${YELLOW}⚠️  Not a git repository. Using current files.${NC}"
fi

# Check environment file
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"

    if [ -f ".env.example" ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${YELLOW}⚠️  Please edit .env file with your configuration${NC}"
        read -p "Enter your API URL (e.g., https://api.darslinker.uz/api): " API_URL
        sed -i "s|VITE_API_URL=.*|VITE_API_URL=$API_URL|g" .env
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        read -p "Enter your API URL: " API_URL
        echo "VITE_API_URL=$API_URL" > .env
    fi
fi

# Install dependencies
echo -e "\n${GREEN}📥 Installing dependencies...${NC}"
npm ci

# Build application
echo -e "\n${GREEN}🔨 Building application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed - dist directory not found${NC}"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Build failed - index.html not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"
du -sh dist/

# Clean current deployment
echo -e "\n${GREEN}🧹 Cleaning current deployment...${NC}"
$SUDO rm -rf "$APP_DIR"/*

# Copy build files to deployment directory
echo -e "\n${GREEN}📦 Copying build files...${NC}"
$SUDO cp -r dist/* "$APP_DIR/"

# Set proper permissions
echo -e "\n${GREEN}🔐 Setting permissions...${NC}"
$SUDO chown -R www-data:www-data "$APP_DIR"
$SUDO find "$APP_DIR" -type f -exec chmod 644 {} \;
$SUDO find "$APP_DIR" -type d -exec chmod 755 {} \;

# Configure Nginx (create site config if doesn't exist)
NGINX_CONF="/etc/nginx/sites-available/${APP_NAME}"
NGINX_ENABLED="/etc/nginx/sites-enabled/${APP_NAME}"

if [ ! -f "$NGINX_CONF" ]; then
    echo -e "\n${GREEN}⚙️  Creating Nginx configuration...${NC}"
    read -p "Enter your domain name (or press Enter for default): " DOMAIN_NAME
    DOMAIN_NAME=${DOMAIN_NAME:-"_"}

    $SUDO tee "$NGINX_CONF" > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN_NAME;

    root $APP_DIR;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Main location
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
    }

    # Logs
    access_log /var/log/nginx/${APP_NAME}-access.log;
    error_log /var/log/nginx/${APP_NAME}-error.log;
}
EOF

    # Enable site
    $SUDO ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
    echo -e "${GREEN}✅ Nginx configuration created${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx configuration already exists${NC}"
fi

# Test Nginx configuration
echo -e "\n${GREEN}🧪 Testing Nginx configuration...${NC}"
if $SUDO nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration is invalid${NC}"
    exit 1
fi

# Reload Nginx
echo -e "\n${GREEN}🔄 Reloading Nginx...${NC}"
$SUDO systemctl reload nginx

# Check Nginx status
if $SUDO systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ Nginx is not running${NC}"
    $SUDO systemctl start nginx
fi

# Health check
echo -e "\n${GREEN}🏥 Running health check...${NC}"

# Check if files exist
if [ -f "$APP_DIR/index.html" ]; then
    echo -e "${GREEN}✅ index.html exists${NC}"
else
    echo -e "${RED}❌ index.html not found${NC}"
    exit 1
fi

# Check file permissions
if [ -r "$APP_DIR/index.html" ]; then
    echo -e "${GREEN}✅ Files are readable${NC}"
else
    echo -e "${RED}❌ Files are not readable${NC}"
    exit 1
fi

# Try to access the site
sleep 2
if curl -f http://localhost/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend accessibility check warning${NC}"
fi

# Display status
echo -e "\n${GREEN}📊 Deployment Status:${NC}"
echo "============================================"
echo "App Directory: $APP_DIR"
echo "Files deployed: $(find $APP_DIR -type f | wc -l)"
echo "Total size: $(du -sh $APP_DIR | cut -f1)"
echo "============================================"

echo -e "\n${GREEN}✅ Deployment completed successfully!${NC}"
echo "============================================"
echo "Check Nginx status: sudo systemctl status nginx"
echo "View Nginx logs: sudo tail -f /var/log/nginx/${APP_NAME}-access.log"
echo "View error logs: sudo tail -f /var/log/nginx/${APP_NAME}-error.log"
echo "Test URL: http://localhost/"
echo "============================================"
