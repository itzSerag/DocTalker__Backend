import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import AppError from '../utils/appError';

const handleCastErrorDB = (err: any): AppError => {
  return new AppError(`Invalid ${err.path}: ${err.value}.`, 400);
};

const handleDuplicateFieldsDB = (err: any): AppError => {
  const keys = Object.keys(err.keyValue || {});
  const field = keys.length > 0 ? keys[0] : 'field';
  return new AppError(`${field} already exists. Please use another value.`, 400);
};

const handleValidationErrorDB = (err: any): AppError => {
  const errors = Object.values(err.errors || {}).map((el: any) => el.message);
  return new AppError(`Invalid input data: ${errors.join('. ')}`, 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired. Please log in again.', 401);

export const globalErrorHandler: ErrorRequestHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message || 'Something went wrong';
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR STACK:', err);
  }

  if (err.name === 'CastError') error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  res.status(error.statusCode).json({
    status: error.status,
    statusCode: error.statusCode,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack, error: err } : {}),
  });
};

export default globalErrorHandler;
