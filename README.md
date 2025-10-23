# Travel Dashboard Backend Setup Guide

## 🚀 Backend Setup Complete!

Your backend is now fully configured with:
- ✅ Express.js API server
- ✅ Prisma ORM with PostgreSQL
- ✅ JWT Authentication
- ✅ Cloudinary image uploads
- ✅ CORS configuration
- ✅ Error handling
- ✅ All CRUD endpoints

## 📋 Next Steps

### 1. Database Setup with Railway (Recommended)

Follow these steps to set up your PostgreSQL database on Railway:

1. **Create Railway Account**:
   - Sign up at [Railway](https://railway.app)
   - Create a new project

2. **Add PostgreSQL Database**:
   - In your project dashboard, click "New"
   - Select "Database" → "PostgreSQL"
   - Wait for provisioning to complete

3. **Get Connection String**:
   - Navigate to your PostgreSQL service
   - Click "Connect"
   - Copy the "Postgres Connection URL"

4. **Update Environment Variables**:
   - Create a `.env` file in the backend directory (if not already present)
   - Add your connection string:
   ```
   DATABASE_URL="postgresql://postgres:password@containers-us-west-XXX.railway.app:XXXX/railway"
   ```

5. **Test Connection**:
   ```bash
   node test-railway-connection.js
   ```

6. **Push Prisma Schema**:
   ```bash
   npx prisma db push
   ```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Create Your First Admin User
```bash
# Start the server first
npm run dev

# Then register an admin user via API call or Prisma Studio
npx prisma studio
```

### 4. Set Up Cloudinary for Image Uploads

1. **Create Cloudinary Account**:
   - Sign up at [Cloudinary](https://cloudinary.com)

2. **Get API Credentials**:
   - Go to Dashboard to find your credentials
   - Copy Cloud Name, API Key, and API Secret

3. **Update Environment Variables**:
   - Add Cloudinary credentials to your `.env` file:
   ```
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ```

4. **Set Upload Preset** (optional for unsigned uploads):
   - Go to Settings → Upload
   - Create an upload preset with your desired settings

## 🌐 Deployment Instructions

### Option 1: Railway Deployment (Recommended for Backend + Database)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**:
   ```bash
   railway login
   ```

3. **Link Your Project**:
   ```bash
   # Inside your backend directory
   railway link
   ```

4. **Add PostgreSQL Database**:
   ```bash
   railway add
   # Select PostgreSQL from the options
   ```

5. **Set Up Environment Variables**:
   ```bash
   # Set variables on Railway
   railway variables set JWT_SECRET=your_secret_key
   railway variables set NODE_ENV=production
   # Optional: Set Cloudinary variables
   railway variables set CLOUDINARY_CLOUD_NAME=your_cloud_name
   railway variables set CLOUDINARY_API_KEY=your_api_key
   railway variables set CLOUDINARY_API_SECRET=your_api_secret
   ```

6. **Deploy to Railway**:
   ```bash
   railway up
   ```

7. **Get Your Deployed URL**:
   ```bash
   railway domain
   ```

### Option 2: Vercel Deployment (Recommended for Frontend)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy the Frontend**:
   ```bash
   # Navigate to your frontend directory
   cd ../frontend
   vercel
   ```

4. **Configure Environment Variables**:
   - In Vercel dashboard, go to your project
   - Navigate to Settings → Environment Variables
   - Add `REACT_APP_API_URL` pointing to your Railway backend

5. **Set Up Production Deployment**:
   ```bash
   vercel --prod
   ```

## 🧪 Testing the Backend

### Start Development Server
```bash
npm run dev
```

### Test Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "password123",
    "role": "admin"
  }'

# Get experiences
curl http://localhost:5000/api/experiences
```

## 🔧 Configuration Files

### Current Structure:
```
backend/
├── server.js          # Main API server
├── package.json       # Dependencies & scripts
├── .env              # Environment variables
├── prisma/
│   └── schema.prisma  # Database schema
└── README.md         # This file
```

### Environment Variables (.env):
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `CLOUDINARY_*` - Image upload credentials
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - CORS origin (default: http://localhost:3000)

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Content Management (Protected)
- `GET /api/experiences?region=All` - Get experiences
- `POST /api/experiences` - Create experience
- `GET /api/itineraries?region=All` - Get itineraries
- `POST /api/itineraries` - Create itinerary
- `GET /api/images?region=All` - Get images
- `POST /api/images` - Upload image
- `GET /api/updates` - Get updates
- `POST /api/updates` - Create update

### Search
- `GET /api/search?q=query` - Search all content

## 🚢 Ready for Production

Your backend is production-ready with:
- Security best practices
- File upload handling
- Database relationships
- Error handling
- CORS protection
- JWT authentication

Next: Set up your database and start building! 🎉