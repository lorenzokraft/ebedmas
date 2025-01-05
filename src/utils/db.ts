import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'ebedmas',
  password: 'ebedmas',
  database: 'ebedmas_learning'
});

export default pool; 