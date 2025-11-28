# 🏗️ Architecture Overview

## Local Development

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR COMPUTER                             │
│                                                              │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │   Frontend       │        │   Backend        │          │
│  │                  │        │                  │          │
│  │  localhost:8000  │───────▶│  localhost:3000  │          │
│  │                  │  HTTP  │                  │          │
│  │  - index.html    │        │  - Express.js    │          │
│  │  - api-script.js │        │  - 10+ endpoints │          │
│  │  - style.css     │        │  - CORS enabled  │          │
│  └──────────────────┘        └──────────────────┘          │
│                                       │                      │
└───────────────────────────────────────┼──────────────────────┘
                                        │
                                        │ PostgreSQL
                                        │ Connection
                                        ▼
                            ┌───────────────────────┐
                            │   Neon Database       │
                            │   (Cloud PostgreSQL)  │
                            │                       │
                            │  - pages table        │
                            │  - sections table     │
                            │  - items table        │
                            │  - share_links table  │
                            └───────────────────────┘
```

## Production (Vercel)

```
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL PLATFORM                           │
│                                                              │
│  ┌──────────────────┐        ┌──────────────────┐          │
│  │   Static Files   │        │  Serverless      │          │
│  │   (CDN)          │        │  Function        │          │
│  │                  │        │                  │          │
│  │  your-app        │───────▶│  /api/*          │          │
│  │  .vercel.app     │  Req   │                  │          │
│  │                  │        │  - All endpoints │          │
│  │  - index.html    │        │    in one file   │          │
│  │  - api-script.js │        │  - Auto-scale    │          │
│  │  - style.css     │        │  - Serverless    │          │
│  └──────────────────┘        └──────────────────┘          │
│                                       │                      │
└───────────────────────────────────────┼──────────────────────┘
                                        │
                                        │ PostgreSQL
                                        │ Connection
                                        ▼
                            ┌───────────────────────┐
                            │   Neon Database       │
                            │   (Cloud PostgreSQL)  │
                            │                       │
                            │  - pages table        │
                            │  - sections table     │
                            │  - items table        │
                            │  - share_links table  │
                            └───────────────────────┘
```

## Request Flow (Production)

```
User Browser
    │
    │ 1. Visit https://your-app.vercel.app
    ▼
┌─────────────────────┐
│   Vercel CDN        │
│   (Static Files)    │
│                     │
│  - HTML loaded      │
│  - CSS loaded       │
│  - JS loaded        │
└─────────────────────┘
    │
    │ 2. JavaScript makes API call
    │    fetch('/api/pages')
    ▼
┌─────────────────────┐
│  Serverless         │
│  Function           │
│  (/api/index.js)    │
│                     │
│  - Parse request    │
│  - Query database   │
│  - Return JSON      │
└─────────────────────┘
    │
    │ 3. Query Neon Database
    ▼
┌─────────────────────┐
│  Neon PostgreSQL    │
│  (Cloud Database)   │
│                     │
│  - Execute SQL      │
│  - Return results   │
└─────────────────────┘
    │
    │ 4. Response back to browser
    ▼
User sees data! ✅
```

## API Routes Mapping

### Local Development
```
Frontend: http://localhost:8000
Backend:  http://localhost:3000/api

Examples:
- http://localhost:3000/api/health
- http://localhost:3000/api/pages
- http://localhost:3000/api/pages/default
```

### Production (Vercel)
```
Frontend: https://your-app.vercel.app
Backend:  https://your-app.vercel.app/api

Examples:
- https://your-app.vercel.app/api/health
- https://your-app.vercel.app/api/pages
- https://your-app.vercel.app/api/pages/default
```

**Same paths, different domains!**

## File Structure

```
Ht/
├── index.html              ← Main app (static)
├── style.css              ← Styling (static)
├── api-script.js          ← Frontend logic (static)
├── test-api.html          ← Testing tool (static)
│
├── api/
│   └── index.js           ← Serverless function (dynamic)
│
├── package.json           ← Dependencies for Vercel
├── vercel.json            ← Vercel configuration
│
├── backend/               ← Only for local dev
│   ├── server.js          ← Express server (local only)
│   ├── initDb.js          ← Database setup
│   └── package.json       ← Backend dependencies
│
└── docs/
    ├── README.md          ← General docs
    ├── DEPLOY.md          ← Deployment guide
    └── DEPLOYMENT-CHECKLIST.md
```

## Environment Detection

```javascript
// api-script.js automatically detects environment

const API_BASE_URL = 
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'  // 🖥️ Local
    : '/api';                        // 🌐 Production

// Smart! Same code works everywhere! ✨
```

## Database Connection

```javascript
// Both local and Vercel use same database

const sql = neon(process.env.DATABASE_URL);

// Local: DATABASE_URL from backend/.env
// Vercel: DATABASE_URL from Environment Variables

// Same database = same data everywhere! 🎉
```

## Deployment Flow

```
1. Developer
   │
   │ git push
   ▼
2. GitHub
   │
   │ webhook trigger
   ▼
3. Vercel
   │
   ├─ Build frontend (instant)
   ├─ Build serverless function
   ├─ Deploy to CDN
   └─ Configure routes
   │
   │ ⏱️ ~1-2 minutes
   ▼
4. Live! ✅
   https://your-app.vercel.app
```

## Scaling

```
1 User:
Frontend (CDN) → Serverless (1 instance) → Database

100 Users:
Frontend (CDN) → Serverless (auto-scale) → Database
                 ├─ Instance 1
                 ├─ Instance 2
                 └─ Instance N

1000 Users:
Frontend (CDN) → Serverless (auto-scale) → Database
                 ├─ Many instances
                 └─ Auto-managed by Vercel

Infinite scale! No configuration needed! 🚀
```

## Cost Breakdown

```
🆓 FREE TIER:
   ├─ Vercel Hobby: Free
   ├─ Neon Free Tier: 0.5 GB storage
   ├─ 100 GB bandwidth/month
   └─ Unlimited serverless invocations*
      (*within fair use)

💰 PAID (Optional):
   ├─ Vercel Pro: $20/month
   ├─ Neon Scale: $19/month
   └─ More resources + features

Perfect for hobby projects! 💚
```

## Security

```
🔒 HTTPS Everywhere
   - Vercel auto-provides SSL
   - All traffic encrypted

🔐 Database Security
   - Neon uses SSL connections
   - Credentials in env variables
   - Never in source code

🛡️ Environment Variables
   - Stored securely in Vercel
   - Not in Git repository
   - Separate per environment

✅ Safe & Secure!
```

## Monitoring

```
Vercel Dashboard:
├─ Deployment logs
├─ Function logs
├─ Analytics
├─ Error tracking
└─ Performance metrics

Neon Dashboard:
├─ Database queries
├─ Connection count
├─ Storage usage
└─ Performance stats

All in one place! 📊
```

---

**Ready to deploy? Follow [DEPLOY.md](DEPLOY.md)!** 🚀
