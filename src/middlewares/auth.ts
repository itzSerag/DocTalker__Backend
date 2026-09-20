import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import AppError from '../utils/appError';

interface DecodedToken {
  _id: string;
  iat?: number;
  exp?: number;
}

export const auth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('No authorization token provided. Please log in.', 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Invalid token format. Please log in.', 401));
    }

    const secret = process.env.JWT_SECRET_KEY || 'default-jwt-secret';
    const decoded = jwt.verify(token, secret) as DecodedToken;

    if (!decoded?._id) {
      return next(new AppError('Invalid token payload. Please log in again.', 401));
    }

    const user = await User.findById(decoded._id);
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists.', 401));
    }

    // Automatically check and reset daily limits if day changed
    await user.resetDailyCountersIfNeeded();

    req.user = user;
    return next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token has expired. Please log in again.', 401));
    }
    return next(new AppError(`Authentication error: ${error.message}`, 401));
  }
};

export default auth;
