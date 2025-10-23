# 🚂 RAILWAY DEPLOYMENT GUIDE

## **Prerequisites Completed** ✅
- Backend code ready in `simple-server.js`
- Railway PostgreSQL database active
- Environment variables configured
- Package.json updated for Railway

## **Step 1: Push Code to GitHub** 

1. **Initialize Git Repository** (if not already done):
```bash
cd backend
git init
git add .
git commit -m "Initial backend setup for Railway deployment"
```

2. **Create GitHub Repository**:
- Go to https://github.com/new
- Repository name: `immerse-india-backend`
- Set as Public or Private
- Don't initialize with README (we have local code)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/immerse-india-backend.git
git branch -M main
git push -u origin main
```

## **Step 2: Deploy to Railway**

1. **Go to Railway Dashboard**: https://railway.app/dashboard

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `immerse-india-backend` repository

3. **Configure Deployment**:
   - Railway will auto-detect Node.js
   - It will use our `railway.json` configuration
   - Start command: `node simple-server.js` (already configured)

## **Step 3: Add Environment Variables**

In your Railway project dashboard, go to **Variables** tab and add:

```properties
# Database (Railway provides these automatically)
DATABASE_URL=postgresql://postgres:OnRXKfjBUimPwxXFnfxQzJaHAFEWqHXx@turntable.proxy.rlwy.net:15843/railway
DIRECT_URL=postgresql://postgres:OnRXKfjBUimPwxXFnfxQzJaHAFEWqHXx@postgres.railway.internal:5432/railway

# JWT Configuration
JWT_SECRET=8850d84fce9f2aebf4de41b493458edf4129df8ef1c1e4ae2d32127f8994cf76
JWT_EXPIRES_IN=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dn8hhbstq
CLOUDINARY_API_KEY=493937614836824
CLOUDINARY_API_SECRET=ecfTCo3RPVs1i4hFj9rzsLILeCI

# Server Configuration
NODE_ENV=production
FRONTEND_URL=https://immerseindia.vercel.app

# Railway will provide PORT automatically
```

## **Step 4: Get Railway URL**

After deployment, Railway will provide you with a URL like:
```
https://your-app-name-production.up.railway.app
```

## **Step 5: Update Frontend Configuration**

Update your frontend `.env` file with the Railway backend URL:
```properties
REACT_APP_API_URL=https://your-app-name-production.up.railway.app/api
```

## **Step 6: Redeploy Frontend**

Since your frontend is on Vercel, you need to:
1. Push the updated `.env` to your frontend GitHub repo
2. Vercel will auto-redeploy with the new API URL

## **Testing Deployment**

Once deployed, test these endpoints:
- `https://your-railway-url.railway.app/api/health`
- `https://your-railway-url.railway.app/api/auth/credentials`
- `https://your-railway-url.railway.app/api/experiences`

## **Common Issues & Solutions**

### Issue 1: Build Fails
**Solution**: Check Railway logs, ensure all dependencies in package.json

### Issue 2: Environment Variables Not Found
**Solution**: Double-check variables in Railway dashboard Variables tab

### Issue 3: Database Connection Fails
**Solution**: Verify DATABASE_URL matches your Railway PostgreSQL connection

### Issue 4: CORS Issues
**Solution**: Ensure FRONTEND_URL points to immerseindia.vercel.app

## **Monitoring**

Railway provides:
- **Logs**: View real-time application logs
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: History of all deployments

## **Auto-Deploy Setup**

Railway automatically redeploys when you push to GitHub:
```bash
# Make changes to code
git add .
git commit -m "Update backend"
git push origin main
# Railway automatically deploys new version
```

## **Final Verification**

Your complete stack will be:
- **Frontend**: https://immerseindia.vercel.app (✅ Already deployed)
- **Backend**: https://your-app.up.railway.app (🚀 Ready to deploy)
- **Database**: Railway PostgreSQL (✅ Already active)

**Ready to deploy! Follow the steps above to get your backend live on Railway.** 🌟