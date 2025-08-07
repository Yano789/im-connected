#!/bin/sh

# Railway startup script for frontend
echo "Starting Nginx for frontend..."
echo "Checking if build files exist..."

if [ -d "/usr/share/nginx/html" ]; then
    echo "✓ HTML directory exists"
    ls -la /usr/share/nginx/html/
else
    echo "✗ HTML directory missing"
fi

if [ -f "/usr/share/nginx/html/index.html" ]; then
    echo "✓ Index.html exists"
else
    echo "✗ Index.html missing"
fi

echo "Testing nginx configuration..."
nginx -t

echo "Starting nginx..."
exec nginx -g "daemon off;"
