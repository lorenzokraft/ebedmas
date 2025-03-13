import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import pool from '../utils/db';

// ES modules equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a database adapter to handle different migration styles
class DatabaseAdapter {
  private connection: any;

  constructor(connection: any) {
    this.connection = connection;
  }

  // Adapter for SQLite-style migrations
  run(sql: string, params: any[] = []): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.connection.query(sql, params);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Adapter for Knex-style migrations
  schema = {
    createTable: (tableName: string, callback: Function) => {
      // This is just a stub since we're not actually using Knex
      console.log(`Knex-style migration for ${tableName} is not supported directly`);
      console.log('Please convert to direct SQL queries for MySQL compatibility');
      return Promise.resolve();
    }
  };

  // Adapter for TypeORM-style migrations
  hasTable(tableName: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      try {
        const [rows] = await this.connection.query(
          "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?",
          [process.env.DB_NAME || 'ebedmas', tableName]
        );
        resolve(Array.isArray(rows) && rows.length > 0);
      } catch (error) {
        reject(error);
      }
    });
  }

  query(sql: string, params: any[] = []): Promise<any> {
    return this.connection.query(sql, params);
  }
}

/**
 * Migration Runner
 * 
 * This script runs all migrations in the migrations directory in numerical order.
 * It keeps track of which migrations have been run in a migrations table.
 * Compatible with both MySQL 8.3 and MariaDB 10.6.
 */

// Create migrations table if it doesn't exist
async function ensureMigrationsTable() {
  const connection = await pool.getConnection();
  try {
    // Check if migrations table exists
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'migrations'",
      [process.env.DB_NAME || 'ebedmas']
    );
    
    if (Array.isArray(tables) && tables.length === 0) {
      console.log('Creating migrations table...');
      await connection.query(`
        CREATE TABLE migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
    }
  } catch (error) {
    console.error('Error creating migrations table:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Get list of executed migrations
async function getExecutedMigrations(): Promise<string[]> {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query('SELECT name FROM migrations ORDER BY id');
    return Array.isArray(rows) ? rows.map((row: any) => row.name) : [];
  } catch (error) {
    console.error('Error getting executed migrations:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Record a migration as executed
async function recordMigration(name: string): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.query('INSERT INTO migrations (name) VALUES (?)', [name]);
  } catch (error) {
    console.error(`Error recording migration ${name}:`, error);
    throw error;
  } finally {
    connection.release();
  }
}

// Main migration runner
async function runMigrations() {
  const connection = await pool.getConnection();
  try {
    // Create a database adapter for the connection
    const dbAdapter = new DatabaseAdapter(connection);
    
    // Ensure migrations table exists
    await ensureMigrationsTable();
    
    // Get list of executed migrations
    const executedMigrations = await getExecutedMigrations();
    console.log('Already executed migrations:', executedMigrations);
    
    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    
    // Filter for .ts or .js files and sort numerically
    // Prioritize MySQL migrations over SQLite migrations
    const migrationFiles = files
      .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
      // Filter out SQLite migrations if MySQL version exists
      .filter((file, _, allFiles) => {
        // If this is a MySQL migration, keep it
        if (file.includes('_mysql')) return true;
        
        // If a MySQL version exists for this migration, skip the SQLite version
        const baseName = file.split('.')[0];
        const mysqlVersion = `${baseName}_mysql.ts`;
        return !allFiles.includes(mysqlVersion);
      })
      .sort((a, b) => {
        const numA = parseInt(a.split('_')[0]);
        const numB = parseInt(b.split('_')[0]);
        return numA - numB;
      });
    
    console.log('Selected migration files:', migrationFiles);
    
    // Run each migration that hasn't been executed yet
    for (const file of migrationFiles) {
      if (!executedMigrations.includes(file)) {
        console.log(`Running migration: ${file}`);
        
        // Import the migration file (using file URL for ES modules)
        const migrationPath = path.join(migrationsDir, file);
        const fileUrl = `file://${migrationPath}`;
        const migration = await import(fileUrl);
        
        // Run the up function with our adapter
        if (typeof migration.up === 'function') {
          // For TypeORM-style migrations that expect a QueryRunner
          if (migration.default && typeof migration.default === 'function') {
            const MigrationClass = migration.default;
            const instance = new MigrationClass();
            if (typeof instance.up === 'function') {
              await instance.up(dbAdapter);
            }
          } else {
            // For SQLite and Knex-style migrations
            await migration.up(dbAdapter);
          }
          
          await recordMigration(file);
          console.log(`Migration ${file} completed successfully`);
        } else {
          console.warn(`Migration ${file} has no 'up' function, skipping`);
        }
      } else {
        console.log(`Migration ${file} already executed, skipping`);
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    // Release the connection
    if (connection) connection.release();
    
    // Close the pool
    await pool.end();
  }
}

// In ES modules, we can just call the function directly
runMigrations()
  .then(() => console.log('Migration process completed'))
  .catch(err => {
    console.error('Migration process failed:', err);
    process.exit(1);
  });

export default runMigrations;
