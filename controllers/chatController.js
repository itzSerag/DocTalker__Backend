const userModel = require('../models/user');
const chatModel = require('../models/Chat');
const Doc = require('../models/document');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllChats = catchAsync(async (req, res, next) => {
    const { id } = req.user; //User ID
    const user = await userModel.findById(id);
    if (!user) {
        return res.status(400).json({ message: 'user not found' });
    }
    const chats = user.chats;
    let allChats = await chatModel.find({ _id: { $in: chats } });
    allChats = allChats.map((chat) => {
        return { id: chat._id, chatName: chat.chatName };
    });
    res.json(allChats);
});

// -- > ?
exports.getChat = catchAsync(async (req, res, next) => {
    const { id } = req.params; //Chat ID
    const chats = req.user.chats;

    if (!chats.includes(id)) {
        return next(new AppError('chat not found', 400));
    }

    const theChat = await chatModel.findById(id);
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
    const user = req.user;
    const chats = user.chats;
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
    const { id } = req.params;
    const { chatName } = req.body;
    await chatModel.findByIdAndUpdate({ _id: id }, { $set: { chatName } }, { new: true });

    return res.json({ status: 'succsess', message: 'Chat Name Updated Successfully' });
});
