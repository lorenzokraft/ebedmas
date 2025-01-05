import bcrypt from 'bcrypt';
import pool from '../utils/db';

async function setupAdmin() {
  try {
    const email = 'admin@example.com';
    const password = 'admin123'; // Change this in production
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin table exists
    const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_NAME = 'admin_users'
    `);

    // Create table if it doesn't exist
    if (Array.isArray(tables) && tables.length === 0) {
      await pool.query(`
        CREATE TABLE admin_users (
          id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'admin',
          status VARCHAR(50) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Check if admin user exists
    const [existingAdmin] = await pool.query(
      'SELECT * FROM admin_users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingAdmin) && existingAdmin.length === 0) {
      // Create admin user if it doesn't exist
      await pool.query(
        'INSERT INTO admin_users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', email, hashedPassword, 'admin']
      );
      console.log('Admin user created successfully');
    } else {
      // Update existing admin password
      await pool.query(
        'UPDATE admin_users SET password = ? WHERE email = ?',
        [hashedPassword, email]
      );
      console.log('Admin password updated successfully');
    }

    console.log('Admin setup completed');
    console.log('Email:', email);
    console.log('Password:', password);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin(); 