# Railway Deployment Script for Windows PowerShell

Write-Host "🚂 Starting Railway Deployment Process..." -ForegroundColor Green
Write-Host ""

# Step 1: Prepare for deployment
Write-Host "📦 Step 1: Adding files to git..." -ForegroundColor Yellow
git add .

Write-Host "💾 Step 2: Committing changes..." -ForegroundColor Yellow
git commit -m "Prepare backend for Railway deployment with simple-server.js"

Write-Host "🌐 Step 3: Ready to push to GitHub!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  MANUAL STEPS REQUIRED:" -ForegroundColor Red
Write-Host ""
Write-Host "1. Create GitHub repository:" -ForegroundColor Cyan
Write-Host "   - Go to: https://github.com/new"
Write-Host "   - Repository name: immerse-india-backend"
Write-Host "   - Set as Public"
Write-Host "   - DO NOT initialize with README"
Write-Host ""
Write-Host "2. Run these commands to push:" -ForegroundColor Cyan
Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/immerse-india-backend.git"
Write-Host "   git branch -M main"
Write-Host "   git push -u origin main"
Write-Host ""
Write-Host "3. Deploy on Railway:" -ForegroundColor Cyan
Write-Host "   - Go to: https://railway.app/dashboard"
Write-Host "   - Click 'New Project'"
Write-Host "   - Select 'Deploy from GitHub repo'"
Write-Host "   - Choose 'immerse-india-backend'"
Write-Host ""
Write-Host "4. Add Environment Variables in Railway:" -ForegroundColor Cyan
Write-Host "   DATABASE_URL=postgresql://postgres:OnRXKfjBUimPwxXFnfxQzJaHAFEWqHXx@turntable.proxy.rlwy.net:15843/railway"
Write-Host "   JWT_SECRET=8850d84fce9f2aebf4de41b493458edf4129df8ef1c1e4ae2d32127f8994cf76"
Write-Host "   CLOUDINARY_CLOUD_NAME=dn8hhbstq"
Write-Host "   CLOUDINARY_API_KEY=493937614836824"
Write-Host "   CLOUDINARY_API_SECRET=ecfTCo3RPVs1i4hFj9rzsLILeCI"
Write-Host "   FRONTEND_URL=https://immerseindia.vercel.app"
Write-Host "   NODE_ENV=production"
Write-Host ""
Write-Host "🎉 Files are ready for Railway deployment!" -ForegroundColor Green
Write-Host "📖 See RAILWAY_DEPLOYMENT_GUIDE.md for complete instructions" -ForegroundColor Yellow