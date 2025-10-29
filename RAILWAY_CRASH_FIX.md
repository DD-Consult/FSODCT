# Railway Deployment Crash - Troubleshooting Guide

## Why Railway Crashes After 2-3 Minutes

Most common causes:
1. **Wrong Root Directory** - Railway looking in wrong folder
2. **Port Binding Issue** - App not binding to $PORT
3. **MongoDB Connection Failed** - Can't connect to Atlas
4. **Missing Environment Variables** - Required vars not set

---

## SOLUTION: Step-by-Step Fix

### Step 1: Verify Root Directory Setting

1. **In Railway Dashboard:**
   - Click your service
   - Go to "Settings" tab
   - Scroll to "Service" section
   - Find "Root Directory"
   
2. **Check the value:**
   - Should be: `backend` (lowercase)
   - NOT: `./backend` or `/backend` or blank
   
3. **If incorrect:**
   - Click the pencil icon to edit
   - Type: `backend`
   - Press Enter
   - Railway will redeploy automatically

### Step 2: Check Deployment Logs

1. **In Railway Dashboard:**
   - Click your service
   - Go to "Deployments" tab
   - Click the latest deployment (top one)
   - Click "View Logs"

2. **Look for these error messages:**

   **Error: "ModuleNotFoundError: No module named 'server'"**
   - **Cause**: Wrong root directory
   - **Fix**: Set root directory to `backend` (Step 1)

   **Error: "No module named 'motor'" or "No module named 'bcrypt'"**
   - **Cause**: Dependencies not installed
   - **Fix**: Check requirements.txt exists in backend folder

   **Error: "pymongo.errors.ConfigurationError" or "MongoDB connection failed"**
   - **Cause**: MongoDB connection string wrong
   - **Fix**: Check MONGO_URL variable (Step 3)

   **Error: "Address already in use" or "Port 8001 in use"**
   - **Cause**: Hardcoded port instead of $PORT
   - **Fix**: Already fixed in your code

### Step 3: Verify Environment Variables

1. **In Railway Dashboard:**
   - Click your service
   - Go to "Variables" tab
   
2. **Check all 3 variables exist:**

   ✅ `MONGO_URL`
   - Should look like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
   - **Common mistakes**:
     - Forgot to replace `<password>` with actual password
     - Missing `?retryWrites=true&w=majority` at the end
     - Extra spaces or line breaks
   
   ✅ `DB_NAME`
   - Should be: `fso_database`
   
   ✅ `CORS_ORIGINS`
   - Should be: `https://your-netlify-site.netlify.app`
   - No trailing slash!

3. **If any are wrong:**
   - Click the variable name
   - Edit the value
   - Click "Update"
   - Railway will redeploy

### Step 4: Test MongoDB Connection

**Before continuing, verify MongoDB is accessible:**

1. **Go to MongoDB Atlas**
2. **Click**: "Network Access" (left sidebar)
3. **Verify**: `0.0.0.0/0` is in the IP Access List
   - If not there, click "Add IP Address" → "Allow Access from Anywhere"

4. **Click**: "Database Access" (left sidebar)
5. **Verify**: Your database user exists
   - Username should match what's in MONGO_URL
   - If password is wrong, you can reset it here

### Step 5: Force Redeploy on Railway

1. **In Railway Dashboard:**
   - Go to "Deployments" tab
   - Click "⋮" (three dots) on latest deployment
   - Click "Redeploy"
   
2. **Watch the logs:**
   - Should see: "INFO: Started server process"
   - Should see: "INFO: Application startup complete"
   - Should see: "INFO: Uvicorn running on..."

