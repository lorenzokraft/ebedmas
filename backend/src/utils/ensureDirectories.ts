import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ensureUploadDirectories = () => {
  const uploadsDir = path.join(__dirname, '../../uploads');
  const questionsDir = path.join(uploadsDir, 'questions');

  // Create directories if they don't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  if (!fs.existsSync(questionsDir)) {
    fs.mkdirSync(questionsDir, { recursive: true });
  }

  console.log('Upload directories created successfully');
}; 