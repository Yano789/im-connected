# Railway Deployment Setup

## Environment Variables Required

Add these environment variables in your Railway project dashboard:

### Database Configuration
```
NODE_ENV=production
PORT=5001
MONGODB_URI=your_mongodb_atlas_connection_string
```

**Note**: Railway automatically provides a PORT environment variable, but you can set it to 5001 for consistency.

### Authentication & Security
```
TOKEN_KEY=your-jwt-secret-key-at-least-32-characters
TOKEN_EXPIRY=24h
ENCRYPTION_SECRET=your-encryption-secret-at-least-16-characters
```

### Email Service (for user verification)
```
AUTH_EMAIL=your-email@gmail.com
AUTH_PASS=your-app-password
```

### File Upload (Cloudinary)
```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Translation Service (Google Translate)
```
GOOGLE_APPLICATION_CREDENTIALS=path-to-service-account-json
GOOGLE_PROJECT_ID=your-google-project-id
```

## Steps to Deploy

1. **Create Railway Project**: Connect your GitHub repository to Railway
2. **Add Environment Variables**: Go to your Railway project dashboard and add all the environment variables above
3. **Deploy**: Railway will automatically build and deploy using the Dockerfile

## Troubleshooting

### If you see "A bucket name is needed to use Cloud Storage"
- The app is trying to use Google Cloud Storage but it's disabled
- Make sure you have Cloudinary credentials set up instead

### If you see CORS errors
- Make sure your Railway app URL is added to the CORS origins
- The app should automatically detect Railway domains

### If static files don't load
- Make sure the Dockerfile is building the frontend correctly
- Check the Railway logs for any build errors

## Current Configuration

The app is configured to:
- Use Cloudinary for file uploads (images/videos)
- Use MongoDB Atlas for database
- Use relative paths for API calls in production
- Serve the frontend from the same domain as the backend
