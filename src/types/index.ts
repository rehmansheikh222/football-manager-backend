// Define types manually to avoid Prisma import issues
export interface User {
  id: number;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: number;
  ownerId: number;
  teamName: string;
  budget: number;
  playersCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum Position {
  GOALKEEPER = 'GOALKEEPER',
  DEFENDER = 'DEFENDER',
  MIDFIELDER = 'MIDFIELDER',
  ATTACKER = 'ATTACKER'
}

export interface Player {
  id: number;
  teamId: number;
  name: string;
  askingPrice: number | null;
  position: Position;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface TransferFilter {
  teamName?: string;
  playerName?: string;
  position?: Position;
  minPrice?: number;
  maxPrice?: number;
}

export interface Job {
  id: string;
  type: 'CREATE_TEAM';
  payload: {
    userId: number;
    teamName: string;
  };
  createdAt: Date;
}

// Error handling types
export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  stack?: string;
}

export interface ValidationErrorResponse extends ErrorResponse {
  details?: ValidationError[];
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface TeamStatusResponse {
  teamCreated: boolean;
  team?: Team & { players: Player[] };
  message: string;
}

export interface PlayerWithTeam extends Player {
  team: {
    id: number;
    teamName: string;
  };
}

export interface PurchaseResponse {
  message: string;
  purchasePrice: number;
  player: {
    id: number;
    name: string;
    position: Position;
  };
} 