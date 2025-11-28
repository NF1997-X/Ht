# Gallery App - Vercel Deployment Guide

Panduan lengkap untuk deploy Gallery App ke Vercel dengan Neon Database.

## 📋 Prerequisite

1. **GitHub Account** - Repository sudah di push
2. **Vercel Account** - Sign up di [vercel.com](https://vercel.com)
3. **Neon Database** - Sudah ada (kita pakai yang existing)

---

## 🚀 Deploy ke Vercel

### Step 1: Push Code ke GitHub

```bash
cd /workspaces/Ht
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### Step 2: Import Project ke Vercel

1. Pergi ke [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import repository **`NF1997-X/Ht`**
4. Click **"Import"**

### Step 3: Configure Environment Variables

Dalam Vercel project settings:

1. Pergi ke **Settings** → **Environment Variables**
2. Add variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_V9HXAN5dQJBw@ep-misty-haze-ahu4jh8e-pooler.c-3.us-east-1.aws.neon.tech/neondb`
   - **Environment**: Production, Preview, Development (select all)
3. Click **"Save"**

### Step 4: Deploy

1. Click **"Deploy"**
2. Tunggu beberapa minit
3. Done! ✅

---

## 🔧 How It Works

### Architecture

```
Vercel Deployment
├── Frontend (Static Files)
│   ├── index.html
│   ├── style.css
│   └── api-script.js
│
└── Backend (Serverless Functions)
    └── /api/index.js
        ├── GET  /api/health
        ├── GET  /api/pages
        ├── POST /api/pages
        ├── GET  /api/pages/:id
        ├── PUT  /api/pages/:id
        ├── DELETE /api/pages/:id
        ├── POST /api/pages/:id/save
        ├── POST /api/share/:pageId
        └── GET  /api/share/:shortCode
```

### Key Changes for Vercel

1. **Serverless Function** (`/api/index.js`)
   - Single file handles all API routes
   - Auto-scales with traffic
   - No need for Express server

2. **Dynamic API URL** (`api-script.js`)
   ```javascript
   const API_BASE_URL = window.location.hostname === 'localhost'
     ? 'http://localhost:3000/api'  // Local development
     : '/api';                        // Production (Vercel)
   ```

3. **Vercel Config** (`vercel.json`)
   - Routes API requests to serverless function
   - Serves static files
   - Sets environment variables

---

## 🧪 Testing After Deploy

Vercel akan kasih URL macam:
```
https://ht-xxx.vercel.app
```

Test features:
1. ✅ Open homepage
2. ✅ Enable Settings Mode
3. ✅ Add Section
4. ✅ Add Image (URL & Upload)
5. ✅ Create New Page
6. ✅ Share Page

---

## 🔄 Local vs Production

### Local Development (tetap boleh guna)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd /workspaces/Ht
python3 -m http.server 8000
```

Access: `http://localhost:8000`

### Production (Vercel)

Automatic deployment bila push ke GitHub:
```bash
git add .
git commit -m "update"
git push origin main
```

Vercel auto-deploy dalam 1-2 minit! ✨

Access: `https://your-project.vercel.app`

---

## 📊 Database

Database **tetap di Neon** (cloud). Both local dan production pakai database yang sama:
- Local dev: Connect to Neon
- Vercel: Connect to Neon

**Same data everywhere!** 🎉

---

## ⚡ Benefits Vercel

1. **Free Hosting** - No cost untuk hobby projects
2. **Auto HTTPS** - SSL certificate automatic
3. **Auto Deploy** - Push to GitHub = auto deploy
4. **Fast CDN** - Content served globally
5. **Serverless** - No server management
6. **Custom Domain** - Boleh add your domain

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" errors

**Solution:** Check Environment Variables
```bash
vercel env ls
```

Make sure `DATABASE_URL` is set.

### Issue: API returns 404

**Solution:** Redeploy
```bash
vercel --prod
```

### Issue: Database connection error

**Solution:** Check Neon database status
- Login to [neon.tech](https://neon.tech)
- Verify database is active
- Check connection string is correct

---

## 📝 Custom Domain (Optional)

1. Pergi ke Vercel **Settings** → **Domains**
2. Add your domain: `yourdomain.com`
3. Update DNS records (ikut instructions)
4. Done! ✅

---

## 🔐 Security Notes

- `.env` file tidak push ke GitHub (protected by `.gitignore`)
- Database credentials only in Vercel Environment Variables
- Neon database uses SSL by default
- Vercel provides automatic HTTPS

---

## 📦 What's Deployed

Files yang deploy ke Vercel:
```
✅ index.html
✅ style.css
✅ api-script.js
✅ test-api.html
✅ api/index.js (serverless function)
✅ package.json (dependencies)
✅ vercel.json (configuration)

❌ backend/ folder (not needed - replaced by serverless)
❌ .env files (use Vercel env vars)
❌ node_modules (auto-installed by Vercel)
```

---

## 🎯 Next Steps

1. Push code to GitHub
2. Import to Vercel
3. Add DATABASE_URL env var
4. Deploy
5. Test your live site!

**URL akan jadi:**
```
https://ht-nf1997x.vercel.app
```

(atau whatever Vercel generates untuk you)

---

Happy deploying! 🚀
