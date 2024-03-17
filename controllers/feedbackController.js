// feedbackController.js

const Chat = require('../models/Chat'); // Assuming you have a Chat model
const Feedback = require('../models/Feedback'); // Assuming you have a Feedback model
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { connectDB } = require('../config/database');

exports.feedbackController = catchAsync(async (req, res, next) => {
    const { chatId, messageId, feedbackMessage } = req.body; // Assuming these fields are sent in the request body

    // Check if all required fields are provided
    if (!chatId || !messageId || !feedbackMessage) {
        return next(new AppError('Please provide chatId, messageId, and feedbackMessage', 400));
    }

    try {
        await connectDB();
        // 1 - Get the chat and find the message
        const chat = await Chat.findById(chatId);
        if (!chat) {
            return next(new AppError('Chat not found', 404));
        }

        const message = chat.messages.find((msg) => msg._id.toString() === messageId);
        if (!message) {
            return next(new AppError('Message not found in the chat', 404));
        }

        // 2 - Create a feedback message with the given message id
        const feedback = new Feedback({
            userId: req.user._id, // Assuming userId is stored in req.user
            chatId,
            messageId,
            feedbackMessage,
        });

        // 3 - Save the feedback message
        await feedback.save();

        res.status(201).json({
            status: 'success',
            data: {
                feedback,
            },
        });
    } catch (err) {
        console.log(err);
    }
});
