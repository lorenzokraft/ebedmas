#!/bin/bash

# Deployment script for Ebedmas Learning Platform with TypeScript errors ignored
# This script updates the application and builds it while ignoring TypeScript errors
# Configured for ebedvmqz@ebedmaslearning.com on Namecheap hosting with MariaDB 10.6.20

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
# Check if the migrations directory exists in the right location
if [ -d "backend/src/migrations" ]; then
    node backend/src/migrations/runMigrations.js
else
    echo "Migration directory not found, checking alternative locations..."
    # Try alternative locations
    if [ -d "backend/dist/migrations" ]; then
        node backend/dist/migrations/runMigrations.js
    elif [ -d "dist/backend/src/migrations" ]; then
        node dist/backend/src/migrations/runMigrations.js
    else
        echo "WARNING: Could not find migrations directory. Migrations were not run."
    fi
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
        pm2 start backend/src/index.js --name ebedmas
    fi
else
    echo "PM2 not found. Starting application with nohup..."
    # Kill any existing node processes (optional)
    pkill -f "node backend/src/index.js" || true
    # Start with nohup to keep it running after SSH session ends
    nohup node backend/src/index.js > app.log 2>&1 &
    echo "Application started with PID: $!"
    echo "NOTE: On Namecheap shared hosting, you may need to set up a cron job to keep the application running."
    echo "Example cron job (runs every 5 minutes):"
    echo "*/5 * * * * cd /home/ebedvmqz/public_html && ./check_app_running.sh > /dev/null 2>&1"
fi

echo "Deployment completed successfully!"
echo "The application is now running with TypeScript errors ignored."
echo "Database: MariaDB 10.6.20 (compatible with MySQL 8.3.0 locally)"
