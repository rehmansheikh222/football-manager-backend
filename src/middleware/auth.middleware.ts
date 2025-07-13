import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { CustomError } from '../types';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: CustomError = new Error('Access token required');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const authService = new AuthService();
    const decoded = authService.verifyToken(token);
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    const customError = error as CustomError;
    if (!customError.statusCode) {
      customError.statusCode = 401;
    }
    next(customError);
  }
}; 