# 🔧 Quick Fix for Build Error

## Problem
```
sh: 1: vite: not found
ERROR: failed to build
```

## Solution

The issue is that `vite` isn't found because client dependencies aren't installed before building.

### Option 1: Fix for Railway/Render (Recommended)

**For Railway:**
1. Go to your service → Settings → Deploy
2. Update **Build Command** to:
   ```bash
   cd client && npm install && npm run build
   ```

**For Render:**
The `render.yaml` is already fixed. Just make sure:
- Backend service uses `rootDir: server`
- Frontend service uses `buildCommand: cd client && npm install && npx vite build`

### Option 2: Manual Build (Local Testing)

If building locally:

```bash
# Install all dependencies first
cd client
npm install
npm run build

# Or from root
npm run install:all
npm run build
```

### Option 3: Use Docker (Easiest for Production)

I've created a `Dockerfile` that handles everything:

```bash
# Build
docker build -t black-ranger .

# Run
docker run -p 3001:3001 \
  -e DATABASE_URL=your_db_url \
  -e JWT_SECRET=your_secret \
  -e CORS_ORIGIN=https://your-domain.com \
  black-ranger
```

### Option 4: Update Root package.json

The root `package.json` build script is now updated to:
```json
"build": "cd client && npm install && npm run build"
```

This ensures dependencies are installed before building.

---

## For Railway Specifically

1. **Backend Service:**
   - Root Directory: `server`
   - Build Command: `npm install && node scripts/generate_keys.js`
   - Start Command: `npm run migrate && npm start`

2. **Frontend Service (if separate):**
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`

Or use the Dockerfile for a single service deployment.

---

## Still Having Issues?

Make sure:
- ✅ Node.js 18+ is installed
- ✅ All dependencies are in `package.json`
- ✅ Build command includes `npm install` before `npm run build`
- ✅ Using `npx vite` instead of just `vite` if needed

