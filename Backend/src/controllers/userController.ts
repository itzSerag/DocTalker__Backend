import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';
import { clearAuthCookie } from '../utils/cookieUtils';

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    const { firstName, lastName } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { firstName, lastName },
        { new: true, runValidators: true }
    ).select('-password');

    return res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: { user: updatedUser },
    });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    await User.findByIdAndDelete(req.user._id);
    clearAuthCookie(res);

    return res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
    });
});

export const me = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return next(new AppError('User not authenticated', 401));
    }

    const user = await User.findById(req.user._id).select('-password');

    return res.status(200).json({
        status: 'success',
        user,
    });
});

export default { updateUser, deleteUser, me };
