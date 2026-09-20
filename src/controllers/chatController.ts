import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Chat from '../models/Chat';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

// Get all chats for the authenticated user
export const getAllChats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const user = await User.findById(req.user._id).populate<{ chats: { _id: string; chatName: string }[] }>(
    'chats',
    'chatName'
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const allChats = (user.chats || []).map((chat) => ({
    id: chat._id,
    chatName: chat.chatName,
  }));

  return res.status(200).json({
    status: 'success',
    allChats,
  });
});

// Get a specific chat and messages (chunks embeddings stripped for lightweight payload)
export const getChat = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const { id } = req.params;
  const userChats = req.user.chats.map((c) => c.toString());

  if (!userChats.includes(id)) {
    return next(new AppError('Chat not found or access denied', 404));
  }

  const theChat = await Chat.findById(id)
    .populate({
      path: 'documentId',
      select: '-Files.Chunks.embeddings',
    })
    .lean();

  if (!theChat) {
    return next(new AppError('Chat not found', 404));
  }

  return res.status(200).json({
    status: 'success',
    theChat,
  });
});

// Delete a chat
export const deleteChat = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const { id } = req.params;
  const userChats = req.user.chats.map((c) => c.toString());

  if (!userChats.includes(id)) {
    return next(new AppError('Cannot find this chat', 404));
  }

  await Chat.findByIdAndDelete(id);
  await User.findByIdAndUpdate(req.user._id, {
    $pull: { chats: id },
  });

  return res.status(200).json({
    status: 'success',
    message: 'Chat deleted successfully',
  });
});

// Update a chat name
export const updateChat = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const { id } = req.params;
  const { chatName } = req.body;
  const userChats = req.user.chats.map((c) => c.toString());

  if (!userChats.includes(id)) {
    return next(new AppError('Cannot find this chat', 404));
  }

  if (!chatName || chatName.trim() === '') {
    return next(new AppError('Chat name cannot be empty', 400));
  }

  const updatedChat = await Chat.findByIdAndUpdate(
    id,
    { chatName: chatName.trim() },
    { new: true }
  );

  return res.status(200).json({
    status: 'success',
    message: 'Chat name updated successfully',
    chat: updatedChat,
  });
});

// Star a message
export const starMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const { chatId, messageId } = req.body;
  if (!chatId || !messageId) {
    return next(new AppError('Both chatId and messageId are required', 400));
  }

  const chat = await Chat.findById(chatId);
  if (!chat) {
    return next(new AppError('Chat not found', 404));
  }

  const message = chat.messages.id(messageId);
  if (!message) {
    return next(new AppError('Message not found in chat', 404));
  }

  const currUser = req.user;
  const alreadyStarred = currUser.starMessages.some(
    (item) => item.messageID.toString() === messageId.toString()
  );

  if (!alreadyStarred) {
    currUser.starMessages.push({
      messageID: new mongoose.Types.ObjectId(messageId),
      chatID: new mongoose.Types.ObjectId(chatId),
    });
    await currUser.save();
  }

  return res.status(200).json({
    status: 'success',
    message: 'Message starred successfully',
  });
});

// Un-star a message
export const unStarMessage = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const { chatId, messageId } = req.body;
  if (!chatId || !messageId) {
    return next(new AppError('Both chatId and messageId are required', 400));
  }

  const currUser = req.user;
  const index = currUser.starMessages.findIndex(
    (msg) => msg.messageID.toString() === messageId.toString()
  );

  if (index === -1) {
    return next(new AppError('Message not found in starred messages', 404));
  }

  currUser.starMessages.splice(index, 1);
  await currUser.save();

  return res.status(200).json({
    status: 'success',
    message: 'Message un-starred successfully',
  });
});

// Get all starred messages
export const getStarredMessages = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('User not authenticated', 401));
  }

  const starred = req.user.starMessages || [];
  if (starred.length === 0) {
    return res.status(200).json({
      status: 'success',
      messages: [],
      message: 'No starred messages yet',
    });
  }

  const messages: any[] = [];
  for (const item of starred) {
    const chat = await Chat.findById(item.chatID, {
      messages: { $elemMatch: { _id: item.messageID } },
    });
    if (chat && chat.messages && chat.messages.length > 0) {
      messages.push({
        the_message: chat.messages[0],
        chatId: item.chatID,
      });
    }
  }

  return res.status(200).json({
    status: 'success',
    messages,
  });
});

export default {
  getAllChats,
  getChat,
  deleteChat,
  updateChat,
  starMessage,
  unStarMessage,
  getStarredMessages,
};
