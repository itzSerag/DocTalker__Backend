const { getCompletion } = require('../utils/getCompletion');
const { getEmbeddings } = require('../services/huggingface');
const { connectDB } = require('../config/database');
const Doc = require('../models/Document');
const { cosineSimilarity } = require('../utils/cosineSimilarity');
const chatModel = require('../models/Chat');
const AppError = require('../utils/appError');
const userModel = require('../models/User');

exports.handler = async (req, res , next) => {


    try {
        const { query, chatId, modelType } = req.body;
        const currUser = req.body;

        await connectDB();

        // Retrieve chat history
        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return next(new AppError('Chat not found', 404));
        }

        // Update chat history with the user's new query
        chat.messages.push({ role: 'user', content: query, model: modelType });
        await chat.save();

        // Prepare chat history for model completion
        const chatHistory = chat.messages.map((message) => ({
            role: message.role,
            content: message.content,
            model: message.model,
        }));

        // Retrieve the document associated with the chat
        const document = await Doc.findById(chat.documentId);
        if (!document) {
            return next(new AppError('Document not found', 404));
        }

        // Calculate similarity between query and document chunks
        const queryEmbeddings = await getEmbeddings(query);
        const similarityResults = document.Files.flatMap((file) =>
            file.Chunks.map((chunk) => ({
                chunk,
                similarity: cosineSimilarity(queryEmbeddings, chunk.embeddings),
            }))
        );

        // Select top five chunks based on similarity
        similarityResults.sort((a, b) => b.similarity - a.similarity);
        const topSimilarityChunks = similarityResults.slice(0, 5).map((result) => ({
            rawText: result.chunk.rawText,
            pageNumber: result.chunk.pageNumber,
        }));

        // Build the prompt
        const promptStart = `You are a helpful bot called DocTalker Bot 
                            that answers questions based on the given text.
                            you and the user with a conversation and you can remmber all the conversation,
                            Answer the question based on the context below ONLY. 
                            NEVER ANSWER SOMETHING NOT IN CONTEXT, and answer in detail:\n\n`;
        const promptEnd = `\n\nQuestion: ${query}`;
        const rawTexts = topSimilarityChunks.map((chunk) => chunk.rawText).join(' ');
        const prompt = `${promptStart}${rawTexts}${promptEnd}`;

        // Add the prompt to chat history
        chatHistory.push({ role: 'user', content: prompt });

        // Transform chat history to string if modelType is 'gemini-text'
        let response;
        if (modelType === 'openai' || modelType === 'gemini-text') {
            const historyForCompletion = modelType === 'gemini-text'
                ? chatHistory.map(chat => `${chat.role}: ${chat.content}`).join('\n')
                : chatHistory;
            response = await getCompletion(historyForCompletion, modelType);
        } else {
            return next(new AppError('Invalid model type', 400));
        }

        // Update chat history with the assistant's response
        chat.messages.push({ role: 'assistant', content: response, model: modelType });
        await chat.save();

        // Increment queryRequest count for the user
        await userModel.findOneAndUpdate(
            { _id: currUser._id },
            { $inc: { queryRequest: 1 } }
        );

        // Return the response
        res.status(200).json({
            response,
            topChunks: topSimilarityChunks,
        });
    } catch (error) {
        next(new AppError(error.message, 400));
    }
};
