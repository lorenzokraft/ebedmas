import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
// Temporarily commenting out problematic imports
// import adminRoutes from './routes/adminRoutes.js';
import userRoutes from './routes/userRoutes.js'; 
import learnerRoutes from './routes/learnerRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import subjectRoutes from './routes/subjects.js';
import topicRoutes from './routes/topics.js';
import testRoutes from './routes/test.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import questionRoutes from './routes/questions.js';
import sectionsRouter from './routes/sections.js';
import quoteRequestsRouter from './routes/quoteRequests.js';
import paymentRoutes from './routes/payment.js';
import quizRoutes from './routes/quizRoutes.js';
import { ensureUploadDirectories } from './utils/ensureDirectories.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
ensureUploadDirectories();

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve uploaded files statically
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Debug middleware to log all requests and auth headers
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  if (req.headers.authorization) {
    console.log('Auth header present:', req.headers.authorization.substring(0, 20) + '...');
  } else {
    console.log('No auth header present');
  }
  next();
});

// Routes
// app.use('/api/admin', adminRoutes); // Temporarily commenting out
app.use('/api/users', userRoutes);
app.use('/api/learners', learnerRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/test', testRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/sections', sectionsRouter);
app.use('/api/quote-requests', quoteRequestsRouter);
app.use('/api/payments', paymentRoutes);
app.use('/api/quiz', quizRoutes);

// Debug endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Using JWT secret:', (process.env.JWT_SECRET || 'your-secret-key').substring(0, 3) + '...');
});
