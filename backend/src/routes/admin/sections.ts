import express from 'express';
import { SectionModel } from '../../models/Section';
import { authenticateAdmin } from '../../middleware/auth';
import { validateRequestBody } from '../../middleware/validation';
import { z } from 'zod';

const router = express.Router();

// Schema for section creation/update
const sectionSchema = z.object({
  name: z.string().min(1, 'Section name is required'),
  topic_id: z.number().int().positive('Topic ID is required')
});

// Get all sections
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const sections = await SectionModel.getAll();
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

// Create new section
router.post('/', 
  authenticateAdmin,
  validateRequestBody(sectionSchema),
  async (req, res) => {
    try {
      const sectionData = {
        ...req.body,
        created_by: req.user!.id
      };
      const id = await SectionModel.create(sectionData);
      res.status(201).json({ id });
    } catch (error) {
      console.error('Error creating section:', error);
      res.status(500).json({ error: 'Failed to create section' });
    }
});

// Get section by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const section = await SectionModel.getById(Number(req.params.id));
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
});

// Update section
router.put('/:id',
  authenticateAdmin,
  validateRequestBody(sectionSchema.partial()),
  async (req, res) => {
    try {
      const updated = await SectionModel.update(Number(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Section not found' });
      }
      res.json({ message: 'Section updated successfully' });
    } catch (error) {
      console.error('Error updating section:', error);
      res.status(500).json({ error: 'Failed to update section' });
    }
});

// Delete section
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    await SectionModel.delete(Number(req.params.id));
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ error: 'Failed to delete section' });
  }
});

// Get sections by topic ID
router.get('/topic/:topicId', authenticateAdmin, async (req, res) => {
  try {
    const sections = await SectionModel.getByTopicId(Number(req.params.topicId));
    res.json(sections);
  } catch (error) {
    console.error('Error fetching sections by topic:', error);
    res.status(500).json({ error: 'Failed to fetch sections' });
  }
});

export default router;
