# Fix Vercel Build Error - Manual Redeploy

Your `vercel.json` has been updated and pushed to GitHub, but Vercel is still using the old build configuration.

Follow these steps to manually redeploy:

---

## Step 1: Go to Vercel Dashboard
```
1. Open https://vercel.com/dashboard
2. Sign in with GitHub
```

## Step 2: Select Your Project
```
3. Find "sit-3" or "placementpro-frontend" project
4. Click to open it
```

## Step 3: Access Deployments
```
5. Click "Deployments" in the top navigation bar
```

## Step 4: Find the Latest Deployment
```
6. Look for the deployment with the error
   (It should say "Failed" or show the build error)
7. Click on it to view details
```

## Step 5: Redeploy
```
8. Click the three dots menu (...) on the right
9. Select "Redeploy"
10. A dialog will appear asking to confirm
11. Click "Redeploy" again to confirm
```

## Step 6: Wait for Build
```
12. Watch the "Logs" tab for build progress
13. Should now use the new command:
    "npm install && npm run build"
14. Wait for "✅ Deployment completed"
```

---

## What the New Build Should Look Like

```
✓ Detected: Vite
✓ Installing dependencies...
✓ Running: npm install && npm run build
✓ Built successfully
✓ Deployment completed
```

## Expected Build Time
- Installation: 2-3 minutes
- Build: 1-2 minutes
- Total: 5-10 minutes

---

## If Still Fails

If you still get the same error:

**Option A: Clear Vercel Cache**
1. Deployments → Latest failed deployment → ... → Redeploy (clears cache)

**Option B: Delete and Reconnect**
1. Vercel Settings → Git Integration
2. Disconnect your GitHub repo
3. Reconnect it
4. Redeploy

**Option C: Deploy from GitHub**
1. Push a new commit:
   ```bash
   git add .
   git commit -m "chore: Trigger rebuild" --allow-empty
   git push origin main
   ```
2. Vercel auto-deploys

---

## After Successful Deploy

1. Visit your app URL: https://your-app.vercel.app
2. Verify it loads
3. Check that dark theme is active
4. Test login functionality

---

## What You're Fixing

**Old (broken):**
```
buildCommand: npm install --prefix placementpro-frontend && npm run build --prefix placementpro-frontend
outputDirectory: placementpro-frontend/dist
→ Creates double path: /vercel/path0/placementpro-frontend/placementpro-frontend/
```

**New (fixed):**
```
buildCommand: npm install && npm run build
outputDirectory: dist
root: placementpro-frontend
→ Correct path: /vercel/path0/placementpro-frontend/
```

---

**Start with Step 1 above and let me know when the deployment completes!**
