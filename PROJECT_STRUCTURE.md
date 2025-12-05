# Project Structure

```
SPI-ID/
│
├── client/                          # React Frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation with menu
│   │   │   ├── Footer.jsx          # Footer component
│   │   │   ├── Card.jsx            # Reusable glass card
│   │   │   └── LoginModal.jsx      # Admin login modal
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Hero page with stats
│   │   │   ├── CreateIdentity.jsx  # Identity creation form
│   │   │   ├── GenerateQR.jsx     # QR code generation
│   │   │   ├── VerifyQR.jsx        # QR scanner & verification
│   │   │   └── Logs.jsx            # Verification logs & analytics
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Authentication context
│   │   │
│   │   ├── utils/
│   │   │   ├── api.js              # Axios API client
│   │   │   └── deviceFingerprint.js # Device fingerprinting
│   │   │
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # React entry point
│   │   └── index.css               # Global styles + Tailwind
│   │
│   ├── index.html                  # HTML template
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind theme config
│   └── postcss.config.js           # PostCSS config
│
├── server/                          # Express.js Backend
│   ├── config/
│   │   └── database.js             # PostgreSQL connection pool
│   │
│   ├── controllers/
│   │   ├── authController.js       # Admin login logic
│   │   ├── identityController.js   # Identity CRUD
│   │   ├── qrController.js         # QR generation & signing
│   │   ├── verifyController.js     # QR verification logic
│   │   ├── logsController.js       # Logs retrieval & export
│   │   └── statsController.js      # Statistics aggregation
│   │
│   ├── middleware/
│   │   ├── auth.js                 # JWT authentication
│   │   └── rateLimiter.js          # Rate limiting
│   │
│   ├── routes/
│   │   ├── auth.js                 # /api/auth/*
│   │   ├── identities.js            # /api/identities/*
│   │   ├── qr.js                    # /api/generate-qr
│   │   ├── verify.js                # /api/verify
│   │   ├── logs.js                  # /api/logs/*
│   │   └── stats.js                 # /api/stats/*
│   │
│   ├── migrations/
│   │   └── 001_init.sql            # Database schema
│   │
│   ├── scripts/
│   │   ├── migrate.js              # Run migrations
│   │   ├── seed.js                 # Seed initial data
│   │   └── generate_keys.js        # Generate RSA keypair
│   │
│   ├── keys/                        # RSA keys (gitignored)
│   │   ├── .gitkeep
│   │   ├── private_key.pem         # Generated
│   │   └── public_key.pem          # Generated
│   │
│   ├── index.js                     # Server entry point
│   ├── package.json                # Backend dependencies
│   └── env.example                 # Environment template
│
├── package.json                     # Root package.json
├── .gitignore                       # Git ignore rules
├── README.md                        # Full documentation
├── PROJECT_STRUCTURE.md             # This file
├── setup.sh                         # Unix setup script
└── setup.bat                        # Windows setup script
```

## Key Features by Component

### Frontend (React)
- **Dark Neon UI**: Glassmorphism cards, neon-cyan accents (#00F2A9)
- **Responsive**: Mobile, tablet, desktop with hamburger menu
- **QR Scanning**: html5-qrcode for camera scanning
- **QR Generation**: qrcode.react for display
- **Analytics**: Recharts for verification trends
- **Device Fingerprinting**: Browser, screen, timezone, hash

### Backend (Express.js)
- **RSA Signing**: RS256 algorithm for QR codes
- **JWT Auth**: Secure admin authentication
- **Rate Limiting**: Protection against abuse
- **Input Validation**: express-validator
- **SQL Injection Protection**: Parameterized queries
- **CORS**: Configurable origins

### Database (PostgreSQL)
- **identities**: Ranger identity data
- **qr_issuances**: QR generation records
- **verification_logs**: All verification attempts
- **admins**: Admin user accounts

## Color Scheme

- **Background**: `#02080F` → `#030A12` (gradient)
- **Primary Accent**: `#00F2A9` (neon-cyan)
- **Glass Cards**: `rgba(255, 255, 255, 0.05)` with backdrop blur
- **Borders**: `rgba(255, 255, 255, 0.1)` with neon glow

## API Flow

1. **Create Identity** → `POST /api/identities` (admin)
2. **Generate QR** → `POST /api/generate-qr` (admin) → Returns signed token + QR image
3. **Verify QR** → `POST /api/verify` → Validates signature, checks expiry, logs result
4. **View Logs** → `GET /api/logs` (admin) → Filtered verification history

## Security Flow

1. **QR Generation**: Identity data → RSA signed (private key) → Token stored in DB
2. **QR Verification**: Token → RSA verified (public key) → Expiry check → Log saved
3. **Device Fingerprinting**: Captured on verification request
4. **Rate Limiting**: 100 requests per 15 minutes per IP

