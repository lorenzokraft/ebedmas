#!/bin/bash

# Startup script for Ebedmas Learning Platform
# For use on Namecheap hosting with Node.js v22.12.1 and MariaDB 10.6.20

# Application directory
APP_DIR="/home/ebedvmqz/public_html"

# Log file
LOG_FILE="$APP_DIR/app.log"

# Path to Node.js executable
NODE_PATH=$(which node)

echo "Starting Ebedmas application at $(date)" >> "$LOG_FILE"
echo "Using Node.js version: $($NODE_PATH -v)" >> "$LOG_FILE"

# Change to application directory
cd "$APP_DIR" || {
  echo "ERROR: Could not change to directory $APP_DIR" >> "$LOG_FILE"
  exit 1
}

# Check if the application is already running
if pgrep -f "node.*backend/dist/index.js" > /dev/null; then
  echo "Application is already running. Stopping it first..." >> "$LOG_FILE"
  pkill -f "node.*backend/dist/index.js"
  sleep 2
fi

# Start the application in the background
echo "Starting Node.js application..." >> "$LOG_FILE"
nohup $NODE_PATH backend/dist/index.js >> "$LOG_FILE" 2>&1 &

# Save the process ID
echo $! > "$APP_DIR/app.pid"
echo "Application started with PID: $!" >> "$LOG_FILE"

# Verify the application started successfully
sleep 5
if pgrep -f "node.*backend/dist/index.js" > /dev/null; then
  echo "Application started successfully!" >> "$LOG_FILE"
else
  echo "ERROR: Application failed to start. Check logs for details." >> "$LOG_FILE"
fi
