import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import teamRoutes from './routes/team';
import transferRoutes from './routes/transfer';
import { BackgroundJobService } from './services/backgroundJob.service';
import { errorHandler, notFound } from './middleware/error.middleware';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/transfer', transferRoutes);

// Not found middleware (must be after routes)
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start background job service
const backgroundJobService = BackgroundJobService.getInstance();
backgroundJobService.start();

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 