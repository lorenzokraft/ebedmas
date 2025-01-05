import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import gradeRoutes from './routes/grades';
import subjectRoutes from './routes/subjects';
import topicRoutes from './routes/topics';
import testRoutes from './routes/test';
import subscriptionRoutes from './routes/subscriptionRoutes';
import questionRoutes from './routes/questions';
import { ensureUploadDirectories } from './utils/ensureDirectories';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
ensureUploadDirectories();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/', testRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/questions', questionRoutes);

// Debug endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Something broke!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 