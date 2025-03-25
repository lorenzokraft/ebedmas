#!/bin/bash

# Script to check if the Ebedmas application is running and restart if needed
# For use with cron on Namecheap shared hosting

# Path to your application
APP_DIR="/home/ebedvmqz/public_html"
APP_SCRIPT="backend/src/index.js"
LOG_FILE="$APP_DIR/app_monitor.log"

# Function to log messages
log_message() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Navigate to application directory
cd "$APP_DIR" || {
  log_message "ERROR: Could not navigate to $APP_DIR"
  exit 1
}

# Check if the application is running
if pgrep -f "node $APP_SCRIPT" > /dev/null; then
  log_message "Application is running normally."
else
  log_message "Application is not running. Restarting..."
  
  # Start the application
  nohup node "$APP_SCRIPT" > app.log 2>&1 &
  
  # Check if restart was successful
  sleep 5
  if pgrep -f "node $APP_SCRIPT" > /dev/null; then
    log_message "Application restarted successfully with PID: $(pgrep -f "node $APP_SCRIPT")"
  else
    log_message "ERROR: Failed to restart application"
  fi
fi
