import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import stackRoutes from './routes/stackRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import adminRoutes from './routes/adminRoutes';
import { authenticate, authorize } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { Role } from '@prisma/client';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/stacks', stackRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/refresh-jobs', authenticate, authorize(Role.ADMIN), async (_req, res) => {
  try {
    const { refreshJobs } = await import('./jobs/jobRefresh');
    await refreshJobs();
    res.json({ message: 'Jobs refreshed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.use(errorHandler);

export default app;
