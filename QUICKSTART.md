# 🚀 Quick Start Guide

Get BLACK RANGER Identity Vault running in 5 minutes!

## Prerequisites Check

- ✅ **Node.js** >= 16.x installed
- ✅ **PostgreSQL** >= 12.x installed and running
- ✅ **npm** or **yarn** installed

## Step-by-Step Setup

### 1️⃣ Install Dependencies

```bash
# Install all dependencies (root, server, client)
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

**Or use the setup script:**
- **Windows**: `setup.bat`
- **Unix/Mac**: `chmod +x setup.sh && ./setup.sh`

### 2️⃣ Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE black_ranger_db;

# Exit
\q
```

### 3️⃣ Generate RSA Keys

```bash
cd server
node scripts/generate_keys.js
cd ..
```

This creates `server/keys/private_key.pem` and `server/keys/public_key.pem`

### 4️⃣ Configure Environment

```bash
cd server
cp env.example .env
```

**Edit `server/.env`** and update these values:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/black_ranger_db
JWT_SECRET=your-super-secret-key-change-this
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### 5️⃣ Run Database Setup

```bash
cd server

# Run migrations (creates tables)
npm run migrate

# Seed initial data (creates admin + sample identity)
npm run seed
```

**Default Admin Credentials:**
- Email: `admin@blackranger.com`
- Password: `Admin123!`

### 6️⃣ Start the Application

```bash
# From root directory
npm run dev
```

This starts:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

### 7️⃣ Access the App

1. Open browser: http://localhost:5173
2. Click **Login** in navbar
3. Login with: `admin@blackranger.com` / `Admin123!`
4. Start using the app!

## 🧪 Test the Flow

### Quick Test (Using Seed Data)

1. **Generate QR** (page already has sample identity BR-001)
   - Go to **Generate QR** page
   - Click **Generate QR Code**
   - Download QR image

2. **Verify QR**
   - Go to **Verify QR** page
   - Click **Start Camera Scanner**
   - Scan the QR code you just generated
   - See verification result!

3. **View Logs**
   - Go to **Verification Logs** page
   - See your verification in the logs
   - View analytics charts

### Full Flow (Create New Identity)

1. **Create Identity**
   - Go to **Create Identity**
   - Fill form (Ranger ID must be unique, e.g., BR-002)
   - Submit

2. **Generate QR**
   - Go to **Generate QR**
   - Identity auto-loads
   - Generate and download QR

3. **Verify QR**
   - Scan the QR code
   - View verification result

## 🔧 Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready -U postgres

# Test connection
psql -U postgres -d black_ranger_db -c "SELECT 1;"
```

### Port Already in Use

- Change `PORT` in `server/.env` (default: 3001)
- Change port in `client/vite.config.js` (default: 5173)

### RSA Keys Not Found

```bash
cd server
node scripts/generate_keys.js
```

### CORS Errors

- Ensure `CORS_ORIGIN=http://localhost:5173` in `server/.env`
- Check backend is running on port 3001

## 📝 Common Commands

```bash
# Start both servers (development)
npm run dev

# Start server only
cd server && npm run dev

# Start client only
cd client && npm run dev

# Run migrations
cd server && npm run migrate

# Seed database
cd server && npm run seed

# Generate keys
cd server && node scripts/generate_keys.js
```

## ✅ Verification Checklist

- [ ] Dependencies installed
- [ ] Database created
- [ ] RSA keys generated
- [ ] `.env` file configured
- [ ] Migrations run
- [ ] Seed data loaded
- [ ] Server running (port 3001)
- [ ] Client running (port 5173)
- [ ] Can login as admin
- [ ] Can generate QR code
- [ ] Can verify QR code

## 🎯 Next Steps

- Read full documentation: `README.md`
- Check project structure: `PROJECT_STRUCTURE.md`
- Customize UI colors in `client/tailwind.config.js`
- Add more identities via Create Identity page
- Explore API endpoints in `server/routes/`

---

**Need Help?** Check `README.md` for detailed documentation.

