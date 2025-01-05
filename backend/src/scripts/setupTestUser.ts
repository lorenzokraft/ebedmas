import bcrypt from 'bcrypt';
import pool from '../utils/db';

async function setupTestUser() {
  try {
    const email = 'user@example.com';
    const username = 'testuser';
    const password = 'user123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if users table exists
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_NAME = 'users'
    `);

    // Create table if it doesn't exist
    if (Array.isArray(tables) && tables.length === 0) {
      await pool.query(`
        CREATE TABLE users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          email VARCHAR(225) NOT NULL,
          username VARCHAR(225) NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Check if test user exists
    const [existingUser] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length === 0) {
      // Create test user if it doesn't exist
      await pool.query(
        'INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, ?)',
        [email, username, hashedPassword, 'user']
      );
      console.log('Test user created successfully');
    } else {
      // Update existing user password
      await pool.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );
      console.log('Test user password updated successfully');
    }

    console.log('Test user setup completed');
    console.log('Email:', email);
    console.log('Username:', username);
    console.log('Password:', password);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test user:', error);
    process.exit(1);
  }
}

setupTestUser(); 