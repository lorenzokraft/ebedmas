import bcrypt from 'bcrypt';
import pool from '../utils/db';

async function resetAdminPassword() {
  try {
    const email = 'superuser@ebedmas.com';
    const plainPassword = 'admin123';
    
    // Generate fresh hash
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // Update the password
    await pool.execute(
      'UPDATE admin_users SET password = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    console.log('Password reset successfully for:', email);
    console.log('New password is:', plainPassword);
    process.exit(0);
  } catch (error) {
    console.error('Error resetting password:', error);
    process.exit(1);
  }
}

resetAdminPassword(); 