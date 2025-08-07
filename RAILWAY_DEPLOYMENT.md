# Railway Deployment Guide for IM-CONNECTED

## Overview
This guide will help you deploy the IM-CONNECTED application to Railway with the fixes for static file serving and API endpoints.

## ✅ Recent Fixes Applied
- Fixed static file serving path from `../../public` to `../public`
- Updated API configuration to use relative paths in production
- Fixed hardcoded localhost URLs in frontend components
- Added missing API endpoints for saved posts
- Disabled Google Cloud Storage to prevent bucket errors
- Updated CORS configuration for Railway domains

## 🚀 Railway Deployment Steps

### 1. Environment Variables Setup
Go to your Railway project dashboard and add these environment variables:

**Required Variables:**
```bash
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-connection-string
TOKEN_KEY=your-super-secret-jwt-key-change-this
JWT_SECRET=your-super-secret-jwt-key-change-this
TOKEN_EXPIRY=1d
AUTH_EMAIL=your-email@gmail.com
AUTH_PASS=your-gmail-app-password
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Optional Variables (for AI features):**
```bash
OPENAI_API_KEY=your-openai-api-key
OPENAI_ASSISTANT_ID=your-openai-assistant-id
GOOGLE_TRANSLATE_API_KEY=your-google-translate-api-key
```

**Security Variable (recommended):**
```bash
ENCRYPTION_SECRET=your-32-character-encryption-secret-key
```

### 2. Database Setup
Make sure your MongoDB Atlas database is configured:
- Allow connections from all IPs (0.0.0.0/0) in Network Access
- Create a database user with read/write permissions
- Use the connection string in `MONGODB_URI`

### 3. Railway Configuration
The application uses the existing `Dockerfile` which:
- Builds the frontend using Vite
- Copies the built files to the backend's public directory
- Serves both API and static files from port 5001

### 4. Custom Domain (Optional)
- In Railway dashboard, go to Settings > Domains
- Add your custom domain or use the provided Railway domain
- Update CORS origins in backend if needed

## 🔧 Architecture Details

### Frontend → Backend Communication
- In development: Frontend calls `http://localhost:5001/api/v1/*`
- In production: Frontend uses relative paths `/api/v1/*`
- Backend serves frontend static files and handles API routes

### File Structure in Production
```
/app (Docker container)
├── src/ (Backend code)
├── public/ (Built frontend files)
│   ├── index.html
│   ├── assets/
│   └── ...
└── package.json (Backend dependencies)
```

## 🔍 Debugging Tips

### If you see a white screen:
1. Check Railway logs for static file serving errors
2. Verify the build created files in `/app/public/`
3. Check browser console for 404 errors

### If API calls fail:
1. Verify environment variables are set in Railway
2. Check CORS configuration in backend
3. Ensure MongoDB Atlas allows Railway IP addresses

### If the app crashes on startup:
1. Check that all required environment variables are set
2. Verify MongoDB connection string is correct
3. Look for missing npm packages in build logs

## 📝 Key Fixes Applied

1. **Static File Path**: Fixed from `../../public` to `../public` to match Docker structure
2. **API Configuration**: Uses relative paths in production for same-domain requests
3. **Component Updates**: Replaced hardcoded localhost URLs with centralized API config
4. **Google Cloud Storage**: Disabled to prevent bucket configuration errors
5. **CORS Origins**: Added Railway domains to allowed origins

## 🚀 Next Steps After Deployment

1. Test user registration and login
2. Test forum posting and saving posts
3. Test file uploads (using Cloudinary)
4. Set up monitoring and logging
5. Configure custom domain if needed

## 🆘 Support
If you encounter issues, check:
- Railway deployment logs
- Browser developer console
- MongoDB Atlas connection logs
- Environment variable configuration
