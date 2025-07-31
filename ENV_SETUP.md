# Environment Configuration for Docker

This project now uses a **consolidated `.env` file** in the root directory for all Docker services.

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Update with your credentials:**
   Edit `.env` and replace placeholder values with your actual:
   - MongoDB credentials (if using external database)
   - JWT secret keys
   - Email service credentials
   - Cloudinary API keys
   - OpenAI API keys
   - Google Translate API key

3. **Start Docker services:**
   ```bash
   docker-compose up --build
   ```

## Environment Variables Consolidated

The following variables have been consolidated from multiple `.env` files:

### From `/BACKEND/Forum/.env`:
- `MONGODB_URI` - Database connection
- `TOKEN_KEY`, `TOKEN_EXPIRY` - JWT authentication
- `AUTH_EMAIL`, `AUTH_PASS` - Email service
- `CLOUDINARY_*` - File storage
- `OPENAI_API_KEY` - AI services
- `GOOGLE_TRANSLATE_API_KEY` - Translation service

### From `/BACKEND/AI_chatbot/src/.env`:
- `OPENAI_API_KEY` - (deduplicated)
- `OPENAI_ASSISTANT_ID` - AI chatbot configuration

### Additional Docker Variables:
- `PORT` - Forum backend port (5001)
- `SCANNER_PORT` - Scanner backend port (3001)
- `AI_CHATBOT_PORT` - AI chatbot port (3000)
- `NODE_ENV` - Application environment

## Security Notes

⚠️ **Important:**
- Never commit the `.env` file with real credentials
- The `.env` file is already in `.gitignore`
- Use `.env.example` as a template for new deployments
- For production, consider using Docker secrets or external secret management

## Previous .env Files

The following files are now redundant and can be removed (backup first):
- `/BACKEND/Forum/.env`
- `/BACKEND/AI_chatbot/src/.env`

All services now read from the root `.env` file through Docker Compose environment variable mapping.
