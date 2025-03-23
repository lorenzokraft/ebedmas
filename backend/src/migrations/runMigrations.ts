import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ebedmas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

// Get executed migrations
async function getExecutedMigrations() {
  const [rows] = await pool.query('SELECT name FROM migrations ORDER BY id ASC');
  return (rows as any[]).map(row => row.name);
}

// Run migrations
async function runMigrations() {
  try {
    console.log('Starting migrations...');
    
    // Create migrations table if it doesn't exist
    await createMigrationsTable();
    
    // Get executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log('Executed migrations:', executedMigrations);
    
    // Get all migration files
    const migrationsDir = path.join(__dirname);
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.match(/^\d+_.*\.ts$/) && file !== 'runMigrations.ts')
      .sort();
    
    console.log('Available migration files:', migrationFiles);
    
    // Run migrations that haven't been executed yet
    for (const file of migrationFiles) {
      const migrationName = file.replace('.ts', '');
      
      if (!executedMigrations.includes(migrationName)) {
        console.log(`Running migration: ${migrationName}`);
        
        // Import and run the migration
        const migrationPath = path.join(migrationsDir, file);
        const migration = await import(migrationPath);
        await migration.up(pool);
        
        // Record the migration
        await pool.query('INSERT INTO migrations (name) VALUES (?)', [migrationName]);
        
        console.log(`Migration ${migrationName} completed successfully`);
      } else {
        console.log(`Migration ${migrationName} already executed, skipping...`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the migrations
runMigrations();
