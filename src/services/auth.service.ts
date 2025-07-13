import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { LoginRequest, AuthResponse, CustomError } from '../types';

export class AuthService {
  async authenticateUser(loginRequest: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginRequest;

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // User doesn't exist, create new user (register)
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      console.log(`New user registered: ${email}`);
    } else {
      // User exists, verify password (login)
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        const error: CustomError = new Error('Invalid credentials');
        error.statusCode = 401;
        throw error;
      }

      console.log(`User logged in: ${email}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async getUserById(userId: number) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as {
        userId: number;
        email: string;
        iat: number;
        exp: number;
      };
    } catch (error) {
      const customError: CustomError = new Error('Invalid token');
      customError.statusCode = 401;
      throw customError;
    }
  }
} 