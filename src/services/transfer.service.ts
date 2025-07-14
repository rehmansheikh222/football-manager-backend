import prisma from '../config/database';
import { TransferFilter, Position, CustomError, PlayerWithTeam, PurchaseResponse } from '../types';
import { Prisma } from '@prisma/client';

export class TransferService {
  private static purchaseMutex = new Map<number, boolean>();

  async addPlayerToTransferList(playerId: number, askingPrice: number, userId: number) {
    // Check if player belongs to user's team
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        team: true,
      },
    });

    if (!player) {
      const error: CustomError = new Error('Player not found');
      error.statusCode = 404;
      throw error;
    }

    if (player.team.ownerId !== userId) {
      const error: CustomError = new Error('You can only manage your own players');
      error.statusCode = 403;
      throw error;
    }

    // Count players already in transfer market from this team
    const playersInTransferMarket = await prisma.player.count({
      where: {
        teamId: player.teamId,
        askingPrice: {
          not: null,
        },
      },
    });

    // Check if team would have less than 15 players after accounting for transfer market players
    const effectivePlayerCount = player.team.playersCount - playersInTransferMarket;
    if (effectivePlayerCount <= 15) {
      const error: CustomError = new Error('Cannot add player to transfer list. Team must have at least 15 players after accounting for players already in transfer market');
      error.statusCode = 400;
      throw error;
    }

    // Add player to transfer list
    await prisma.player.update({
      where: { id: playerId },
      data: { askingPrice },
    });

    return { message: 'Player added to transfer list successfully' };
  }

  async removePlayerFromTransferList(playerId: number, userId: number) {
    // Check if player belongs to user's team
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        team: true,
      },
    });

    if (!player) {
      const error: CustomError = new Error('Player not found');
      error.statusCode = 404;
      throw error;
    }

    if (player.team.ownerId !== userId) {
      const error: CustomError = new Error('You can only manage your own players');
      error.statusCode = 403;
      throw error;
    }

    // Remove player from transfer list
    await prisma.player.update({
      where: { id: playerId },
      data: { askingPrice: null },
    });

    return { message: 'Player removed from transfer list successfully' };
  }

  async buyPlayer(playerId: number, buyerUserId: number): Promise<PurchaseResponse> {
    // Use mutex to prevent race conditions
    if (TransferService.purchaseMutex.get(playerId)) {
      const error: CustomError = new Error('Player purchase already in progress');
      error.statusCode = 409;
      throw error;
    }

    TransferService.purchaseMutex.set(playerId, true);

    try {
      return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Get player with team info
        const player = await tx.player.findUnique({
          where: { id: playerId },
          include: {
            team: true,
          },
        });

        if (!player) {
          const error: CustomError = new Error('Player not found');
          error.statusCode = 404;
          throw error;
        }

        if (!player.askingPrice) {
          const error: CustomError = new Error('Player is not available for transfer');
          error.statusCode = 400;
          throw error;
        }

        if (player.team.ownerId === buyerUserId) {
          const error: CustomError = new Error('Cannot buy your own player');
          error.statusCode = 400;
          throw error;
        }

        // Get buyer's team
        const buyerTeam = await tx.team.findUnique({
          where: { ownerId: buyerUserId },
        });

        if (!buyerTeam) {
          const error: CustomError = new Error('Buyer team not found');
          error.statusCode = 404;
          throw error;
        }

        // Check if buyer's team has 25 or more players
        if (buyerTeam.playersCount >= 25) {
          const error: CustomError = new Error('Cannot buy player. Team cannot have more than 25 players');
          error.statusCode = 400;
          throw error;
        }

        // Calculate purchase price (95% of asking price)
        const purchasePrice = Math.floor(player.askingPrice * 0.95);

        // Check if buyer has enough budget
        if (buyerTeam.budget < purchasePrice) {
          const error: CustomError = new Error('Insufficient budget');
          error.statusCode = 400;
          throw error;
        }

        // Update buyer's team budget and player count
        await tx.team.update({
          where: { id: buyerTeam.id },
          data: {
            budget: buyerTeam.budget - purchasePrice,
            playersCount: buyerTeam.playersCount + 1,
          },
        });

        // Update seller's team budget and player count
        await tx.team.update({
          where: { id: player.teamId },
          data: {
            budget: player.team.budget + purchasePrice,
            playersCount: player.team.playersCount - 1,
          },
        });

        // Transfer player to buyer's team
        await tx.player.update({
          where: { id: playerId },
          data: {
            teamId: buyerTeam.id,
            askingPrice: null, // Remove from transfer list
          },
        });

        return {
          message: 'Player purchased successfully',
          purchasePrice,
          player: {
            id: player.id,
            name: player.name,
            position: player.position as Position,
          },
        };
      });
    } finally {
      TransferService.purchaseMutex.delete(playerId);
    }
  }

  async getTransferMarket(filters: TransferFilter): Promise<PlayerWithTeam[]> {
    const where: Record<string, any> = {
      askingPrice: {
        not: null,
      },
    };

    if (filters.playerName) {
      where.name = {
        contains: filters.playerName,
        mode: 'insensitive',
      };
    }

    if (filters.position) {
      where.position = filters.position;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.askingPrice = {
        ...where.askingPrice,
        ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
        ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
      };
    }

    // Exclude players from current user's team if userId is provided
    if (filters.userId) {
      where.team = {
        ownerId: {
          not: filters.userId,
        },
      };
    }

    const players = await prisma.player.findMany({
      where,
      include: {
        team: {
          select: {
            id: true,
            teamName: true,
          },
        },
      },
      orderBy: {
        askingPrice: 'asc',
      },
    });

    // Filter by team name if provided
    if (filters.teamName) {
      return players.filter((player: any) => 
        player.team.teamName.toLowerCase().includes(filters.teamName!.toLowerCase())
      ) as PlayerWithTeam[];
    }

    return players as PlayerWithTeam[];
  }
} 