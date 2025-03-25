#!/bin/bash

# Deployment script for Ebedmas Learning Platform with TypeScript errors ignored
# This script updates the application and builds it while ignoring TypeScript errors

set -e  # Exit immediately if a command exits with a non-zero status

echo "Starting deployment process for Ebedmas (ignoring TypeScript errors)..."

# 1. Install dependencies
echo "Installing dependencies..."
npm install

# 2. Build the frontend with TypeScript errors ignored
echo "Building the frontend (ignoring TypeScript errors)..."
cd frontend
CI=false npm run build
cd ..

# 3. Build the backend (if needed)
echo "Building the backend..."
cd backend
npm run build --if-present
cd ..

# 4. Run database migrations
echo "Running database migrations..."
node backend/src/migrations/runMigrations.js

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
        pm2 start backend/src/index.js --name ebedmas
    fi
else
    echo "PM2 not found. Starting application with nohup..."
    # Kill any existing node processes (optional)
    pkill -f "node backend/src/index.js" || true
    # Start with nohup to keep it running after SSH session ends
    nohup node backend/src/index.js > app.log 2>&1 &
    echo "Application started with PID: $!"
fi

echo "Deployment completed successfully!"
echo "The application is now running with TypeScript errors ignored."
