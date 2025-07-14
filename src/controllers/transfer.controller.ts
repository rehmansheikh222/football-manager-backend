import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { TransferService } from '../services/transfer.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { TransferFilter, Position, PlayerWithTeam, PurchaseResponse } from '../types';
import { formatValidationErrors } from '../utils/validation';

export class TransferController {
  private transferService: TransferService;

  constructor() {
    this.transferService = new TransferService();
  }

  async getTransferMarket(req: AuthRequest, res: Response): Promise<void> {
    const { teamName, playerName, position, minPrice, maxPrice } = req.query;
    const userId = req.user!.userId;
    
    const filters: TransferFilter = {
      teamName: teamName as string,
      playerName: playerName as string,
      position: position as Position,
      minPrice: minPrice ? parseInt(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
      userId: userId, // Exclude players from current user's team
    };

    const players: PlayerWithTeam[] = await this.transferService.getTransferMarket(filters);
    res.json(players);
  }

  async addPlayerToTransferList(req: AuthRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorResponse = formatValidationErrors(errors.array());
      res.status(400).json(errorResponse);
      return;
    }

    const { playerId, askingPrice } = req.body;
    const userId = req.user!.userId;

    const result = await this.transferService.addPlayerToTransferList(
      playerId,
      askingPrice,
      userId
    );

    res.json(result);
  }

  async removePlayerFromTransferList(req: AuthRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorResponse = formatValidationErrors(errors.array());
      res.status(400).json(errorResponse);
      return;
    }

    const { playerId } = req.body;
    const userId = req.user!.userId;

    const result = await this.transferService.removePlayerFromTransferList(
      playerId,
      userId
    );

    res.json(result);
  }

  async buyPlayer(req: AuthRequest, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorResponse = formatValidationErrors(errors.array());
      res.status(400).json(errorResponse);
      return;
    }

    const { playerId } = req.body;
    const userId = req.user!.userId;

    const result: PurchaseResponse = await this.transferService.buyPlayer(playerId, userId);
    res.json(result);
  }
} 