3. **If deployment succeeds:**
   - Status shows green checkmark
   - Service stays running (doesn't crash)

---

## Common Error Messages & Fixes

### Error 1: "Health check failed"

```
Health check on port XXXX failed
```

**Cause**: App not responding on Railway's assigned port

**Fix**:
1. Check start command uses `$PORT` variable
2. In Settings → verify start command is:
   ```
   uvicorn server:app --host 0.0.0.0 --port $PORT
   ```
3. No `cd backend` needed (root directory already set)

### Error 2: "Application failed to respond"

```
Application failed to respond to health checks
```

**Cause**: Server crashed during startup

**Fix**:
1. Check deployment logs for Python errors
2. Usually a MongoDB connection issue
3. Verify MONGO_URL format is correct

### Error 3: "pymongo.errors.ServerSelectionTimeoutError"

```
No servers found yet, trying again in X seconds
```

**Cause**: Can't connect to MongoDB Atlas

**Fix**:
1. MongoDB Atlas → Network Access → Add 0.0.0.0/0
2. Check MONGO_URL has correct password
3. Verify cluster is active (not paused)

### Error 4: "ModuleNotFoundError: No module named 'X'"

```
ModuleNotFoundError: No module named 'motor'
```

**Cause**: Dependencies not installed

**Fix**:
1. Verify requirements.txt is in backend folder
2. Check Railway build logs show "pip install -r requirements.txt"
3. Might need to add build command in Settings

---

## Debugging Steps

### Step 1: Check Railway Service Settings

**Settings Tab - Verify:**
- ✅ Root Directory: `backend`
- ✅ Start Command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- ✅ Builder: NIXPACKS (or Python)

### Step 2: Check Build Logs

**Deployments Tab → Latest Deployment → Build Logs:**

Look for:
```
✅ Installing dependencies from requirements.txt
✅ Successfully installed motor bcrypt fastapi...
✅ Build completed
```

If you see errors here, dependencies aren't installing.

### Step 3: Check Deploy Logs

**Deployments Tab → Latest Deployment → Deploy Logs:**

Look for:
```
✅ INFO: Started server process
✅ INFO: Waiting for application startup
✅ INFO: Application startup complete
✅ INFO: Uvicorn running on http://0.0.0.0:XXXX
```

If it crashes, you'll see:
```
❌ ERROR: ...
❌ Process exited with code 1
```

The error message tells you exactly what's wrong.

---

## Step-by-Step Debugging Process

**1. Get the Exact Error Message:**

In Railway:
- Deployments → Click latest deployment
- Click "View Logs"
- Scroll to the bottom
- Find the last error before "Process exited"
- **Copy the error message**

**2. Common Errors & Quick Fixes:**

**Error says "No module named 'server'":**
→ Root Directory is wrong
→ Fix: Settings → Root Directory → Set to `backend`

**Error says "can't connect to MongoDB":**
→ MONGO_URL is wrong or MongoDB Network Access not set
→ Fix: Check MongoDB Atlas Network Access has 0.0.0.0/0
→ Fix: Verify MONGO_URL password is correct (no <>)

**Error says "port already in use":**
→ Using hardcoded port instead of $PORT
→ Fix: Check start command has `--port $PORT`

**Error says "module 'bcrypt' not found":**
→ Requirements not installing
→ Fix: Check requirements.txt is in backend folder

**No error, just stops:**
→ Health check timeout
→ Fix: App might be starting too slowly
→ Add: `--timeout-keep-alive 30` to start command

---

## Updated Files for You

I've created these to help with deployment:

1. **`/app/backend/nixpacks.toml`** - Railway build configuration
2. **`/app/backend/Procfile`** - Alternative start configuration
3. **`/app/railway.toml`** - Fixed Railway config

---

## Action Items for You

**Right Now:**

1. **Get the crash logs:**
   - Railway → Deployments → Latest → View Logs
   - Copy the error message at the bottom
   - Share it with me so I can diagnose the exact issue

2. **Verify Settings:**
   - Settings → Root Directory = `backend`
   - Variables → All 3 variables exist and are correct
   - Start Command = `uvicorn server:app --host 0.0.0.0 --port $PORT`

3. **Common Quick Fixes to Try:**

   **Fix A: Update Start Command**
   - Settings → scroll to "Deploy"
   - Custom Start Command:
     ```
     uvicorn server:app --host 0.0.0.0 --port $PORT --timeout-keep-alive 30
     ```
   - Save and redeploy

   **Fix B: Check MongoDB Connection String**
   - Variables → Edit MONGO_URL
   - Make sure it looks EXACTLY like:
     ```
     mongodb+srv://username:actualpassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - No angle brackets `<>`
   - No spaces
   - Has `?retryWrites=true&w=majority` at end

   **Fix C: Simplify CORS**
   - Variables → Edit CORS_ORIGINS
   - Temporarily set to: `*`
   - This rules out CORS as the issue
   - Later change back to your Netlify URL

---

## Share These With Me

To help you faster, please share:

1. **Last 20 lines of Railway deploy logs** (from "View Logs")
2. **Your environment variables** (hide passwords, just show format):
   ```
   MONGO_URL = mongodb+srv://username:***@cluster.mongodb.net/...
   DB_NAME = fso_database
   CORS_ORIGINS = https://...
   ```
3. **Root Directory setting** (from Settings tab)

**I can then give you the exact fix for your specific error!** 🔧
