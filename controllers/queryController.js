const { getCompletion } = require('../utils/getCompletion');
const { getEmbeddings } = require('../services/huggingface');
const { connectDB } = require('../config/database');
const Doc = require('../models/Document'); // Importing the Document model
const { cosineSimilarity } = require('../utils/cosineSimilarity');
const chatmodel = require('../models/Chat');

let chathistory = [];

//  !!TODO : Implement the function to handle the user query seraches theoough the documentS..

exports.handler = async (req, res) => {
    try {
        const { query, chatId, modelType } = req.body;

        // Connect to MongoDB
        await connectDB();

        // Update chat history
        await chatmodel.findOneAndUpdate({ _id: chatId }, { $push: { messages: { role: 'user', content: query } } });
        chathistory = await chatmodel.findById(chatId).find({});

        // creating the chat history
        chathistory = chathistory[0].messages.map((chat) => ({
            role: chat.role,
            content: chat.content,
            modelType,
        }));

        // find the document by ID
        const file = await chatmodel.findById(chatId);
        const theDocument = await Doc.findById(file.documentId);

        const similarityResults = [];
        const queryEmb = await getEmbeddings(query);

        for (const file of theDocument.Files) {
            for (const chunk of file.Chunks) {
                const similarity = cosineSimilarity(queryEmb, chunk.embeddings);
                similarityResults.push({ chunk, similarity });
            }
        }

        // choosing top three chunks with the highest similarity
        similarityResults.sort((a, b) => b.similarity - a.similarity);
        let contextsTopSimilarityChunks = similarityResults.slice(0, 5).map((result) => result.chunk);
        contextsTopSimilarityChunks = contextsTopSimilarityChunks.map((chunk) => chunk.rawText);

        // Build the prompt
        const languageResponse = 'English'; // Default output language is English
        const promptStart = `Answer the question based on the context below only and answer in details
                             with ${languageResponse}:\n\n`;
        const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`;
        const prompt = `${promptStart} ${contextsTopSimilarityChunks} ${promptEnd}`;

        chathistory.push({ role: 'user', content: prompt });

        // Get completion from the model

        // get the response from the model based on the model specified
        const response = await getCompletion(prompt, modelType);

        console.log(response);

        // Update chatmodel
        await chatmodel.findOneAndUpdate(
            { _id: chatId },
            { $push: { messages: { role: 'assistant', content: response } } }
        );

        // Return the response
        res.status(200).json({ response: response, topchunks: contextsTopSimilarityChunks, similarityResults });
    } catch (error) {
        res.json({ error: error.message });
    }
};
