#!/bin/bash

# BLACK RANGER Identity Vault - Setup Script
# This script helps set up the development environment

echo "🚀 BLACK RANGER Identity Vault - Setup"
echo "========================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 16.x"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version must be >= 16.x. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL not found in PATH. Please ensure PostgreSQL is installed."
else
    echo "✅ PostgreSQL detected"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
echo "Installing root dependencies..."
npm install

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm install

# Install client dependencies
echo "Installing client dependencies..."
cd ../client
npm install

cd ..

echo ""
echo "🔑 Generating RSA keys..."
cd server
node scripts/generate_keys.js
cd ..

echo ""
echo "📝 Next steps:"
echo "1. Create PostgreSQL database:"
echo "   psql -U postgres -c 'CREATE DATABASE black_ranger_db;'"
echo ""
echo "2. Configure server/.env file:"
echo "   cp server/env.example server/.env"
echo "   # Edit server/.env with your database credentials"
echo ""
echo "3. Run database migrations:"
echo "   cd server && npm run migrate"
echo ""
echo "4. Seed initial data:"
echo "   cd server && npm run seed"
echo ""
echo "5. Start development servers:"
echo "   npm run dev"
echo ""
echo "✅ Setup complete!"

