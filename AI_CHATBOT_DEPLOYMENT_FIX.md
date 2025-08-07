# AI Chatbot Deployment Fix Guide

## Current Issues Fixed

### 1. ✅ CORS Configuration Updated
- Updated AI chatbot service CORS configuration to include Railway domains
- Added your main application domain to allowed origins
- Fixed CORS headers in all AI chatbot API routes

### 2. ✅ Temporarily Disabled AI Chatbot in Production
- Set `AI_CHATBOT_API_BASE_URL` to `null` in production to prevent CORS errors
- Frontend will now show a graceful message when AI chatbot is unavailable

## Required Actions on Railway

### 1. 🔧 Add Environment Variables to AI Chatbot Service

Go to your Railway dashboard → AI Chatbot service → Variables and add:

```bash
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_ASSISTANT_ID=your-openai-assistant-id-here
NODE_ENV=production
```

**Where to get these values:**
- `OPENAI_API_KEY`: From your OpenAI dashboard (https://platform.openai.com/api-keys)
- `OPENAI_ASSISTANT_ID`: From your OpenAI assistants page or from your code

### 2. 🚀 Redeploy AI Chatbot Service

After adding the environment variables:
1. Go to Railway dashboard → AI Chatbot service
2. Click "Deploy" or trigger a redeploy
3. Monitor the build logs to ensure it builds successfully

### 3. 🔗 Update API Configuration

Once your AI chatbot service is deployed successfully:

1. Get the actual Railway URL for your AI chatbot service (from Railway dashboard)
2. Update the `AI_CHATBOT_API_BASE_URL` in `src/config/api.js`:

```javascript
const AI_CHATBOT_API_BASE_URL = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3000'
  : 'https://your-actual-ai-chatbot-url.up.railway.app'; // Replace with actual URL
```

## Testing Checklist

After completing the above steps:

### ✅ Scanner Service (Working)
- Scanner service health check: `https://scanner-service.up.railway.app/health`
- OCR medication scanning should work

### ✅ Main Application (Working)
- User authentication working
- Forum functionality working
- Medication management working

### ⏳ AI Chatbot Service (Pending)
- [ ] Environment variables added
- [ ] Service builds successfully
- [ ] Health check responds: `https://your-ai-chatbot-url.up.railway.app/api/assistants`
- [ ] CORS allows your main application domain
- [ ] Frontend can access chatbot features

## Current Service Status

| Service | Status | URL |
|---------|---------|-----|
| Main App | ✅ Working | https://im-connected-production.up.railway.app |
| Scanner | ✅ Working | https://scanner-service.up.railway.app |
| AI Chatbot | ❌ Build Failing | Needs OPENAI_API_KEY |

## Next Steps

1. **Immediate**: Add the `OPENAI_API_KEY` environment variable to your AI chatbot service
2. **After successful deployment**: Update the API configuration with the correct URL
3. **Test**: Verify that the chatbot functionality works in your application

## Troubleshooting

### If AI Chatbot still fails to build:
- Check that the `OPENAI_API_KEY` is valid
- Ensure the key has the necessary permissions
- Check Railway build logs for specific error messages

### If CORS errors persist:
- Verify that your main application domain is in the `ALLOWED_ORIGINS` list
- Check that the AI chatbot service is actually running and accessible

### If frontend shows "service unavailable":
- This is expected when `AI_CHATBOT_API_BASE_URL` is `null`
- Update the URL once the service is deployed successfully
