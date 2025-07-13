import { ValidationErrorResponse } from '../types';

export function formatValidationErrors(errors: any[]): ValidationErrorResponse {
  const formattedErrors = errors.map(error => ({
    field: error.path || error.param,
    message: error.msg || error.message
  }));

  return {
    success: false,
    error: 'Validation failed',
    details: formattedErrors
  };
} 