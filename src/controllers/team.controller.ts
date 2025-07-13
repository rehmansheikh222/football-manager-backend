import { Response } from 'express';
import { TeamService } from '../services/team.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { TeamStatusResponse, ErrorResponse } from '../types';

export class TeamController {
  private teamService: TeamService;

  constructor() {
    this.teamService = new TeamService();
  }

  async getTeamStatus(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const team = await this.teamService.getTeamByUserId(userId);
    
    if (!team) {
      const response: TeamStatusResponse = {
        teamCreated: false,
        message: 'Team creation is in progress',
      };
      res.json(response);
      return;
    }

    const response: TeamStatusResponse = {
      teamCreated: true,
      team: team as any,
      message: 'Team found',
    };
    res.json(response);
  }

  async getTeam(req: AuthRequest, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const team = await this.teamService.getTeamByUserId(userId);
    
    if (!team) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'Team not found',
      };
      res.status(404).json(errorResponse);
      return;
    }

    res.json(team);
  }
} 