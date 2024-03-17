const User = require('../models/User');
const Chat = require('../models/Chat');
const Doc = require('../models/Document');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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
    res.json(allChats);
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

    return res.status(200).json({ status: 'succsess', name, messages, url: document.FileUrl });
});

exports.deleteChat = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { chats } = req.user;

    console.log(chats);

    if (!chats.includes(id)) {
        return next(new AppError('cant find the chat', 400));
    }

    const deleteChat = await chatModel.findByIdAndDelete(id);
    const updatedUser = await userModel.findByIdAndUpdate(user._id, {
        $pull: { chats: id },
    });

    res.status(200).json({ status: 'succsess', deleteChat, updatedUser });
});

exports.updateChat = catchAsync(async (req, res, next) => {
    const { chatId } = req.body;
    const { chatName } = req.body;
    await chatModel.findByIdAndUpdate({ _id: id }, { $set: { chatName } }, { new: true });

    return res.json({ status: 'succsess', message: 'Chat Name Updated Successfully' });
});

exports.startMessage = catchAsync(async (req, res, next) => {
    const { userId } = req.user;
    const { chatId, messageId } = req.body;

    // chat message model :

    // {
    //     chatName: {
    //         type: String,
    //         required: true,
    //         default: 'New Chat',
    //     },

    //     documentId: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         ref: 'document',
    //         required: true,
    //     },
    //     messages: [
    //         {
    //             role: { type: String, enum: ['user', 'assistant'], default: 'user' },
    //             content: String,
    //             isStared: { type: Boolean, default: false },
    //         },
    //     ],
    // },
    // {
    //     timestamps: true,

    // }

    
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    const message = chat.messages.find((msg) => msg._id == messageId); // messages is an array of objects with _id property
    if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found in the chat' });
    }

    // Check if the message is already starred
    if (message.isStared) {
        return res.status(400).json({ success: false, message: 'Message is already starred' });
    }

    // Update the message to mark it as starred
    message.isStared = true;

    // Save the changes to the chat
    await chat.save();

    res.status(200).json({ success: true, message: 'Message starred successfully' });
});

exports.unstartMessage = catchAsync(async (req, res, next) => {
    const { userId } = req.user; // Assuming req.user contains user information
    const { chatId, messageId } = req.body;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the chat
    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    // Find the message in the chat
    const message = chat.messages.find((msg) => msg._id == messageId); // Assuming messages is an array of objects with _id property
    if (!message) {
        return res.status(404).json({ success: false, message: 'Message not found in the chat' });
    }

    // Check if the message is already un-starred
    if (!message.isStared) {
        return res.status(400).json({ success: false, message: 'Message is not starred' });
    }

    // Update the message to mark it as un-starred
    message.isStared = false;

    // Save the changes to the chat
    await chat.save();

    res.status(200).json({ success: true, message: 'Message un-starred successfully' });
});
