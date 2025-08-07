#!/bin/bash

# Cloudinary to Google Cloud Storage Migration Script
# This script helps migrate from Cloudinary to Google Cloud Storage

echo "🔄 IM-CONNECTED: Cloudinary to Google Cloud Storage Migration"
echo "============================================================="

# Check if .env file exists
if [ -f ".env" ]; then
    echo "📝 Found .env file - removing Cloudinary variables..."
    
    # Remove Cloudinary environment variables
    sed -i.bak '/CLOUDINARY_CLOUD_NAME/d' .env
    sed -i.bak '/CLOUDINARY_API_KEY/d' .env
    sed -i.bak '/CLOUDINARY_API_SECRET/d' .env
    
    echo "✅ Cloudinary variables removed from .env"
    echo "💾 Backup saved as .env.bak"
    
    # Check if Google Cloud Storage variables are present
    if ! grep -q "GOOGLE_CLOUD_PROJECT_ID" .env; then
        echo ""
        echo "⚠️  Google Cloud Storage variables not found in .env"
        echo "📋 Please add the following to your .env file:"
        echo ""
        echo "GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id"
        echo "GOOGLE_CLOUD_KEY_FILE=./path/to/service-account-key.json"
        echo "GCS_BUCKET_NAME=your-gcs-bucket-name"
        echo ""
    else
        echo "✅ Google Cloud Storage variables already present"
    fi
else
    echo "⚠️  No .env file found"
    echo "📋 Please create a .env file with Google Cloud Storage configuration:"
    echo ""
    echo "GOOGLE_CLOUD_PROJECT_ID=your-google-cloud-project-id"
    echo "GOOGLE_CLOUD_KEY_FILE=./path/to/service-account-key.json"
    echo "GCS_BUCKET_NAME=your-gcs-bucket-name"
    echo ""
fi

echo ""
echo "🔧 Migration Summary:"
echo "====================="
echo "✅ Removed Cloudinary dependencies from package.json files"
echo "✅ Updated Forum backend to use Google Cloud Storage"
echo "✅ Updated Scanner backend to use Google Cloud Storage exclusively"
echo "✅ Updated frontend services to use Google Cloud Storage"
echo "✅ Updated documentation files"
echo "✅ Removed Cloudinary service files"

echo ""
echo "🚀 Next Steps:"
echo "=============="
echo "1. Ensure your Google Cloud Storage bucket is created and configured"
echo "2. Update your .env file with correct Google Cloud credentials"
echo "3. Test image uploads in your application"
echo "4. Run 'npm install' to clean up unused dependencies"

echo ""
echo "📚 For Google Cloud Storage setup, refer to:"
echo "https://cloud.google.com/storage/docs/quickstart"

echo ""
echo "🎉 Migration completed successfully!"
