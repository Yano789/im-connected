#!/bin/bash

echo "=== Environment Variables Needed for Vercel ==="
echo ""
echo "Go to your Vercel dashboard > Settings > Environment Variables"
echo "Add the following variables:"
echo ""

# Extract variables from .env.local
echo "From your .env.local file:"
grep -E "^[A-Z_]+=" .env.local 2>/dev/null | while read line; do
    var_name=$(echo "$line" | cut -d'=' -f1)
    echo "  $var_name"
done

echo ""
echo "Required variables:"
echo "  MONGODB_URI"
echo "  TOKEN_KEY"
echo "  NODE_ENV=production"
echo "  AUTH_EMAIL"
echo "  AUTH_PASS"
echo "  CLOUDINARY_CLOUD_NAME"
echo "  CLOUDINARY_API_KEY"
echo "  CLOUDINARY_API_SECRET"
echo "  OPENAI_API_KEY"
echo "  OPENAI_ASSISTANT_ID"
echo ""
echo "Make sure all values are copied exactly from your .env.local file"
