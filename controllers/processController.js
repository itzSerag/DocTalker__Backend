const DocumentModel = require('../models/document');
const ChatModel = require('../models/Chat'); // Update Chat model import
const { connectDB } = require('../config/database');
const { convertDocToChunks } = require('../utils/extractDataFromDocs');
const { getEmbeddings } = require('../services/huggingface');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');

exports.handler = catchAsync(async (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(400).json({ message: 'HTTP method not allowed' });
    }

    const session = await mongoose.startSession();
    session.startTransaction(session.defaultTransactionOptions);

    const { chatId } = req.body;
    const currentUser = req.user;

    await connectDB();

    try {
        // Find the chat document based on the provided chatId
        const chat = await ChatModel.findById(chatId);

        // Find the document associated with the chat
        const document = await DocumentModel.findById(chat.documentId); // could be a folder or a file

        if (!document) {
            return next(new AppError('Document ID not found', 404));
        }

        // OPTIONAL
        if (document.isProcessed) {
            return next(new AppError('Document has already has been processed', 400));
        }

        // Loop through each file in the document
        for (const file of document.Files) {
            const chunks = await convertDocToChunks(file.FileName, file.FileURL);

            const vectors = [];
            for (const chunk of chunks) {
                const embedding = await getEmbeddings(chunk);
                vectors.push({
                    rawText: chunk,
                    embeddings: embedding,
                });
            }

            // Update the chunks and isProcessed flag in the file
            file.Chunks = vectors;
            file.isProcessed = true;
        }

        await document.save({ session: session });

        // Create a new chat document and save it
        const newChat = new ChatModel({
            documentId: document._id,
            chatName: document.FileName,
            messages: [],
        });

        await newChat.save({ session: session });

        // Update the current user's chats
        currentUser.chats.push(newChat._id);

        await currentUser.save({ session: session });

        await session.commitTransaction();
        return res.status(200).json({
            status: 'success',
            message: 'Document processed and uploaded to MongoDB successfully',
        });
    } catch (error) {
        console.error(error);
        await session.abortTransaction();
    }
});
