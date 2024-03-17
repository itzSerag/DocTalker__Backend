const { getCompletion } = require('../services/openAi');
const { getEmbeddings } = require('../services/huggingface');
const { connectDB } = require('../config/database');
const Doc = require('../models/Document');
const chatModel = require('../models/Chat');
const userModel = require('../models/User');
const { cosineSimilarity } = require('../utils/cosineSimilarity');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.handler = catchAsync(async (req, res, next) => {
    await connectDB();
    const { query, chatId } = req.body;

    const user = req.user;

    const chats = user.chats;
    if (!chats.includes(chatId)) {
        return res.status(400).json({ message: 'unauthorized' });
    }

    const chat = await chatModel.findById(chatId);

    let theDocument = await Doc.findById(chat.documentId);

    console.log(theDocument);

    const questionEmb = await getEmbeddings(query);
    const similarityResults = [];

    theDocument.Files[0].Chunks.forEach((chunk) => {
        const similarity = cosineSimilarity(questionEmb, chunk.embeddings);
        similarityResults.push({ chunk, similarity });
    });

    similarityResults.sort((a, b) => b.similarity - a.similarity); // sort by similarity

    let topThree = similarityResults.slice(0, 3).map((result) => result.chunk.rawText);

    const languageResponse = 'English';
    const promptStart = `    You are a chatbot answring about extracted data from documents.
                                 Answer the question based ONLY 
                                on the context below in details with ${languageResponse}:\n\n
                                and dont use any other information\n here is the top 3 most relevant context  : \n\n
                            `;

    let chatHistory = chat.messages.map((message) => {
        return { role: message.role, content: message.content };
    });
    const promptEnd = `\n\nQuestion: ${query} \n\nAnswer:`;

    const prompt = `${promptStart} and here is the context of the previous meassages also :  ${topThree.join(
        '\n'
    )} ${promptEnd}`;

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
});
