import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty()
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  login
);

router.get('/profile', authenticate, getProfile);

export default router;
