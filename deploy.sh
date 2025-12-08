#!/bin/bash

# BLACK RANGER - VPS Deployment Script
# Run this script on your Ubuntu/Debian VPS

set -e

echo "🚀 BLACK RANGER Deployment Script"
echo "=================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Update system
echo "📦 Updating system packages..."
apt update && apt upgrade -y

# Install Node.js 18+
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib

# Install Nginx
echo "📦 Installing Nginx..."
apt install -y nginx

# Install PM2
echo "📦 Installing PM2..."
npm install -g pm2

# Setup PostgreSQL
echo "🗄️  Setting up database..."
read -p "Enter database password for 'ranger_user': " DB_PASSWORD
sudo -u postgres psql <<EOF
CREATE DATABASE black_ranger_db;
CREATE USER ranger_user WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE black_ranger_db TO ranger_user;
\q
EOF

# Setup application directory
echo "📁 Setting up application..."
APP_DIR="/var/www/black-ranger"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository (or copy files)
read -p "Enter your repository URL (or press Enter to skip): " REPO_URL
if [ ! -z "$REPO_URL" ]; then
    git clone $REPO_URL .
else
    echo "Please copy your project files to $APP_DIR"
    read -p "Press Enter when files are copied..."
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd $APP_DIR/server
npm install

# Setup environment variables
echo "⚙️  Setting up environment..."
read -p "Enter JWT secret: " JWT_SECRET
read -p "Enter your domain (e.g., example.com): " DOMAIN

cat > .env <<EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://ranger_user:$DB_PASSWORD@localhost:5432/black_ranger_db
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h
JWT_PRIVATE_KEY_PATH=./keys/private_key.pem
JWT_PUBLIC_KEY_PATH=./keys/public_key.pem
CORS_ORIGIN=https://$DOMAIN
EOF

# Generate RSA keys
echo "🔑 Generating RSA keys..."
node scripts/generate_keys.js

# Run migrations
echo "🗄️  Running database migrations..."
npm run migrate

# Start with PM2
echo "🚀 Starting backend with PM2..."
pm2 start index.js --name black-ranger-api
pm2 save
pm2 startup

# Build frontend
echo "📦 Building frontend..."
cd $APP_DIR/client
npm install
npm run build

# Configure Nginx
echo "🌐 Configuring Nginx..."
cat > /etc/nginx/sites-available/black-ranger <<EOF
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend
    location / {
        root $APP_DIR/client/dist;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/black-ranger /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx

# Setup SSL
echo "🔒 Setting up SSL..."
read -p "Do you want to setup SSL with Let's Encrypt? (y/n): " SETUP_SSL
if [ "$SETUP_SSL" = "y" ]; then
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d $DOMAIN
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Seed the database: cd $APP_DIR/server && npm run seed"
echo "2. Visit https://$DOMAIN"
echo "3. Login with: admin@blackranger.com / Admin123!"
echo ""
echo "PM2 commands:"
echo "  pm2 status          - Check status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart services"
echo ""

