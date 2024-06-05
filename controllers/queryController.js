const { getCompletion } = require('../utils/getCompletion');
const { getEmbeddings } = require('../services/huggingface');
const { connectDB } = require('../config/database');
const Doc = require('../models/Document'); // Importing the Document model
const { cosineSimilarity } = require('../utils/cosineSimilarity');
const chatmodel = require('../models/Chat');

let chathistory = [];

exports.handler = async (req, res) => {
    try {
        
        const { query, chatId, modelType } = req.body;

        await connectDB();

        // Update chat history and retrieve updated history
        await chatmodel.findOneAndUpdate({ _id: chatId }, { $push: { messages: { role: 'user', content: query } } });
        const updatedChat = await chatmodel.findById(chatId);
        const chathistory = updatedChat.messages.map((chat) => ({ role: chat.role, content: chat.content, modelType }));

        // Find the document by ID
        const file = await chatmodel.findById(chatId);
        const theDocument = await Doc.findById(file.documentId);

        // Calculate similarity between query and chunks
        const similarityResults = [];
        const queryEmb = await getEmbeddings(query);

        for (const file of theDocument.Files) {
            for (const chunk of file.Chunks) {
                const similarity = cosineSimilarity(queryEmb, chunk.embeddings);
                similarityResults.push({ chunk, similarity });
            }
        }

        // Choose top three chunks with highest similarity
        similarityResults.sort((a, b) => b.similarity - a.similarity);

        // return that top 3 chunks with the page number
        const contextsTopSimilarityChunks = similarityResults.slice(0, 5).map((result) => ({
            rawText: result.chunk.rawText,
            pageNumber: result.chunk.pageNumber
        }));
        
        // thats what we pass to prompet
        const rawTexts = contextsTopSimilarityChunks.map(chunk => chunk.rawText).join(' ');

        

        // Build the prompt
        const promptStart = `Answer the question based on the context below ONLY ,
                            NEVER ANSWER SOMETHING NOT IN CONTEXT ,
                            and answer in detail:\n\n`;
        const promptEnd = `\n\nQuestion: ${query} `;
        const prompt = `${promptStart} ${rawTexts} ${promptEnd}`;

        console.log('Prompt:', prompt);

        chathistory.push({ role: 'user', content: prompt });

        // Get completion from the model
        let response;

        if (modelType === 'openai') {
            response = await getCompletion(chathistory, modelType);
        } else if (modelType === 'gemini-text') {
            response = await getCompletion(prompt, modelType);
        } else {
            throw new Error('Invalid model type');
        }

        // Update chat model with assistant response
        await chatmodel.findOneAndUpdate({ _id: chatId }, { $push: { messages: { role: 'assistant', content: response } } });

        // Return the response
        res.status(200).json({ 
            response,
            // return each chunk with the page number
            topchunks: contextsTopSimilarityChunks ,
        
         });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
