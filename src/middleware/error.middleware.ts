import { Request, Response, NextFunction } from 'express';
import { CustomError, ErrorResponse } from '../types';

// Error handler middleware
export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error: CustomError = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { ...error, message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === '11000') {
    const message = 'Duplicate field value entered';
    error = { ...error, message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = 'Validation error';
    error = { ...error, message, statusCode: 400 };
  }

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    const message = 'Duplicate value for unique field';
    error = { ...error, message, statusCode: 400 };
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    const message = 'Record not found';
    error = { ...error, message, statusCode: 404 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { ...error, message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { ...error, message, statusCode: 401 };
  }

  const response: ErrorResponse = {
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(error.statusCode || 500).json(response);
};

// Not found middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error: CustomError = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}; 