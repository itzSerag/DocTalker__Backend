const DocumentModel = require('../models/Document');
const ChatModel = require('../models/Chat');
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
        const document = await DocumentModel.findById(chat.documentId);

        if (!document) {
            return next(new AppError('Document ID not found', 404));
        }

        // OPTIONAL
        if (document.isProcessed) {
            return next(new AppError('Document has already been processed', 400));
        }


        // Assuming Files is an array of file objects
    for (const file of document.Files) {

        try {

            // Convert the document to chunks based on the file type
            const chunks = await convertDocToChunks(file.FileName, file.FileURL, file.FileKey);

            const vectors = [];
            // Process each chunk
            await Promise.all(chunks.map(async (chunk) => {
                // Get embeddings for the chunk
                const embedding = await getEmbeddings(chunk.chunk);
                // Store chunk data
                vectors.push({
                    rawText: chunk.chunk,
                    embeddings: embedding,
                    pageNumber: chunk.pageNumber || null, // Use null if page number is not available
                });
            }));

            // Update file object with processed chunks
            file.Chunks = vectors;
            file.isProcessed = true;

        } catch (error) {
            // Handle errors gracefully
            console.error(`Error processing file ${file.FileName}: ${error.message}`);
        }
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
    } finally {
        session.endSession();
    }
});
