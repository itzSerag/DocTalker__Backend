import { Request, Response, NextFunction } from 'express';
import AppError from '../../utils/appError';

export const chatCheck = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const chatId = req.body?.chatId || req.params?.id;

  if (!chatId) {
    return next(new AppError('Chat ID is required', 400));
  }

  const userChats = req.user.chats || [];
  const found = userChats.some((id) => id.toString() === chatId.toString());

  if (found) {
    return next();
  } else {
    return next(new AppError('Chat not found or access denied', 404));
  }
};

export default chatCheck;
