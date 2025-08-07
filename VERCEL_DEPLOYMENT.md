# Vercel Deployment Guide for IM-CONNECTED

## Issues Fixed

Your Vercel deployment wasn't working because:

1. **Wrong function structure**: Vercel serverless functions need to be in `/api` directory
2. **Mixed module systems**: Your backends use CommonJS and ES modules
3. **Missing exports**: Original backend files didn't export properly for serverless
4. **CORS issues**: Frontend couldn't communicate with backend functions

## Changes Made

### 1. Created Serverless Function Wrappers

- **`/api/forum.js`**: Wraps your Forum backend (Express app)
- **`/api/scanner.js`**: Wraps your Scanner backend (ES modules)
- **`/api/assistants/index.js`**: Simplified OpenAI assistant endpoint

### 2. Updated `vercel.json`

- Fixed function paths to point to `/api` directory
- Added environment variable placeholders
- Updated routing configuration
- Increased maxDuration to 30 seconds

### 3. Fixed CORS Issues

- Updated Forum backend to allow Vercel domains
- Added CORS headers to all API functions

## Environment Variables Setup

**CRITICAL**: Add these environment variables in your Vercel dashboard:

### Go to Project Settings > Environment Variables:

```
MONGODB_URI=mongodb+srv://your-atlas-connection-string
TOKEN_KEY=your-jwt-secret-key
TOKEN_EXPIRY=30d
AUTH_EMAIL=your-gmail-address
AUTH_PASS=your-gmail-app-password
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
OPENAI_API_KEY=your-openai-api-key
OPENAI_ASSISTANT_ID=your-assistant-id
GOOGLE_TRANSLATE_API_KEY=your-google-translate-key
```

## Database Setup

**You MUST use MongoDB Atlas** (not local MongoDB) because Vercel can't run Docker containers:

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string
4. Add it as `MONGODB_URI` in Vercel environment variables

## Deployment Steps

1. **Set Environment Variables** in Vercel dashboard
2. **Connect your GitHub repo** to Vercel
3. **Deploy**: Vercel will automatically deploy when you push to main

## API Endpoints

After deployment, your APIs will be available at:

- **Forum API**: `https://your-app.vercel.app/api/forum/`
- **Scanner API**: `https://your-app.vercel.app/api/scanner/`
- **AI Assistant**: `https://your-app.vercel.app/api/assistants`

## Frontend Configuration

Update your frontend API calls to use the Vercel URLs:

```javascript
// In your React components
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app/api/forum' 
  : 'http://localhost:5001/api/v1';
```

## Testing

After deployment:

1. **Check build logs** in Vercel dashboard
2. **Test API endpoints** using browser or Postman
3. **Check function logs** for any runtime errors

## Common Issues & Solutions

### "Function not found" errors:
- Check that function paths in `vercel.json` match actual files
- Ensure functions export properly

### Database connection errors:
- Verify MongoDB Atlas connection string
- Check IP whitelist settings in Atlas

### CORS errors:
- Verify your domain is allowed in CORS settings
- Check that credentials are properly configured

## Next Steps

1. Deploy to Vercel
2. Set up environment variables  
3. Test all functionality
4. Monitor function logs for any issues

Your backend will now run as serverless functions on Vercel! 🚀
