import express from 'express';
import asyncHandler from 'express-async-handler';
import { authMiddleware } from '../middleware/auth.middleware';
import { TeamController } from '../controllers/team.controller';

const router = express.Router();
const teamController = new TeamController();

// Get team status (check if team is created, also returns team info)
router.get('/status', 
  authMiddleware, 
  asyncHandler(teamController.getTeamStatus.bind(teamController))
);

export default router; 