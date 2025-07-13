import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { BackgroundJobService } from '../services/backgroundJob.service';
import { LoginRequest, AuthResponse, CustomError } from '../types';
import prisma from '../config/database';

export class AuthController {
  private authService: AuthService;
  private backgroundJobService: BackgroundJobService;

  constructor() {
    this.authService = new AuthService();
    this.backgroundJobService = new BackgroundJobService();
  }

  async login(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { email, password }: LoginRequest = req.body;
    
    // Check if user exists to determine if this is login or registration
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    const isNewUser = !existingUser;
    
    const authResponse: AuthResponse = await this.authService.authenticateUser({ email, password });
    
    // If new user, add team creation job
    if (isNewUser) {
      const teamName = `${email}'s Team`;
      await this.backgroundJobService.addTeamCreationJob(authResponse.user.id, teamName);
    }

    res.json({
      ...authResponse,
      isNewUser,
      message: isNewUser ? 'User registered successfully. Team creation in progress.' : 'Login successful',
    });
  }
} 