import { Pool } from 'mysql2/promise';

export async function up(pool: Pool): Promise<void> {
  console.log('Running migration: 008_create_quiz_progress_table');
  
  // Create quiz_progress table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quiz_progress (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      topic_id INT NOT NULL,
      question_id INT NOT NULL,
      is_correct TINYINT(1) NOT NULL DEFAULT 0,
      time_spent INT NOT NULL DEFAULT 0,
      score INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_user_id (user_id),
      INDEX idx_topic_id (topic_id),
      INDEX idx_question_id (question_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
  
  console.log('Migration 008_create_quiz_progress_table completed successfully');
}

export async function down(pool: Pool): Promise<void> {
  console.log('Reverting migration: 008_create_quiz_progress_table');
  
  // Drop the quiz_progress table
  await pool.query(`
    DROP TABLE IF EXISTS quiz_progress;
  `);
  
  console.log('Migration 008_create_quiz_progress_table reverted successfully');
}
