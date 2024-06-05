const User = require('../models/User');
const Chat = require('../models/Chat');
const Doc = require('../models/Document');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const mongoose = require('mongoose');

exports.getAllChats = catchAsync(async (req, res, next) => {

    const { id } = req.user; //User ID
    const user = await User.findById(id);
    if (!user) {
        return res.status(400).json({ message: 'user not found' });
    }
    const chats = user.chats;
    let allChats = await Chat.find({ _id: { $in: chats } });
    allChats = allChats.map((chat) => {
        return { id: chat._id, chatName: chat.chatName };
    });
    res.status(200).json({
        allChats
    });
});

// -- > ?
exports.getChat = catchAsync(async (req, res, next) => {
    const { id } = req.params; //Chat ID
    const { chats } = req.user;

    if (!chats.includes(id)) {
        return next(new AppError('chat not found', 400));
    }

    const theChat = await Chat.findById(id);
    if (!theChat) {
        return next(new AppError('chat not found', 400));
    }
    const name = theChat.chatName;
    const messages = theChat.messages;

    const document = await Doc.findById(theChat.documentId);

    return res.status(200).json({

        status: 'success', 
        name,
        messages,
        url: document.FileUrl 
    });
});

exports.deleteChat = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { chats } = req.user;


    if (!chats.includes(id)) {
        return next(new AppError('cant find the chat', 400));
    }

    const deleteChat = await chatModel.findByIdAndDelete(id);
    const updatedUser = await userModel.findByIdAndUpdate(user._id, {
        $pull: { chats: id },
    });

    res.status(200).json({ 
        status: 'success', 
        deleteChat, 
        updatedUser 
    });
});

exports.updateChat = catchAsync(async (req, res, next) => {
    const { chatId } = req.body;
    const { chatName } = req.body;
    await chatModel.findByIdAndUpdate({ _id: id }, { $set: { chatName } }, { new: true });

    return res.json({ status: 'succsess', message: 'Chat Name Updated Successfully' });
});

// Import Mongoose

// Define the startMessage handler
exports.startMessage = catchAsync(async (req, res, next) => {
    const currUser = req.user;
    console.log(currUser);

    const userId = currUser._id;
    const { chatId, messageId } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the chat by ID
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Find the message in the chat
    const message = chat.messages.find((msg) => msg._id.toString() === messageId);
    if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found in the chat' });
    }

    // Ensure messageId is an ObjectId (convert if necessary)
    const messageIdObj = new mongoose.Types.ObjectId(messageId);

    // Add message id to the user's starMessages array
    user.starMessages.push({ messageID: messageIdObj, chatID: chat._id });

    await user.save();

    res.status(200).json({ success: true, message: 'Message starred successfully' });
});

exports.unStartMessage = catchAsync(async (req, res, next) => {
    const currUser = req.user;
    console.log(currUser);

    const userId = currUser._id;
    const { chatId, messageId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the chat and check if it exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // find this message ID in starMessages of the user then delete it from the array

    const index = user.starMessages.findIndex((msg) => msg.messageID.toString() === messageId);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Message not starred' });
    }

    user.starMessages.splice(index, 1);
    
    await user.save();

    res.status(200).json({ success: true, message: 'Message un-starred successfully' });
});



exports.getStarMessages = catchAsync(async (req, res, next) => {
    const { userId } = req.user;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const starMessages = user.starMessages;

    res.status(200).json({ success: true, data: starMessages });
});
