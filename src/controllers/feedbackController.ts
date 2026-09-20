import { Request, Response, NextFunction } from 'express';
import Chat from '../models/Chat';
import Feedback from '../models/Feedback';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const feedbackController = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User not authenticated', 401));
    }

    const { chatId, messageId, feedbackMessage } = req.body;

    if (!chatId || !messageId || !feedbackMessage) {
      return next(
        new AppError('Please provide chatId, messageId, and feedbackMessage', 400)
      );
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return next(new AppError('Chat not found', 404));
    }

    const message = chat.messages.id(messageId);
    if (!message) {
      return next(new AppError('Message not found in chat', 404));
    }

    const feedback = new Feedback({
      userId: req.user._id,
      chatId,
      messageId,
      feedbackMessage: feedbackMessage.trim(),
    });

    await feedback.save();

    return res.status(201).json({
      status: 'success',
      message: 'Feedback submitted successfully',
      data: {
        feedback,
      },
    });
  }
);

export default { feedbackController };
