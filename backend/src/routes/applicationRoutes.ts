import express from 'express';
import { body } from 'express-validator';
import {
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getStats
} from '../controllers/applicationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, getApplications);
router.get('/stats', authenticate, getStats);

router.post(
  '/',
  authenticate,
  [
    body('jobId').notEmpty(),
    body('status').optional().isIn(['SAVED', 'APPLIED', 'INTERVIEWING', 'REJECTED', 'OFFER'])
  ],
  createApplication
);

router.patch(
  '/:applicationId',
  authenticate,
  [
    body('status').optional().isIn(['SAVED', 'APPLIED', 'INTERVIEWING', 'REJECTED', 'OFFER']),
    body('notes').optional().isString()
  ],
  updateApplication
);

router.delete('/:applicationId', authenticate, deleteApplication);

export default router;
