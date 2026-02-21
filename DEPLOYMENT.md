# PlacementPro - Deployment Guide

This project is configured for deployment on both **Render** and **Vercel** platforms.

---

## Quick Deployment Summary

| Platform | Frontend | Backend | Setup Time |
|----------|----------|---------|------------|
| **Render** | ✅ Static Site | ✅ Web Service | 5 min |
| **Vercel** | ✅ Static Site | ⚠️ Separate (or Render) | 5 min |

---

## Option 1: Deploy Everything on Render (Recommended)

### Best for: Full-stack deployment in one place

**Step 1: Prepare Repository**
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit with Render config"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

**Step 2: Deploy on Render**
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Render will auto-detect `render.yaml`
6. Configure the following:
   - Service: `placementpro-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

**Step 3: Add Environment Variables**
In Render Dashboard → Environment → Add these values:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `GEMINI_API_KEY`: Your Google Gemini API key
- `EMAIL_USER`: Gmail account for email service
- `EMAIL_PASSWORD`: Gmail app password
- `FRONTEND_URL`: Your deployed frontend URL (e.g., https://placementpro-frontend.onrender.com)
- `VITE_API_URL`: Your deployed backend URL (e.g., https://placementpro-backend.onrender.com/api)

**Step 4: Deploy Frontend**
- Create another Web Service for the frontend
- Root Directory: `placementpro-frontend`
- Build Command: `npm install && npm run build`
- Start Command: `npm run preview` (or use Static Site)

**Deployment Complete!** 🎉

---

## Option 2: Frontend on Vercel + Backend on Render

### Best for: Optimized static hosting + API backend separation

### Part A: Deploy Frontend on Vercel

**Step 1: Prepare Repository**
```bash
git init
git add .
git commit -m "Initial commit with Vercel config"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

**Step 2: Deploy Frontend**
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Select your repository
5. Configure:
   - Framework: `Vite`
   - Root Directory: `placementpro-frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add Environment Variable:
   - `VITE_API_URL`: Leave blank for now (we'll update after backend is deployed)
7. Click "Deploy"

### Part B: Deploy Backend on Render

**Step 1: Deploy Backend**
1. Go to [render.com](https://render.com)
2. Sign in with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Service Name: `placementpro-backend`
   - Root Directory: `placementpro-backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: Free (or paid)

**Step 2: Add Backend Environment Variables**
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `GEMINI_API_KEY`: Your Google Gemini API key
- `EMAIL_USER`: Gmail account
- `EMAIL_PASSWORD`: Gmail app password
- `FRONTEND_URL`: Your Vercel frontend URL
- `VITE_API_URL`: Your Render backend URL + `/api`

**Step 3: Update Vercel Environment Variables**
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Update `VITE_API_URL` with your Render backend URL
3. Redeploy the frontend

**Deployment Complete!** 🎉

---

## Option 3: Both on Vercel (Advanced)

### Best for: Single platform, but requires additional setup

⚠️ **Note**: Vercel's free tier doesn't support long-running Node.js servers. You'll need:
- Vercel Pro for backend deployment, OR
- Convert backend to serverless functions

For now, we recommend **Option 1** or **Option 2**.

---

## Environment Variables Reference

### Backend (.env)
```
PORT=5000
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=<your-gemini-api-key>
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASSWORD=<app-password>
EMAIL_FROM=PlacementPro <noreply@placementpro.com>
FRONTEND_URL=<frontend-url>
NODE_ENV=production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=5000
OTP_EXPIRY_MINUTES=10
VITE_API_URL=<backend-api-url>
```

### Frontend (.env or during build)
```
VITE_API_URL=<backend-api-url>
```

---

## Common Issues & Solutions

### Issue 1: CORS Errors
**Solution**: Ensure `FRONTEND_URL` environment variable is correctly set on the backend

### Issue 2: MongoDB Connection Fails
**Solution**: 
- Check MongoDB URI in environment variables
- Whitelist Render/Vercel IP in MongoDB Atlas: Security → Network Access → Add IP Address → 0.0.0.0/0 (for development)

### Issue 3: Socket.IO Connection Issues
**Solution**: 
- Ensure `FRONTEND_URL` points to the correct frontend domain
- Check CORS configuration in backend/server.js

### Issue 4: Email Not Sending
**Solution**:
- Enable 2-Step Verification on Gmail
- Generate an App Password: https://myaccount.google.com/apppasswords
- Use the app password (not your Gmail password) for `EMAIL_PASSWORD`

### Issue 5: Frontend Shows "Cannot find backend"
**Solution**:
- Update `VITE_API_URL` environment variable
- Ensure backend is running and accessible
- Check network tab in browser DevTools

---

## Monitoring & Logs

### Render
- Dashboard → Services → Select service → Logs
- Real-time logs available for debugging

### Vercel
- Dashboard → Project → Deployments → Select deployment → Logs
- Edge logs and Function logs available

---

## Updating Your Deployment

### For Render
```bash
git add .
git commit -m "Update feature"
git push origin main
# Render auto-redeploys on main branch push
```

### For Vercel
```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel auto-redeploys on push
```

---

## Cost Estimation

**Render Free Tier:**
- 1 free web service (512 MB RAM, 0.5 vCPU)
- Auto-sleeps after 15 min inactivity
- 1 free static site

**Vercel Free Tier:**
- Unlimited static site deployments
- 100 GB bandwidth/month
- Fast global CDN

**Recommendation**: Use free tiers for development/portfolio, upgrade as needed for production.

---

## Support & Resources

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Google Gemini API: https://ai.google.dev/

---

**Last Updated**: 2024
**Project**: PlacementPro v1.0.0
