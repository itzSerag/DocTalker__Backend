const { getCompletion } = require('../services/openAi');
const { getEmbeddings } = require('../services/huggingface');
const { connectDB } = require('../config/database');
const Doc = require('../models/Document'); // Importing the Document model
const { cosineSimilarity } = require('../utils/cosineSimilarity');
const chatmodel = require('../models/Chat');

let chathistory = [];

exports.handler = async (req, res) => {
    try {
        const { query, id } = req.body;

        // Connect to MongoDB
        await connectDB();

        // Update chat history
        await chatmodel.findOneAndUpdate({ _id: id }, { $push: { messages: { role: 'user', content: query } } });
        chathistory = await chatmodel.findById(id).find({});

        chathistory = chathistory[0].messages.map((chat) => ({
            role: chat.role,
            content: chat.content,
        }));

        // Query the document by ID
        const file = await chatmodel.findById(id);
        const theDocument = await Doc.findById(file.documentId);

        const similarityResults = [];
        for (let i = 0; i < theDocument.Files[0].Chunks.length; i++) {
            const chunk = theDocument.Files[0].Chunks[i];
            const similarity = cosineSimilarity(queryEmb, chunk.embeddings);
            similarityResults.push({ chunk, similarity });
        }

        similarityResults.sort((a, b) => b.similarity - a.similarity);
        let contextsTopSimilarityChunks = similarityResults.slice(0, 3).map((result) => result.chunk);
        contextsTopSimilarityChunks = contextsTopSimilarityChunks.map((chunk) => chunk.rawText);

        // Build the prompt
        const languageResponse = 'English'; // Default output language is English
        const promptStart = `Answer the question based on the context below with ${languageResponse}:\n\n`;
        const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`;
        const prompt = `${promptStart} ${contextsTopSimilarityChunks} ${promptEnd}`;

        chathistory.push({ role: 'user', content: prompt });

        // Get completion from OpenAI
        const response = await getCompletion(chathistory);

        // Update chatmodel
        await chatmodel.findOneAndUpdate(
            { _id: id },
            { $push: { messages: { role: 'assistant', content: response } } }
        );

        // Return the response
        res.status(200).json({ response: response, topchunks: contextsTopSimilarityChunks });
    } catch (error) {
        res.json({ error: error.message });
    }
};
