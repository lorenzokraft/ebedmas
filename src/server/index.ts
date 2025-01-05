import express from 'express';
import cors from 'cors';
import adminAuthRoutes from './routes/adminAuth.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminAuthRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 