import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/appError';

export const isUserValid = (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    if (req.user.isVerified) {
        return next();
    }

    return next(new AppError('Please verify your email address to access this feature', 403));
};

export default isUserValid;
