# Ebedmas Deployment Guide

This guide explains how to deploy updates to our Ebedmas application using Git.

## Initial Setup (One-time only)

to set up Git on our shared server, follow these steps:

1. SSH into your shared server
2. Navigate to your web directory
3. Initialize a Git repository (if not already done):
   ```
   git init
   ```
4. Add your local repository as a remote:
   ```
   git remote add origin <git-repository-url>
   ```
5. Pull the initial code:
   ```
   git pull origin main
   ```
   (Use `master` instead of `main` if that's your default branch)
6. Install dependencies:
   ```
   npm install
   ```
7. Build the application (this compiles TypeScript to JavaScript):
   ```
   npm run build
   ```
   This step is crucial as TypeScript files cannot run directly on the server.
   The build process compiles all TypeScript (.ts) files to JavaScript (.js) files in the `dist` directory.
8. Run migrations:
   ```
   node dist/backend/src/db/runMigrations.js
   ```
9. Set up your application to run (using PM2 or your hosting provider's method):
   ```
   pm2 start dist/backend/src/index.js --name ebedmas
   ```

## Deploying Updates

### Option 1: Using the Deployment Script

1. SSH into your shared server
2. Navigate to your application directory
3. Run the deployment script:
   ```
   ./deploy.sh
   ```

The script will:
- Pull the latest changes from Git
- Install any new dependencies
- Build the application (compile TypeScript to JavaScript)
- Run database migrations using the compiled JavaScript
- Restart the application

### Option 2: Manual Deployment

If you prefer to run the commands manually:

1. SSH into your shared server
2. Navigate to your application directory
3. Pull the latest changes:
   ```
   git pull origin main
   ```
4. Install dependencies (if needed):
   ```
   npm install
   ```
5. Build the application (compile TypeScript to JavaScript):
   ```
   npm run build
   ```
6. Run database migrations using the compiled JavaScript:
   ```
   node dist/backend/src/db/runMigrations.js
   ```
7. Restart your application:
   ```
   pm2 restart ebedmas
   ```
   or if not already running:
   ```
   pm2 start dist/backend/src/index.js --name ebedmas
   ```

## Database Migrations

The migration system will track which migrations have been run in a `migrations` table. This ensures that migrations are only executed once, even if you run the migration command multiple times.

### Creating New Migrations

When you need to make changes to your database schema:

1. Create a new migration file in `backend/src/db/migrations` following the naming pattern `XXX_description.ts` (where XXX is a sequential number)
2. Implement the `up()` and `down()` functions in your migration
3. Commit and push your changes to Git
4. Deploy using the steps above

The migration files are written in TypeScript but will be compiled to JavaScript during the build process before being executed on the server.

## Troubleshooting

If you encounter issues during deployment:

1. Check the Git output for any merge conflicts
2. Verify that all dependencies are installed correctly
3. Check the build output for any TypeScript compilation errors
4. Examine the migration logs for any database errors
5. Verify that your application has restarted properly
6. Check that you're running the compiled JavaScript files (in the `dist` directory), not the TypeScript files

For database-specific issues, remember that our application needs to be compatible with MariaDB 10.6 on the hosting server.
