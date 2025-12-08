# ⚡ Quick Deploy - 5 Minutes

## Easiest Method: Railway + Vercel (Recommended)

### Backend (Railway) - 3 minutes

1. **Go to [railway.app](https://railway.app)** → Sign up with GitHub
2. **New Project** → **Deploy from GitHub repo** → Select your repo
3. **Add PostgreSQL**: Click **"+ New"** → **"Database"** → **"PostgreSQL"**
4. **Add Environment Variables** (in your service → Variables):
   ```
   NODE_ENV=production
   JWT_SECRET=change-this-to-random-string
   JWT_EXPIRES_IN=24h
   JWT_PRIVATE_KEY_PATH=./keys/private_key.pem
   JWT_PUBLIC_KEY_PATH=./keys/public_key.pem
   CORS_ORIGIN=https://your-app.vercel.app
   ```
5. **Generate Keys**: In service → Settings → Deploy → Add command:
   ```bash
   cd server && node scripts/generate_keys.js
   ```
6. **Update Start Command**: 
   ```bash
   cd server && npm run migrate && npm start
   ```
7. **Copy your Railway URL** (e.g., `https://your-app.railway.app`)

### Frontend (Vercel) - 2 minutes

1. **Go to [vercel.com](https://vercel.com)** → Sign up with GitHub
2. **New Project** → Import your repo
3. **Settings**:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Environment Variables**:
   ```
   VITE_API_URL=https://your-app.railway.app/api
   ```
5. **Deploy** → Done! 🎉

### Final Steps

1. **Update CORS**: Go back to Railway → Variables → Update `CORS_ORIGIN` to your Vercel URL
2. **Seed Database**: In Railway → Service → Deploy → Run command:
   ```bash
   cd server && npm run seed
   ```
3. **Test**: Visit your Vercel URL and login with:
   - Email: `admin@blackranger.com`
   - Password: `Admin123!`

**That's it!** Your app is live! 🚀

---

## Alternative: All-in-One on Railway

If you want everything on Railway:

1. Deploy backend as above
2. In Railway, add another service:
   - Root Directory: `client`
   - Build Command: `npm install && npm run build`
   - Start Command: `npx serve -s dist -l 3000`
   - Add env: `VITE_API_URL=https://your-backend.railway.app/api`

---

## Need Help?

- Check `DEPLOYMENT.md` for detailed instructions
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs

