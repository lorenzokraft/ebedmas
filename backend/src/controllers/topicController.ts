import { Request, Response } from 'express';
import pool from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

interface Topic extends RowDataPacket {
  id: number;
  name: string;
  subject_id: number;
  admin_id: number;
}

export const getTopics = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const adminId = req.user.id;
    const [topics] = await pool.query<Topic[]>('SELECT * FROM topics WHERE admin_id = ?', [adminId]);
    return res.json(topics);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createTopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, subject_id, description } = req.body;
    const adminId = req.user?.id;

    // First create the topic
    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO topics (name, subject_id, description, created_by) VALUES (?, ?, ?, ?)',
      [name, subject_id, description, adminId]
    );

    const topicId = result.insertId;

    // Immediately assign the grade
    await assignTopicGrades(req, res);

    res.status(201).json({
      message: 'Topic created successfully',
      topicId: topicId
    });

  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ message: 'Failed to create topic' });
  }
};

export const updateTopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, subject_id } = req.body;
    const adminId = req.user?.id;

    const [result] = await pool.execute<ResultSetHeader>(
      'UPDATE topics SET name = ?, subject_id = ? WHERE id = ? AND admin_id = ?',
      [name, subject_id, id, adminId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Topic not found or unauthorized' });
    }

    res.json({ message: 'Topic updated successfully' });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ message: 'Failed to update topic' });
  }
};

export const deleteTopic = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;

    // Check if there are any questions using this topic
    const [questions] = await pool.query<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM questions WHERE topic_id = ?',
      [id]
    );

    if (questions[0].count > 0) {
      return res.status(400).json({
        message: 'Cannot delete topic that has questions associated with it'
      });
    }

    const [result] = await pool.execute<ResultSetHeader>(
      'DELETE FROM topics WHERE id = ? AND admin_id = ?',
      [id, adminId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Topic not found or unauthorized' });
    }

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ message: 'Failed to delete topic' });
  }
};

export const getTopicCountBySubject = async (req: Request, res: Response) => {
  try {
    const { subject } = req.params;
    console.log('Fetching count for subject:', subject);

    // Updated query to match your database schema
    const [result] = await pool.query<RowDataPacket[]>(
      `SELECT g.name as year, COUNT(t.id) as count 
       FROM grades g 
       LEFT JOIN topics t ON t.grade = g.id 
       LEFT JOIN subjects s ON t.subject = s.id 
       WHERE s.name = ? 
       GROUP BY g.id, g.name 
       ORDER BY g.name`,
      [subject]
    );

    console.log('Count result by grade:', result);

    // Transform the result into a more usable format
    const countsByGrade = result.reduce((acc: { [key: string]: number }, row: any) => {
      // Extract the year number from grade name (e.g., "Year 1" -> 1)
      const yearNum = parseInt(row.year.replace(/\D/g, ''));
      acc[yearNum] = row.count;
      return acc;
    }, {});

    res.json({ counts: countsByGrade });
  } catch (error) {
    console.error('Error getting topic count:', error);
    res.status(500).json({ message: 'Failed to get topic count' });
  }
};

