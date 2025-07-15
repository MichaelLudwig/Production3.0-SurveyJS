import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export function errorHandler(
  error: any,
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): void {
  console.error(`[ERROR] ${req.method} ${req.path}:`, error);

  // Default error response
  const response: ApiResponse = {
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'An error occurred'
  };

  // Handle specific error types
  if (error.message?.includes('File not found')) {
    res.status(404).json({
      ...response,
      error: 'Not found',
      message: error.message
    });
    return;
  }

  if (error.message?.includes('validation')) {
    res.status(400).json({
      ...response,
      error: 'Validation error',
      message: error.message
    });
    return;
  }

  // Generic server error
  res.status(500).json(response);
}

export function notFoundHandler(req: Request, res: Response<ApiResponse>): void {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `${req.method} ${req.path} not found`
  });
}