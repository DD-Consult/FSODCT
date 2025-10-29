# Complete Railway.app Deployment Guide for FSO Project Hub

## Part 1: Setup MongoDB Atlas (Database)

### Step 1: Create MongoDB Atlas Account

1. **Go to**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** using:
   - Email address
   - Or "Sign in with Google" (easier)
3. **Click** "Create an account" or use Google sign-in

### Step 2: Create Free Database Cluster

1. After login, you'll see "Create a deployment"
2. **Select**: M0 FREE tier
   - Shows "FREE" badge
   - 512 MB storage (plenty for this project)
3. **Cloud Provider**: AWS (default is fine)
4. **Region**: Choose closest to you (e.g., Sydney for Australia)
5. **Cluster Name**: Leave default or rename to "fso-cluster"
6. **Click**: "Create Deployment" (green button)

### Step 3: Create Database User

**Important: This appears immediately after cluster creation**

1. **Username**: Choose a username (e.g., `fso_admin`)
2. **Password**: Click "Autogenerate Secure Password" button
   - **CRITICAL**: Copy this password immediately and save it!
   - Or create your own password (at least 8 characters)
3. **Click**: "Create Database User"

**Save these credentials:**
```
Username: fso_admin
Password: [your-generated-password]
```

### Step 4: Set Network Access (Allow Connections)

1. **Click**: "Network Access" in left sidebar
2. **Click**: "Add IP Address" button
3. **Select**: "Allow Access from Anywhere"
   - This adds `0.0.0.0/0`
   - Required for Railway to connect
4. **Click**: "Confirm"

### Step 5: Get Connection String

1. **Click**: "Database" in left sidebar
2. **Click**: "Connect" button on your cluster
3. **Select**: "Connect your application"
4. **Driver**: Python, Version 3.12 or later
5. **Copy** the connection string - looks like:
   ```
   mongodb+srv://fso_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Replace** `<password>` with your actual password:
   ```
   mongodb+srv://fso_admin:YourActualPassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

**Save this complete connection string!** You'll need it for Railway.

---

## Part 2: Deploy Backend to Railway.app

### Step 1: Create Railway Account

1. **Go to**: https://railway.app
2. **Click**: "Login" (top right)
3. **Sign in with GitHub**
   - This is required to deploy from GitHub
   - Click "Authorize Railway"
4. You'll see the Railway dashboard

### Step 2: Create New Project

1. **Click**: "New Project" (big purple button)
2. **Select**: "Deploy from GitHub repo"
3. **Choose**: Your FSO Project Hub repository
   - If you don't see it, click "Configure GitHub App" and grant access
4. **Click** on your repository name

### Step 3: Configure Backend Service

1. Railway will detect your code and show "New Service"
2. **Click** on the new service card
3. **Go to**: "Settings" tab
4. **Root Directory**: Set to `backend`
   - Scroll to "Service" section
   - Find "Root Directory"
   - Enter: `backend`
   - Railway will now only deploy the backend folder

### Step 4: Add Environment Variables

1. **Click**: "Variables" tab
2. **Click**: "New Variable" button
3. **Add these 3 variables ONE BY ONE**:

   **Variable 1:**
   - Name: `MONGO_URL`
   - Value: `mongodb+srv://fso_admin:YourPassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - (Use your actual connection string from MongoDB Atlas)

   **Variable 2:**
   - Name: `DB_NAME`
   - Value: `fso_database`

   **Variable 3:**
   - Name: `CORS_ORIGINS`
   - Value: `https://your-netlify-site.netlify.app`
   - (Replace with your actual Netlify URL - get this from Netlify dashboard)

4. **Important**: After adding all variables, Railway will auto-redeploy

### Step 5: Generate Public Domain

1. **Go to**: "Settings" tab
2. **Scroll to**: "Networking" section
3. **Click**: "Generate Domain" button
4. Railway will create a public URL like:
   ```
   https://fso-project-hub-backend-production-xxxx.up.railway.app
   ```
5. **Copy this URL** - you'll need it for Netlify!

### Step 6: Wait for Deployment

1. **Click**: "Deployments" tab
2. Watch the deployment logs
3. Wait for "SUCCESS" status (usually 2-3 minutes)
4. Green checkmark means it's live!

### Step 7: Test Your Backend

Open a terminal or browser and test:

```bash
# Test backend is alive (should return 401 - that's correct!)
curl https://your-railway-url.up.railway.app/api/auth/me

# Test backend docs
Open in browser: https://your-railway-url.up.railway.app/docs
```

