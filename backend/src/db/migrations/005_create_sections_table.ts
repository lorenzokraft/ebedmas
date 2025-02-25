import { Database } from 'sqlite3';

export async function up(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS sections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        topic_id INTEGER NOT NULL,
        created_by INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function down(db: Database): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run('DROP TABLE IF EXISTS sections', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}
