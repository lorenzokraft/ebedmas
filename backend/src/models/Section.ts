import { db } from '../db';

export interface Section {
  id: number;
  name: string;
  topic_id: number;
  created_by: number;
  created_at: string;
}

export const SectionModel = {
  async create(data: Omit<Section, 'id' | 'created_at'>) {
    const result = await db.query(
      `INSERT INTO sections (name, topic_id, created_by, created_at)
       VALUES (?, ?, ?, datetime('now'))`,
      [data.name, data.topic_id, data.created_by]
    );
    return result.lastID;
  },

  async getAll() {
    const sections = await db.all<Section & {
      topic_name: string;
      subject_name: string;
      grade_name: string;
      created_by_name: string;
    }>(`
      SELECT 
        s.*,
        t.name as topic_name,
        sub.name as subject_name,
        g.name as grade_name,
        u.username as created_by_name
      FROM sections s
      JOIN topics t ON s.topic_id = t.id
      JOIN subjects sub ON t.subject_id = sub.id
      JOIN grades g ON sub.grade_id = g.id
      JOIN users u ON s.created_by = u.id
      ORDER BY s.created_at DESC
    `);
    return sections;
  },

  async getById(id: number) {
    return await db.get<Section>(
      'SELECT * FROM sections WHERE id = ?',
      [id]
    );
  },

  async update(id: number, data: Partial<Omit<Section, 'id' | 'created_at'>>) {
    const updates = [];
    const values = [];
    
    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.topic_id !== undefined) {
      updates.push('topic_id = ?');
      values.push(data.topic_id);
    }
    
    if (updates.length === 0) return false;
    
    values.push(id);
    await db.run(
      `UPDATE sections SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return true;
  },

  async delete(id: number) {
    await db.run('DELETE FROM sections WHERE id = ?', [id]);
  },

  async getByTopicId(topicId: number) {
    return await db.all<Section>(
      'SELECT * FROM sections WHERE topic_id = ? ORDER BY created_at DESC',
      [topicId]
    );
  }
};
