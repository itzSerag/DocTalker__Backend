const { getCompletion } = require('../utils/getCompletion');
const { getEmbeddings } = require('../services/huggingface');
const { connectDB } = require('../config/database');
const Doc = require('../models/Document');
const { cosineSimilarity } = require('../utils/cosineSimilarity');
const chatmodel = require('../models/Chat');
const mongoose = require('mongoose');

exports.handler = async (req, res) => {


    try {
        const { query, chatId, modelType } = req.body;
        const currUser = req.body

        await connectDB();

        // Update chat history and retrieve updated history
        const updatedChat = await chatmodel.findOneAndUpdate(
            { _id: chatId },
            { $push: { messages: { role: 'user', content: query } } },
            { new: true }
        );
        const chatHistory = updatedChat.messages.map((chat) => ({ role: chat.role, content: chat.content, modelType }));

        // Find the document by ID
        const document = await Doc.findById(updatedChat.documentId);

        // Calculate similarity between query and chunks
        const queryEmbeddings = await getEmbeddings(query);
        const similarityResults = document.Files.flatMap((file) =>
            file.Chunks.map((chunk) => ({
                chunk,
                similarity:  cosineSimilarity(queryEmbeddings, chunk.embeddings),
            }))
        );

        // Choose top five chunks with highest similarity
        similarityResults.sort((a, b) => b.similarity - a.similarity);
        const topSimilarityChunks = similarityResults.slice(0, 5).map((result) => ({
            rawText: result.chunk.rawText,
            pageNumber: result.chunk.pageNumber,
        }));

        // Build the prompt
        const promptStart = `You are a helpful bot answers the questions based on the given text ,
                                Answer the question based on the context below ONLY,
                                NEVER ANSWER SOMETHING NOT IN CONTEXT, and answer in detail:\n\n`;
        const promptEnd = `\n\nQuestion: ${query}`;
        const rawTexts = topSimilarityChunks.map((chunk) => chunk.rawText).join(' ');
        const prompt = `${promptStart}${rawTexts}${promptEnd}`;

        chatHistory.push({ role: 'user', content: prompt });

        // Get completion from the model
        let response;
        if (modelType === 'openai' || modelType === 'gemini-text') {
            response = await getCompletion(chatHistory, modelType);
        } else {
            throw new Error('Invalid model type');
        }

        // Update chat model with assistant response
        await chatmodel.findOneAndUpdate(
            { _id: chatId },
            { $push: { messages: { role: 'assistant', content: response } } }
        );

        // add a query to the user
        currUser.queryRequest = currUser.queryRequest + 1;
        await currUser.save();

        // Return the response
        res.status(200).json({
            response,
            topChunks: topSimilarityChunks,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
