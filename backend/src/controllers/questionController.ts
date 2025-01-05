import { Request, Response } from 'express';
import pool from '../utils/db';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
    role?: string;
  }
}

interface QuestionOption {
  text: string;
  isCorrect: boolean;
}

interface Question extends RowDataPacket {
  id: number;
  title: string;
  content: string;
  topic_id: number;
  admin_id: number;
}

export const getQuestions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const adminId = req.user.id;
    const [questions] = await pool.query<Question[]>('SELECT * FROM questions WHERE admin_id = ?', [adminId]);
    return res.json(questions);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const createQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, content, topic_id, options, correct_answer } = req.body;
    const adminId = req.user.id;

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO questions (title, content, topic_id, created_by, admin_id) VALUES (?, ?, ?, ?, ?)',
      [title, content, topic_id, adminId, adminId]
    );

    // Add options if provided
    if (options && Array.isArray(options)) {
      for (const option of options) {
        await pool.execute<ResultSetHeader>(
          'INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
          [result.insertId, option.text, option.isCorrect]
        );
      }
    }

    res.status(201).json({ message: 'Question created successfully' });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Failed to create question' });
  }
};

export const updateQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, topic_id, options } = req.body;
    const adminId = req.user.id;

    await pool.execute<ResultSetHeader>(
      'UPDATE questions SET title = ?, content = ?, topic_id = ? WHERE id = ? AND admin_id = ?',
      [title, content, topic_id, id, adminId]
    );

    // Update options if provided
    if (options && Array.isArray(options)) {
      // First delete existing options
      await pool.execute<ResultSetHeader>('DELETE FROM question_options WHERE question_id = ?', [id]);
      
      // Then add new options
      for (const option of options) {
        await pool.execute<ResultSetHeader>(
          'INSERT INTO question_options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
          [id, option.text, option.isCorrect]
        );
      }
    }

    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Failed to update question' });
  }
};

export const deleteQuestion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    // First delete related options
    await pool.execute<ResultSetHeader>('DELETE FROM question_options WHERE question_id = ?', [id]);
    
    // Then delete the question
    await pool.execute<ResultSetHeader>(
      'DELETE FROM questions WHERE id = ? AND admin_id = ?', 
      [id, adminId]
    );
    
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete question' });
  }
};

export const getQuestionsByTopic = async (req: Request, res: Response) => {
  try {
    const topicId = req.params.topicId;
    console.log('Fetching questions for topic:', topicId);

    // Get all questions for the topic
    const [questions] = await pool.query(
      `SELECT q.id,
              q.question_text as content,
              q.question_type as type,
              q.options,
              q.correct_answer as correctAnswer,
              q.explanation,
              q.images,
              q.explanation_image
       FROM questions q
       WHERE q.topic_id = ?`,
      [topicId]
    );

    // Process each question
    const processedQuestions = questions.map(q => {
      console.log('Raw question from DB:', q);
      
      // Process options
      let options = [];
      try {
        if (q.options) {
          const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
          if (q.type === 'click') {
            options = Array.isArray(parsedOptions) ? parsedOptions.map((opt, index) => ({
              id: index + 1,
              text: String(opt).trim(),
              isCorrect: String(opt).trim() === String(q.correctAnswer).trim()
            })) : [];
          } else if (q.type === 'drag') {
            options = Array.isArray(parsedOptions) ? parsedOptions.map((opt, index) => ({
              id: index + 1,
              text: String(opt).trim(),
              isCorrect: true
            })) : [];
          }
        }
      } catch (e) {
        console.error('Error processing options for question:', q.id, e);
      }

      // Process images
      let images = [];
      try {
        images = q.images ? (typeof q.images === 'string' ? JSON.parse(q.images) : q.images) : [];
      } catch (e) {
        console.error('Error parsing images:', e);
        images = [];
      }

      const processedQuestion = {
        id: q.id,
        content: q.content,
        type: q.type,
        options: options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        images: images,
        explanation_image: q.explanation_image
      };

      console.log('Processed question:', processedQuestion);
      return processedQuestion;
    });

    console.log('Sending processed questions:', processedQuestions);
    res.json(processedQuestions);

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
};

export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { questionId, answer } = req.body;
    console.log('Received answer submission:', { questionId, answer });
    
    // Get the question from database
    const [questionRows] = await pool.query(
      `SELECT q.id,
              q.question_text as content,
              q.question_type as type,
              q.options,
              q.correct_answer as correctAnswer,
              q.explanation,
              q.images,
              q.explanation_image
       FROM questions q
       WHERE q.id = ?`,
      [questionId]
    );

    if (!questionRows[0]) {
      console.log('Question not found:', questionId);
      return res.status(404).json({ message: 'Question not found' });
    }

    const questionData = questionRows[0];
    console.log('Question data from DB:', questionData);
    
    let isCorrect = false;

    // Check if the answer is correct based on question type
    if (questionData.type === 'click') {
      console.log('Comparing click answers:', {
        submitted: answer.toLowerCase().trim(),
        correct: questionData.correctAnswer.toLowerCase().trim()
      });
      isCorrect = answer.toLowerCase().trim() === questionData.correctAnswer.toLowerCase().trim();
    } else if (questionData.type === 'drag') {
      // Sort both arrays for consistent comparison
      const submittedArray = answer.toLowerCase().split(',').map(s => s.trim()).sort();
      const correctArray = questionData.correctAnswer.toLowerCase().split(',').map(s => s.trim()).sort();
      
      console.log('Comparing drag answers:', {
        submitted: submittedArray,
        correct: correctArray
      });
      isCorrect = JSON.stringify(submittedArray) === JSON.stringify(correctArray);
    } else if (questionData.type === 'text') {
      console.log('Comparing text answers:', {
        submitted: answer.toLowerCase().trim(),
        correct: questionData.correctAnswer.toLowerCase().trim()
      });
      isCorrect = answer.toLowerCase().trim() === questionData.correctAnswer.toLowerCase().trim();
    }

    console.log('Answer check result:', { isCorrect });

    res.json({
      isCorrect,
      explanation: questionData.explanation || '',
      correctAnswer: questionData.correctAnswer
    });

  } catch (error) {
    console.error('Error in submitAnswer:', error);
    res.status(500).json({ message: 'Error submitting answer', error: error.message });
  }
};
