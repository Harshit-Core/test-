import express from 'express';
import { query } from 'express-validator';
import { searchJobs, getJobById } from '../controllers/jobController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get(
  '/search',
  authenticate,
  [
    query('keyword').optional().trim(),
    query('duration').optional().trim(),
    query('isPaid').optional().isBoolean().toBoolean(),
    query('isRemote').optional().isBoolean().toBoolean(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  searchJobs
);

router.get('/:jobId', authenticate, getJobById);

export default router;
