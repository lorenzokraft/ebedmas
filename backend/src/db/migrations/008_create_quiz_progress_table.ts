import pool from '../../utils/db';

/**
 * Migration: Create Quiz Progress Table
 * 
 * This migration creates a table to track user progress through quizzes.
 * Compatible with both MySQL 8.3 and MariaDB 10.6
 */
export async function up(): Promise<void> {
  const connection = await pool.getConnection();
  
  try {
    // Check if table exists first to avoid errors
    const [tables] = await connection.query(
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'quiz_progress'",
      [process.env.DB_NAME || 'ebedmas']
    );
    
    // Only create if it doesn't exist
    if (Array.isArray(tables) && tables.length === 0) {
      await connection.query(`
        CREATE TABLE quiz_progress (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          quiz_id INT NOT NULL,
          topic_id INT NOT NULL,
          score INT DEFAULT 0,
          total_questions INT NOT NULL,
          completed_questions INT DEFAULT 0,
          status ENUM('in_progress', 'completed', 'abandoned') DEFAULT 'in_progress',
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP NULL,
          time_spent_seconds INT DEFAULT 0,
          answers JSON,
          
          INDEX idx_user_quiz (user_id, quiz_id),
          INDEX idx_topic (topic_id),
          INDEX idx_status (status),
          
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
          FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      
      console.log('Created quiz_progress table');
    } else {
      console.log('quiz_progress table already exists, skipping creation');
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
      "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'quiz_progress'",
      [process.env.DB_NAME || 'ebedmas']
    );
    
    if (Array.isArray(tables) && tables.length > 0) {
      await connection.query('DROP TABLE quiz_progress');
      console.log('Dropped quiz_progress table');
    } else {
      console.log('quiz_progress table does not exist, skipping drop');
    }
  } catch (error) {
    console.error('Error in migration rollback:', error);
    throw error;
  } finally {
    connection.release();
  }
}