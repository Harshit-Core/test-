import express from 'express';
import { body } from 'express-validator';
import {
  getRecommendations,
  getSavedStacks,
  saveStack,
  unsaveStack
} from '../controllers/stackController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post(
  '/recommend',
  authenticate,
  [
    body('projectDescription').trim().notEmpty(),
    body('constraints').optional().isObject()
  ],
  getRecommendations
);

router.get('/saved', authenticate, getSavedStacks);
router.post('/save/:stackId', authenticate, saveStack);
router.delete('/save/:stackId', authenticate, unsaveStack);

export default router;
