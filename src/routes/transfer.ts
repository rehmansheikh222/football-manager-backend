import express from 'express';
import { body } from 'express-validator';
import asyncHandler from 'express-async-handler';
import { authMiddleware } from '../middleware/auth.middleware';
import { TransferController } from '../controllers/transfer.controller';

const router = express.Router();
const transferController = new TransferController();

// Get transfer market with filters
router.get('/market', 
  asyncHandler(transferController.getTransferMarket.bind(transferController))
);

// Add player to transfer list
router.post(
  '/add',
  authMiddleware,
  [
    body('playerId').isInt({ min: 1 }),
    body('askingPrice').isInt({ min: 1 }),
  ],
  asyncHandler(transferController.addPlayerToTransferList.bind(transferController))
);

// Remove player from transfer list
router.post(
  '/remove',
  authMiddleware,
  [body('playerId').isInt({ min: 1 })],
  asyncHandler(transferController.removePlayerFromTransferList.bind(transferController))
);

// Buy player
router.post(
  '/buy',
  authMiddleware,
  [body('playerId').isInt({ min: 1 })],
  asyncHandler(transferController.buyPlayer.bind(transferController))
);

export default router; 