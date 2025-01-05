import bcrypt from 'bcrypt';

async function hashPassword() {
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Use this hashed password in your SQL script:');
  console.log(hashedPassword);
}

hashPassword(); 