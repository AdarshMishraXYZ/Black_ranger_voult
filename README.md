# BLACK RANGER — Identity Vault (QR Verification System)

A production-ready web application for secure QR-based identity verification with a futuristic dark neon-cyan UI. Built with React (frontend) and Express.js + PostgreSQL (backend).

![BLACK RANGER](https://img.shields.io/badge/BLACK-RANGER-00F2A9?style=for-the-badge&logo=react&logoColor=white)

## 🚀 Features

- **Identity Management**: Create and manage ranger identities with metadata
- **QR Code Generation**: Generate cryptographically signed QR codes using RSA
- **QR Verification**: Real-time QR code scanning and verification with device fingerprinting
- **Verification Logs**: Comprehensive audit trail with analytics and CSV export
- **Admin Authentication**: Secure JWT-based admin access
- **Dark Neon UI**: Futuristic glassmorphism design with neon-cyan accents
- **Device Fingerprinting**: Captures browser, screen, timezone, and generates client hash
- **Geolocation**: Optional geo-tagging for verification logs
- **Analytics Dashboard**: Charts and statistics for verification trends

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **React Router** for navigation
- **html5-qrcode** for QR scanning
- **qrcode.react** for QR generation
- **Recharts** for analytics
- **Axios** for API calls

### Backend
- **Node.js** (>=16)
- **Express.js** for REST API
- **PostgreSQL** for database
- **JWT** (RS256) for QR signing
- **bcrypt** for password hashing
- **express-rate-limit** for API protection
- **helmet** for security headers

## 📋 Prerequisites

- **Node.js** >= 16.x
- **PostgreSQL** >= 12.x
- **npm** or **yarn**

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd SPI-ID
```

### 2. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE black_ranger_db;

# Exit psql
\q
```

#### Run Migrations

```bash
cd server
npm run migrate
```

#### Seed Initial Data

```bash
npm run seed
```

This creates:
- **Admin user**: `admin@blackranger.com` / `Admin123!`
- **Sample identity**: BR-001 (John Black Ranger)

### 4. Generate RSA Keys

Generate RSA keypair for QR code signing:

```bash
cd server
node scripts/generate_keys.js
```

This creates:
- `server/keys/private_key.pem` (keep secure!)
- `server/keys/public_key.pem`

### 5. Configure Environment Variables

#### Server Configuration

Create `server/.env` from `server/env.example`:

```bash
cd server
cp env.example .env
```

Edit `server/.env`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/black_ranger_db

# JWT Configuration (for admin auth)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# RSA Keys for QR Signing
JWT_PRIVATE_KEY_PATH=./keys/private_key.pem
JWT_PUBLIC_KEY_PATH=./keys/public_key.pem

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Important**: 
- Replace `password` with your PostgreSQL password
- Generate a strong `JWT_SECRET` for production
- Ensure RSA keys are generated (step 4)

## 🚀 Running the Application

### Development Mode (Both Server & Client)

From the root directory:

```bash
npm run dev
```

This starts:
- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

### Run Separately

#### Backend Only

```bash
cd server
npm run dev
```

#### Frontend Only

```bash
cd client
npm run dev
```

### Production Build

```bash
# Build frontend
cd client
npm run build

# Start server (production)
cd ../server
npm start
```

## 🧪 Testing the Complete Flow

### 1. Login as Admin

1. Navigate to http://localhost:5173
2. Click **Login** in the navbar
3. Use credentials:
   - Email: `admin@blackranger.com`
   - Password: `Admin123!`

### 2. Create Identity (Optional)

If you want to create a new identity:

1. Go to **Create Identity**
2. Fill in the form:
   - Name: Your Name
   - Ranger ID: BR-002 (must be unique)
   - Rank: Elite Ranger
   - Division: Alpha Division
   - Issue Date: Today
   - Expiry Date: 1 year from now
3. Click **Create Identity**

### 3. Generate QR Code

1. Go to **Generate QR**
2. If you created a new identity, it should auto-load
3. Otherwise, enter the identity ID (from seed: check database or use BR-001)
4. Click **Generate QR Code**
5. Download the QR image or token JSON

### 4. Verify QR Code

1. Go to **Verify QR**
2. Option A: Use camera scanner
   - Click **Start Camera Scanner**
   - Allow camera permissions
   - Point camera at QR code
3. Option B: Manual input
   - Copy the token from Generate QR page
   - Paste in the textarea
   - Click **Verify Token**
4. View verification result

### 5. View Logs

1. Go to **Verification Logs**
2. View analytics charts
3. Filter logs by date, result, device
4. Export logs as CSV

## 📁 Project Structure

```
SPI-ID/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context (Auth)
│   │   ├── utils/          # Utilities (API, fingerprinting)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── server/                 # Express.js backend
│   ├── config/            # Database config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth, rate limiting
│   ├── migrations/        # SQL migrations
│   ├── routes/           # API routes
│   ├── scripts/          # Seed, migrate, keygen
│   ├── keys/            # RSA keys (gitignored)
│   ├── index.js         # Server entry
│   └── package.json
│
├── package.json          # Root package.json
├── .gitignore
└── README.md
```

## 🔐 Security Features

- **RSA Signing**: QR codes signed with RS256 algorithm
- **JWT Authentication**: Secure admin login
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Protection against brute force
- **Input Validation**: express-validator for sanitization
- **SQL Injection Protection**: Parameterized queries
- **CORS**: Configured for allowed origins
- **Helmet**: Security headers

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login

### Identities
- `POST /api/identities` - Create identity (admin)
- `GET /api/identities/:id` - Get identity

### QR Generation
- `POST /api/generate-qr` - Generate signed QR (admin)
- `GET /api/public-key` - Get public key for offline verification

### Verification
- `POST /api/verify` - Verify QR code

### Logs & Analytics
- `GET /api/logs` - Get verification logs (admin)
- `GET /api/logs/export` - Export logs as CSV (admin)
- `GET /api/stats/summary` - Get statistics

## 🗄️ Database Schema

### Tables

1. **identities**: Ranger identity information
2. **qr_issuances**: QR code generation records
3. **verification_logs**: All verification attempts
4. **admins**: Admin user accounts

See `server/migrations/001_init.sql` for full schema.

## 🔑 Key Management

### Generating RSA Keys

```bash
cd server
node scripts/generate_keys.js
```

### Key Storage

- **Private Key**: Stored in `server/keys/private_key.pem` (gitignored)
- **Public Key**: Stored in `server/keys/public_key.pem` (gitignored)
- **Production**: Use environment variables or secure key management service

### Key Rotation

To rotate keys:
1. Generate new keypair
2. Update `.env` paths
3. Existing QR codes will become invalid (by design)

## 🐛 Troubleshooting

### Database Connection Error

- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env`
- Ensure database exists: `psql -U postgres -l`

### RSA Key Error

- Ensure keys are generated: `ls server/keys/`
- Check file paths in `.env`
- Verify file permissions (private key should be 600)

### Camera Not Working

- Ensure HTTPS in production (required for camera access)
- Check browser permissions
- Try manual token input as fallback

### CORS Errors

- Verify `CORS_ORIGIN` in server `.env` matches frontend URL
- Check browser console for specific error

## 📝 Environment Variables Reference

### Server (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret for admin JWT | - |
| `JWT_EXPIRES_IN` | JWT expiration | 24h |
| `JWT_PRIVATE_KEY_PATH` | RSA private key path | ./keys/private_key.pem |
| `JWT_PUBLIC_KEY_PATH` | RSA public key path | ./keys/public_key.pem |
| `CORS_ORIGIN` | Allowed frontend origin | http://localhost:5173 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🚢 Production Deployment

### Recommendations

1. **Environment Variables**: Use secure secret management
2. **HTTPS**: Required for camera access and security
3. **Database**: Use connection pooling and backups
4. **Rate Limiting**: Adjust based on expected traffic
5. **Monitoring**: Add logging and error tracking
6. **Key Management**: Use secure key storage (AWS KMS, etc.)

### Build for Production

```bash
# Build frontend
cd client
npm run build

# Serve with nginx or similar
# Backend runs on Node.js
```

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues or questions, please open an issue on the repository.

---

**BLACK RANGER Identity Vault** — Secure. Verified. Elite.

