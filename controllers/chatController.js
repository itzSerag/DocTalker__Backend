const User = require('../models/User');
const Chat = require('../models/Chat');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

// Get all chats for a user
exports.getAllChats = catchAsync(async (req, res, next) => {
    const { id } = req.user; // User ID
    const user = await User.findById(id).populate('chats', 'chatName');

    if (!user) {
        return next(new AppError('User not found' , 400 ));
    }

    const allChats = user.chats.map((chat) => ({
        id: chat._id,
        chatName: chat.chatName,
    }));

    res.status(200).json({
        allChats,
    });
});

// Get a specific chat
exports.getChat = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Chat ID
    const { chats } = req.user;

    if (!chats.includes(id)) {
        return next(new AppError('Chat not found', 400));
    }

    const theChat = await Chat.findById(id).populate('documentId', 'Files').lean();
    if (!theChat) {
        return next(new AppError('Chat not found', 400));
    }

    // Remove Chunks field
    if (theChat.documentId && Array.isArray(theChat.documentId.Files)) {
        theChat.documentId.Files.forEach(file => {
            if (file.Chunks) {
                delete file.Chunks;
            }
        });
    }

    res.status(200).json({
        status: 'success',
        theChat,
    });
});

// Delete a chat
exports.deleteChat = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { chats } = req.user;

    if (!chats.includes(id)) {
        return next(new AppError('Cannot find the chat', 400));
    }

    await Chat.findByIdAndDelete(id);
    await User.findByIdAndUpdate(req.user._id, {
        $pull: { chats: id },
    });

    res.status(200).json({
        status: 'success',
        message: 'Chat deleted successfully',
    });
});

// Update a chatsss name
exports.updateChat = catchAsync(async (req, res, next) => {
    const { chatName } = req.body;
    const { id } = req.params;
    const { chats } = req.user;

    if (!chats.includes(id)) {
        return next(new AppError('Cannot find the chat', 400));
    }

    if (chatName.trim() === '') {
        return next(new AppError('Chat name cannot be empty', 400));
    }

    await Chat.findByIdAndUpdate(id, { chatName });

    res.status(200).json({
        status: 'success',
        message: 'Chat name updated successfully',
    });
});

// Star a message
exports.starMessage = catchAsync(async (req, res, next) => {
    const { chatId, messageId } = req.body;
    const currUser = req.user;

    // Find the chat and message
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return next(new AppError('Chat not found', 404));
    }

    const message = chat.messages.id(messageId);
    if (!message) {
        return next(new AppError('Message not found in the chat', 404));
    }

    // Ensure messageId is an ObjectId
    const messageIdObj = new mongoose.Types.ObjectId(messageId);

    // Add message id to the user's starMessages array
    currUser.starMessages.push({ messageID: messageIdObj, chatID: chat._id });
    await currUser.save();

    res.status(200).json({
        status: 'success',
        message: 'Message starred successfully',
    });
});

exports.unStarMessage = catchAsync(async (req, res, next) => {
    const currUser = req.user;
    const { chatId, messageId } = req.body;

    // Find the chat and check if it exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // find this message ID in starMessages of the user then delete it from the array

    const index = currUser.starMessages.findIndex((msg) => msg.messageID.toString() === messageId);
    if (index === -1) {
        next(new AppError('Message not found in starred messages', 404));
    }

    currUser.starMessages.splice(index, 1);
    await currUser.save();

    res.status(200).json({
        status: 'success',
        message: 'Message un-starred successfully',
    });
});

exports.getStarredMessages = catchAsync(async (req, res, next) => {
    const currUser = req.user;

    const starredMessages = currUser.starMessages;
    const messages = [];

    console.log(starredMessages);

    if (starredMessages.length === 0) {
        return res.status(200).json({
            status: 'success',
            message : 'No starred messages Yet',
        });
    }

    for (let i = 0; i < starredMessages.length; i++) {
        const chatId = starredMessages[i].chatID ;
        const message = await Chat.findById(starredMessages[i].chatID, {
            messages: { $elemMatch: { _id: starredMessages[i].messageID } },
        });
        const the_message = message.messages[0];

        messages.push({
            the_message,
            chatId
        });
    }

    

    res.status(200).json({
        status: 'success',
        messages,
    });
});
