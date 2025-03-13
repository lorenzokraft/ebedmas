#!/bin/bash

# Deployment script for Ebedmas Learning Platform
# This script updates the application from Git and runs migrations

set -e  # Exit immediately if a command exits with a non-zero status

echo "Starting deployment process for Ebedmas..."

# 1. Pull latest changes from Git
echo "Pulling latest changes from Git..."
git pull

# 2. Install dependencies (if needed)
echo "Installing dependencies..."
npm install

# 3. Build the application (compiles TypeScript to JavaScript)
echo "Building the application (compiling TypeScript to JavaScript)..."
npm run build

echo "TypeScript compilation completed. JavaScript files are in the dist directory."

# 4. Run database migrations using the compiled JavaScript
echo "Running database migrations..."
# First check if the compiled migration runner exists
if [ -f "dist/backend/src/db/runMigrations.js" ]; then
    # Run migrations using the compiled JavaScript
    node dist/backend/src/db/runMigrations.js
else
    # Fallback to using tsx for development
    echo "Compiled migration runner not found, using tsx instead..."
    npm run migrate
fi

# 5. Restart the application (adjust based on your hosting setup)
echo "Restarting the application..."
# If you're using PM2
if command -v pm2 &> /dev/null; then
    # Check if the app is already running in PM2
    if pm2 list | grep -q "ebedmas"; then
        echo "Restarting existing PM2 process..."
        pm2 restart ebedmas
    else
        echo "Starting new PM2 process..."
        pm2 start dist/backend/src/index.js --name ebedmas
    fi
else
    echo "PM2 not found. Please restart your application manually."
    echo "You can start the compiled app with: node dist/backend/src/index.js"
    # Alternative restart methods can be added here based on your hosting
fi

echo "Deployment completed successfully!"
echo "The application is now running the compiled JavaScript version of your TypeScript code."
