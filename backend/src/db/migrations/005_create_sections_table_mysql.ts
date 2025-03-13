import pool from '../../utils/db';

/**
 * Migration: Create Sections Table
 * 
 * This migration creates a table for sections within topics.
 * Compatible with both MySQL 8.3 and MariaDB 10.6
 */
export async function up(): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    // Check if table exists first to avoid errors
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sections'",
      [process.env.DB_NAME || 'ebedmas']
    );
    
    // Only create if it doesn't exist
    if (Array.isArray(tables) && tables.length === 0) {
      await connection.query(`
        CREATE TABLE sections (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          topic_id INT NOT NULL,
          created_by INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          
          INDEX idx_topic (topic_id),
          INDEX idx_created_by (created_by),
          
          FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
          FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('Created sections table');
    } else {
      console.log('sections table already exists, skipping creation');
    }
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  } finally {
    connection.release();
  }
}

export async function down(): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    // Check if table exists before dropping
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sections'",
      [process.env.DB_NAME || 'ebedmas']
    );
    
    if (Array.isArray(tables) && tables.length > 0) {
      await connection.query('DROP TABLE sections');
      console.log('Dropped sections table');
    } else {
      console.log('sections table does not exist, skipping drop');
    }
  } catch (error) {
    console.error('Error in migration rollback:', error);
    throw error;
  } finally {
    connection.release();
  }
}