If you see "Not Found" or "401 Unauthorized" - **that's good!** It means backend is running.

---

## Part 3: Connect Netlify Frontend to Railway Backend

### Step 1: Update Netlify Environment Variable

1. **Go to**: Netlify dashboard (https://app.netlify.com)
2. **Click**: Your FSO site
3. **Go to**: "Site configuration" → "Environment variables"
4. **Find**: `REACT_APP_BACKEND_URL`
5. **Edit** and change value to:
   ```
   https://your-railway-url.up.railway.app
   ```
   **Important**: No trailing slash!

6. **Click**: "Save"

### Step 2: Trigger Netlify Redeploy

1. **Go to**: "Deploys" tab
2. **Click**: "Trigger deploy" → "Deploy site"
3. Wait 2-3 minutes for build to complete
4. Green checkmark = deployed!

### Step 3: Update Backend CORS (Back to Railway)

1. **Go back to**: Railway dashboard
2. **Click**: Your backend service
3. **Go to**: "Variables" tab
4. **Edit**: `CORS_ORIGINS` variable
5. **Update** value to your Netlify URL:
   ```
   https://your-actual-site.netlify.app
   ```
6. Railway will auto-redeploy (wait 1-2 minutes)

---

## Part 4: Final Testing

### Test Complete Flow

1. **Open**: Your Netlify URL in browser
2. **Clear browser cache**: Ctrl+Shift+R (or Cmd+Shift+R)
3. **Click**: "Access Learner Portal"
4. **Fill** registration form:
   - Name: Your name
   - Email: your.email@example.com
   - Cohort: Choose any
   - Class Type: Choose any
5. **Click**: "Register for Training"
6. **Expected**: Should redirect to learner dashboard ✅

If registration works - **SUCCESS!** 🎉

If it fails:
- Check browser console (F12) for errors
- Verify `REACT_APP_BACKEND_URL` in Netlify
- Verify `CORS_ORIGINS` in Railway
- Check Railway deployment logs

---

## Troubleshooting

### Issue: "Failed to fetch" or "Network Error"

**Fix:**
1. Verify backend is deployed on Railway (green checkmark)
2. Test backend URL directly: `https://your-railway-url.up.railway.app/docs`
3. Check `REACT_APP_BACKEND_URL` in Netlify matches Railway URL exactly

### Issue: "CORS Error"

**Fix:**
1. In Railway → Variables → `CORS_ORIGINS`
2. Make sure it exactly matches your Netlify URL
3. No trailing slash!
4. Wait for Railway to redeploy

### Issue: "Internal Server Error" (500)

**Fix:**
1. In Railway → Deployments → Click latest deployment
2. Check logs for errors
3. Usually a MongoDB connection issue
4. Verify `MONGO_URL` is correct
5. Check MongoDB Atlas → Network Access allows `0.0.0.0/0`

### Issue: MongoDB Connection Failed

**Fix:**
1. MongoDB Atlas → Database Access
2. Verify user exists with correct password
3. MongoDB Atlas → Network Access
4. Verify `0.0.0.0/0` is in IP Access List
5. Test connection string format:
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

---

## Quick Reference

### Your URLs After Deployment:

```
Frontend (Netlify): https://your-site.netlify.app
Backend (Railway):  https://your-backend.up.railway.app
Database (Atlas):   mongodb+srv://...
```

### Environment Variables:

**Netlify (Frontend):**
```
REACT_APP_BACKEND_URL=https://your-backend.up.railway.app
```

**Railway (Backend):**
```
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=fso_database
CORS_ORIGINS=https://your-site.netlify.app
```

---

## Estimated Time

- MongoDB Atlas setup: **5-10 minutes**
- Railway backend deployment: **5 minutes**
- Netlify configuration: **2 minutes**
- Testing: **5 minutes**

**Total: ~20-30 minutes** ⏱️

---

## Need Help?

**Railway Discord**: https://discord.gg/railway
**MongoDB Support**: https://www.mongodb.com/community/forums

**Common Questions:**

Q: Is Railway free?
A: Yes! Free tier includes 500 hours/month (enough for this project)

Q: Is MongoDB Atlas free?
A: Yes! M0 tier is free forever with 512MB storage

Q: Do I need a credit card?
A: Railway requires GitHub account (no credit card needed for free tier)
   MongoDB Atlas may ask for credit card verification but won't charge

Q: How long does deployment take?
A: Backend: 2-3 minutes, Frontend rebuild: 2-3 minutes

---

**You're almost there! Follow these steps and your app will be fully live!** 🚀