export const getTopicsBySubjectAndYear = async (req: Request, res: Response) => {
  try {
    const { subject, year } = req.params;
    console.log('\n=== Starting Topic Fetch ===');
    console.log('Request params:', { subject, year });

    // Debug: Check all subjects in the database
    const [allSubjects] = await pool.query('SELECT * FROM subjects');
    console.log('\nAll subjects in database:', allSubjects);

    // Debug: Check all grades in the database
    const [allGrades] = await pool.query('SELECT * FROM grades');
    console.log('\nAll grades in database:', allGrades);

    // Debug: Check all topics in the database
    const [allTopics] = await pool.query('SELECT * FROM topics');
    console.log('\nAll topics in database:', allTopics);

    // First, get the subject ID
    const subjectQuery = 'SELECT id, name FROM subjects WHERE LOWER(name) LIKE LOWER(?)';
    console.log('\nSubject Query:', subjectQuery);
    console.log('Subject Params:', [`%${subject}%`]);

    const [subjects] = await pool.query(subjectQuery, [`%${subject}%`]);
    console.log('Found subjects:', subjects);

    if (!subjects.length) {
      console.log('No subject found for:', subject);
      return res.json({
        categories: [{
          name: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Topics`,
          topics: []
        }],
        stats: { totalTopics: 0, totalQuestions: 0 }
      });
    }

    // Get the grade ID
    const gradeQuery = 'SELECT id, name FROM grades WHERE LOWER(name) = LOWER(?)';
    console.log('\nGrade Query:', gradeQuery);
    console.log('Grade Params:', [`Year ${year}`]);

    const [grades] = await pool.query(gradeQuery, [`Year ${year}`]);
    console.log('Found grades:', grades);

    if (!grades.length) {
      console.log('No grade found for year:', year);
      return res.json({
        categories: [{
          name: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Topics`,
          topics: []
        }],
        stats: { totalTopics: 0, totalQuestions: 0 }
      });
    }

    const query = `
      SELECT 
        t.id,
        t.name,
        t.description,
        COUNT(DISTINCT q.id) as question_count,
        s.name as subject_name,
        g.name as grade_name
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      JOIN grades g ON t.grade_id = g.id
      LEFT JOIN questions q ON q.topic_id = t.id
      WHERE s.id = ?
      AND g.id = ?
      GROUP BY t.id, t.name, t.description, s.name, g.name
      ORDER BY t.name
    `;

    const params = [subjects[0].id, grades[0].id];
    console.log('\nFinal Topics Query:', query);
    console.log('Final Topics Params:', params);

    const [topics] = await pool.query(query, params);
    console.log('\nRaw topics results:', topics);

    // Transform the data
    const transformedTopics = topics.map((topic: any) => ({
      id: topic.id,
      name: topic.name,
      description: topic.description || 'Practice questions and improve your skills',
      questionCount: parseInt(topic.question_count) || 0
    }));

    console.log('\nTransformed topics:', transformedTopics);

    const response = {
      categories: [{
        name: `${subject.charAt(0).toUpperCase() + subject.slice(1)} Topics`,
        topics: transformedTopics
      }],
      stats: {
        totalTopics: transformedTopics.length,
        totalQuestions: transformedTopics.reduce((sum, topic) => sum + topic.questionCount, 0)
      }
    };

    console.log('\nFinal response:', response);
    res.json(response);

  } catch (error) {
    console.error('\n=== Error in getTopicsBySubjectAndYear ===');
    console.error('Error details:', error);
    if ('sqlMessage' in error) {
      console.error('SQL Error:', error.sqlMessage);
    }
    res.status(500).json({ 
      message: 'Failed to get topics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTopicsByYear = async (req: Request, res: Response) => {
  try {
    const { yearId } = req.params;
    
    const [topics] = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.description,
        COUNT(q.id) as questionCount
      FROM topics t
      LEFT JOIN questions q ON q.topic_id = t.id
      WHERE t.grade_id = ?
      GROUP BY t.id, t.name, t.description
      ORDER BY t.name
    `, [yearId]);

    res.json(topics);
  } catch (error) {
    console.error('Error fetching topics by year:', error);
    res.status(500).json({ message: 'Failed to fetch topics' });
  }
};

export const assignTopicGrades = async (req: Request, res: Response) => {
  try {
    // Get all topics that need grade assignment
    const [topics] = await pool.query(`
      SELECT 
        t.id,
        t.name as topic_name,
        s.name as subject_name
      FROM topics t
      JOIN subjects s ON t.subject_id = s.id
      WHERE t.grade_id IS NULL
    `);

    // Define topic patterns and their corresponding years for each subject
    const topicYearMappings = {
      'english': {
        'year1': ['Letter identification', 'Nouns'],
        'year3': ['Linking Words', 'Vocabulary', 'Syllables'],
        'year5': ['Advanced Grammar', 'Creative Writing']
      },
      'mathematics': {
        'year1': ['Numbers to 100', 'Addition', 'Basic measurements'],
        'year3': ['Multiplication', 'Division', 'Fractions'],
        'year5': ['Decimals', 'Geometry', 'Statistics']
      },
      'science': {
        'year1': ['Law of Motion', 'Sunlight', 'Living Things'],
        'year3': ['Plants', 'Light', 'Forces'],
        'year5': ['Earth and Space', 'Life Cycles', 'Materials']
      }
    };

    // Process each topic
    for (const topic of topics) {
      const subjectKey = topic.subject_name.toLowerCase();
      let yearToAssign = null;

      // Find which year this topic belongs to
      for (const [year, patterns] of Object.entries(topicYearMappings[subjectKey] || {})) {
        const yearNum = year.replace('year', '');
        if (patterns.some(pattern => 
          topic.topic_name.toLowerCase().includes(pattern.toLowerCase())
        )) {
          yearToAssign = yearNum;
          break;
        }
      }

      if (yearToAssign) {
        // Update the topic with the correct grade_id
        await pool.query(`
          UPDATE topics 
          SET grade_id = (SELECT id FROM grades WHERE name = ?)
          WHERE id = ?
        `, [`Year ${yearToAssign}`, topic.id]);

        console.log(`Assigned topic "${topic.topic_name}" to Year ${yearToAssign}`);
      } else {
        console.log(`Could not determine year for topic: "${topic.topic_name}"`);
      }
    }

    res.json({ 
      message: 'Topics assigned successfully',
      topicsProcessed: topics.length
    });

  } catch (error) {
    console.error('Error assigning topics:', error);
    res.status(500).json({ 
      message: 'Failed to assign topics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getTopicCountsBySubject = async (req: Request, res: Response) => {
  try {
    const { subject } = req.params;
    
    const [results] = await pool.query(`
      SELECT 
        g.name as grade_name,
        COUNT(DISTINCT t.id) as topic_count
      FROM grades g
      LEFT JOIN topics t ON t.grade_id = g.id
      LEFT JOIN subjects s ON t.subject_id = s.id
      WHERE LOWER(s.name) LIKE LOWER(?)
      GROUP BY g.id, g.name
    `, [`%${subject}%`]);

    // Transform results into a year -> count map
    const counts = results.reduce((acc: { [key: string]: number }, row: any) => {
      const year = parseInt(row.grade_name.replace(/\D/g, ''));
      acc[year] = row.topic_count;
      return acc;
    }, {});

    res.json(counts);
  } catch (error) {
    console.error('Error getting topic counts:', error);
    res.status(500).json({ message: 'Failed to get topic counts' });
  }
};

// Get topic details including stats
export const getTopicDetails = async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;

    // Get topic details
    const [topics] = await pool.query<RowDataPacket[]>(
      `SELECT t.*, COUNT(DISTINCT s.id) as skills, COUNT(DISTINCT q.id) as games
       FROM topics t
       LEFT JOIN sections s ON t.id = s.topic_id
       LEFT JOIN questions q ON s.id = q.section_id
       WHERE t.id = ?
       GROUP BY t.id`,
      [topicId]
    );

    if (topics.length === 0) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const topic = topics[0];

    // Format response
    const response = {
      id: topic.id,
      name: topic.name,
      description: topic.description || 'No description available',
      stats: {
        skills: topic.skills || 0,
        games: topic.games || 0
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error fetching topic details:', error);
    res.status(500).json({ message: 'Failed to fetch topic details' });
  }
};
