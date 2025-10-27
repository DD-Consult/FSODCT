# FSO Project Hub - Deployment Guide

## Frontend Deployment (Netlify)

### Prerequisites
1. GitHub account
2. Netlify account (sign up at netlify.com)
3. Push your code to GitHub repository

### Step 1: Prepare Your Repository

Your repository structure should look like:
```
/
├── frontend/          # React frontend
├── backend/           # FastAPI backend (not deployed to Netlify)
├── netlify.toml       # ✅ Already configured
├── .nvmrc            # ✅ Already configured (Node 20)
├── .node-version     # ✅ Already configured (Node 20)
└── README_DEPLOYMENT.md
```

### Step 2: Push to GitHub

```bash
cd /app
git init
git add .
git commit -m "Initial commit - FSO Project Hub"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 3: Deploy to Netlify

#### Option A: Netlify UI (Recommended)

1. **Log in to Netlify**: Go to https://app.netlify.com

2. **Import from Git**:
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Authorize Netlify to access your GitHub
   - Select your repository

3. **Build Settings** (auto-detected from netlify.toml):
   - **Base directory**: (leave empty)
   - **Build command**: `cd frontend && yarn install && yarn build`
   - **Publish directory**: `frontend/build`
   - **Node version**: 20 (auto-detected from .nvmrc)

4. **Environment Variables** (CRITICAL):
   Click "Site settings" → "Environment variables" → "Add a variable"
   
   Add:
   ```
   REACT_APP_BACKEND_URL = https://your-backend-api.com
   ```
   
   ⚠️ **Replace with your actual backend URL** (see Backend Deployment below)

5. **Deploy**:
   - Click "Deploy site"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at: `https://random-name-123456.netlify.app`

6. **Custom Domain** (Optional):
   - Go to "Site settings" → "Domain management"
   - Add your custom domain

#### Option B: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Step 4: Auto-Deploy Setup

✅ **Already configured!** Every push to `main` branch will automatically:
1. Trigger Netlify build
2. Use Node 20 (from .nvmrc)
3. Build React app
4. Deploy to production

**Deploy Previews**: Pull requests will get preview URLs automatically!

---

## Backend Deployment (FastAPI)

⚠️ **Backend CANNOT deploy to Netlify** (Netlify is for static sites only)

### Recommended Backend Hosting Options:

#### Option 1: Render.com (Easiest)

1. **Sign up**: https://render.com
2. **Create New Web Service**
3. **Connect GitHub repository**
4. **Configure**:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**:
     ```
     MONGO_URL=mongodb+srv://your-mongodb-url
     DB_NAME=fso_database
     CORS_ORIGINS=https://your-netlify-site.netlify.app
     ```

#### Option 2: Railway.app

1. **Sign up**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Add MongoDB** (Railway Marketplace)
4. **Configure**:
   - Auto-detects Python
   - Add environment variables

#### Option 3: Heroku

Create `Procfile` in `/app/backend/`:
```
web: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
```

#### Option 4: AWS/Azure/Google Cloud

For production-grade deployment with scalability.

---

## MongoDB Setup

### Option 1: MongoDB Atlas (Free)

1. **Sign up**: https://www.mongodb.com/cloud/atlas
2. **Create Free Cluster**
3. **Create Database User**
4. **Whitelist IP**: 0.0.0.0/0 (allow all) for testing
5. **Get Connection String**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/fso_database
   ```
6. **Add to Backend Environment Variables**

---

## Complete Deployment Checklist

### Frontend (Netlify)
- [ ] Push code to GitHub
- [ ] Connect repository to Netlify
- [ ] Set `REACT_APP_BACKEND_URL` environment variable
- [ ] Verify build succeeds
- [ ] Test deployed site

### Backend (Render/Railway/Heroku)
- [ ] Choose hosting platform
- [ ] Connect repository
- [ ] Set up MongoDB Atlas
- [ ] Configure environment variables:
  - [ ] `MONGO_URL`
  - [ ] `DB_NAME`
  - [ ] `CORS_ORIGINS` (your Netlify URL)
- [ ] Verify API is accessible
- [ ] Test API endpoints

### Final Integration
- [ ] Update Netlify `REACT_APP_BACKEND_URL` with backend URL
- [ ] Update backend `CORS_ORIGINS` with Netlify URL
- [ ] Test login flow
- [ ] Test learner registration
- [ ] Test PMO dashboard
- [ ] Test learner portal
- [ ] Test chatbot

---

## Troubleshooting

### Build Fails on Netlify

**Error**: "Node version mismatch"
- **Fix**: Check `.nvmrc` file exists with "20"

**Error**: "Module not found"
- **Fix**: Clear cache and redeploy
  - Site settings → Build & deploy → Clear cache and retry deploy

**Error**: "Command failed"
- **Fix**: Check build logs, ensure all dependencies in package.json

### CORS Errors

**Error**: "Access-Control-Allow-Origin"
- **Fix**: Add Netlify URL to backend `CORS_ORIGINS`:
  ```python
  CORS_ORIGINS="https://your-site.netlify.app,http://localhost:3000"
  ```

### API Not Connecting

**Error**: "Failed to fetch"
- **Fix**: Verify `REACT_APP_BACKEND_URL` in Netlify environment variables
- **Fix**: Ensure backend is running and accessible
- **Fix**: Check backend URL ends without trailing slash

---

## Environment Variables Reference

### Frontend (Netlify)
```bash
REACT_APP_BACKEND_URL=https://your-backend-api.com
```

### Backend (Render/Railway/etc)
```bash
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=fso_database
CORS_ORIGINS=https://your-site.netlify.app
```

---

## Need Help?

- **Netlify Docs**: https://docs.netlify.com
- **Render Docs**: https://render.com/docs
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com

---

## Quick Deploy Commands

```bash
# Frontend only (Netlify CLI)
cd /app
netlify deploy --prod

# Test frontend locally
cd /app/frontend
yarn start

# Test backend locally
cd /app/backend
uvicorn server:app --reload
```

**Your app is now ready for deployment! 🚀**
