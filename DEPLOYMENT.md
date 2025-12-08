# 🚀 Easiest Deployment Guide

This guide covers the **easiest** ways to deploy your BLACK RANGER Identity Vault project.

## Option 1: Railway (Easiest - All-in-One) ⭐ RECOMMENDED

Railway is the easiest option - it handles everything automatically.

### Step 1: Deploy Backend + Database

1. Go to [railway.app](https://railway.app) and sign up (free with GitHub)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your repository
4. Railway will auto-detect it's a Node.js project

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"** → **"Database"** → **"PostgreSQL"**
2. Railway automatically creates a `DATABASE_URL` environment variable

### Step 3: Configure Environment Variables

In Railway project settings, add these environment variables:

```env
NODE_ENV=production
PORT=3001
DATABASE_URL=<auto-filled by Railway>
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h
JWT_PRIVATE_KEY_PATH=./keys/private_key.pem
JWT_PUBLIC_KEY_PATH=./keys/public_key.pem
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### Step 4: Generate RSA Keys

1. In Railway, go to your service → **Settings** → **Deploy**
2. Add a **"Generate Command"**:
   ```bash
   cd server && node scripts/generate_keys.js
   ```
3. Or generate keys locally and upload them:
   ```bash
   cd server
   node scripts/generate_keys.js
   ```
   Then upload `keys/private_key.pem` and `keys/public_key.pem` to Railway

### Step 5: Run Database Migrations

Add a **"Deploy Command"** in Railway:
```bash
cd server && npm run migrate && npm start
```

### Step 6: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Click **"New Project"** → Import your GitHub repo
3. Set **Root Directory** to `client`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-app.railway.app/api
   ```
5. Click **Deploy**

**Done!** Your app is live! 🎉

---

## Option 2: Render (Free Tier Available)

### Backend Deployment

1. Go to [render.com](https://render.com) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Settings:
   - **Name**: black-ranger-backend
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run migrate && npm start`
   - **Environment**: Node

5. Add Environment Variables:
   ```env
   NODE_ENV=production
   PORT=3001
   DATABASE_URL=<from PostgreSQL service>
   JWT_SECRET=your-secret-key
   JWT_EXPIRES_IN=24h
   JWT_PRIVATE_KEY_PATH=./keys/private_key.pem
   JWT_PUBLIC_KEY_PATH=./keys/public_key.pem
   CORS_ORIGIN=https://your-frontend.onrender.com
   ```

### PostgreSQL Database

1. Click **"New +"** → **"PostgreSQL"**
2. Copy the **Internal Database URL**
3. Paste it as `DATABASE_URL` in your backend service

### Frontend Deployment

1. Click **"New +"** → **"Static Site"**
2. Settings:
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

---

## Option 3: Single VPS with PM2 (Most Control)

### Prerequisites
- Ubuntu/Debian VPS (DigitalOcean, Linode, AWS EC2)
- Domain name (optional)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2
sudo npm install -g pm2
```

### Step 2: Database Setup

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE black_ranger_db;
CREATE USER ranger_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE black_ranger_db TO ranger_user;
\q
```

### Step 3: Deploy Backend

```bash
# Clone your repo
cd /var/www
sudo git clone <your-repo-url> black-ranger
cd black-ranger/server

# Install dependencies
npm install

# Create .env file
sudo nano .env
```

Add to `.env`:
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://ranger_user:your_secure_password@localhost:5432/black_ranger_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
JWT_PRIVATE_KEY_PATH=./keys/private_key.pem
JWT_PUBLIC_KEY_PATH=./keys/public_key.pem
CORS_ORIGIN=https://yourdomain.com
```

```bash
# Generate RSA keys
node scripts/generate_keys.js

# Run migrations
npm run migrate

# Start with PM2
pm2 start index.js --name black-ranger-api
pm2 save
pm2 startup
```

### Step 4: Deploy Frontend

```bash
cd /var/www/black-ranger/client
npm install
npm run build
```

### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/black-ranger
```

Add:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/black-ranger/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/black-ranger /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**Done!** 🎉

---

## Quick Setup Scripts

I've created helper scripts in the repo to make deployment easier.

### For Railway/Render:
- Use the provided `railway.json` or `render.yaml` configs
- They handle most setup automatically

### For VPS:
- Run `deploy.sh` script (see below)

---

## Post-Deployment Checklist

- [ ] Database migrations run successfully
- [ ] RSA keys generated and accessible
- [ ] Environment variables set correctly
- [ ] Frontend can connect to backend API
- [ ] Admin user created (run seed script)
- [ ] HTTPS enabled (required for camera access)
- [ ] CORS origin matches frontend URL
- [ ] Test QR code generation and verification

---

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` format
- Verify database is accessible
- Check firewall rules

### RSA Key Errors
- Ensure keys are in `server/keys/` directory
- Check file permissions (private key should be 600)
- Verify paths in `.env`

### CORS Errors
- Update `CORS_ORIGIN` to match your frontend URL exactly
- Include protocol (https://)

### Camera Not Working
- HTTPS is required for camera access
- Check browser console for errors
- Verify camera permissions

---

## Need Help?

Check the main README.md for more details or open an issue on GitHub.

