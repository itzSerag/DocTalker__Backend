const DocumentModel = require('../models/document');
const ChatModel = require('../models/Chat'); // Update Chat model import
const { connectDB } = require('../config/database');
const { convertDocToChunks } = require('../utils/extractDataFromDocs');
const { getEmbeddings } = require('../services/huggingface');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.handler = catchAsync(async (req, res, next) => {
    if (req.method !== 'POST') {
        return res.status(400).json({ message: 'HTTP method not allowed' });
    }

    await connectDB();

    const { chatId } = req.body;
    const currentUser = req.user;

    // Find the chat document based on the provided chatId
    const chat = await ChatModel.findById(chatId);

    // Find the document associated with the chat
    const document = await DocumentModel.findById(chat.documentId); // could be a folder or a file

    if (!document) {
        return next(new AppError('Document ID not found', 404));
    }

    if (document.isProcessed) {
        return next(new AppError('Document has already been processed', 400));
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

    await document.save();

    // Create a new chat document and save it
    const newChat = new ChatModel({
        documentId: document._id,
        chatName: document.FileName,
        messages: [],
    });

    await newChat.save();

    // Update the current user's chats
    currentUser.chats.push(newChat._id);
    await currentUser.save();

    return res
        .status(200)
        .json({ status: 'success', message: 'Document processed and uploaded to MongoDB successfully' });
});
