import express from 'express';
import { body } from 'express-validator';
import asyncHandler from 'express-async-handler';
import { AuthController } from '../controllers/auth.controller';

const router = express.Router();
const authController = new AuthController();

// Single endpoint for both login and registration
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  asyncHandler(authController.login.bind(authController))
);

export default router; 