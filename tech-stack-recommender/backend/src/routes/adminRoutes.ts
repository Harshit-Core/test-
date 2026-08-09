import express from 'express';
import { body } from 'express-validator';
import {
  createJob,
  updateJob,
  deleteJob,
  createStack,
  updateStack,
  deleteStack,
  getAllStacks
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.post(
  '/jobs',
  [
    body('title').trim().notEmpty(),
    body('company').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('location').trim().notEmpty(),
    body('externalUrl').trim().isURL()
  ],
  createJob
);

router.patch('/jobs/:jobId', updateJob);
router.delete('/jobs/:jobId', deleteJob);

router.get('/stacks', getAllStacks);

router.post(
  '/stacks',
  [
    body('name').trim().notEmpty(),
    body('description').trim().notEmpty(),
    body('components').isArray(),
    body('tags').isArray()
  ],
  createStack
);

router.patch('/stacks/:stackId', updateStack);
router.delete('/stacks/:stackId', deleteStack);

export default router;
