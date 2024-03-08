const { getCompletion } = require('../services/openAi');
const { getEmbeddings } = require('../services/huggingface');
const { connectDB } = require('../config/database');
const Doc = require('../models/document');
const chatModel = require('../models/Chat');
const userModel = require('../models/user');
const { cosineSimilarity } = require('../utils/cosineSimilarity');

exports.handler = async (req, res) => {
    try {
        await connectDB();
        const { _id: userId } = req.user;
        const { query, id } = req.body;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(400).json({ message: 'user not found' });
        }

        const chats = user.chats;
        if (!chats.includes(id)) {
            return res.status(400).json({ message: 'unauthorized' });
        }

        const chat = await chatModel.findById(id);
        let chunks = await Doc.findById(chat.documentId).select('Chunks -_id');
        chunks = chunks.Chunks;
        const questionEmb = await getEmbeddings(query);
        const similarityResults = [];
        chunks.forEach((chunk) => {
            const similarity = cosineSimilarity(questionEmb, chunk.embeddings);
            similarityResults.push({ chunk, similarity });
        });

        similarityResults.sort((a, b) => b.similarity - a.similarity);
        let topThree = similarityResults.slice(0, 3).map((result) => result.chunk.rawText);

        const languageResponse = 'English';
        const promptStart = `    You are a chatbot for extracted data from documents.
                                 Answer the question based only 
                                on the context below with ${languageResponse}:\n\n
                                and dont use any other information\n\n
                            `;

        const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`;

        const prompt = `${promptStart} ${topThree.join('\n')} ${promptEnd}`;
        let chatHistory = chat.messages.map((message) => {
            return { role: message.role, content: message.content };
        });
        chatHistory.push({ role: 'user', content: prompt });
        let response = await getCompletion(chatHistory);
        response = response.choices[0].message;
        if (!response) {
            return res.status(400).json({ message: 'error' });
        }

        //Push the query and response to the chatModel
        chat.messages.push({ role: 'user', content: query });
        chat.messages.push(response);
        await chat.save();
        return res.status(200).json({ response });
    } catch (error) {
        console.log(error.message);
        return res.json({ error: error.message });
    }
};
