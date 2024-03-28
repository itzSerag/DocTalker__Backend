const { getCompletionFromOpenAI } = require('../services/openAi');
const { textAndImage } = require('../services/gemini');
const { textOnly } = require('../services/gemini');

exports.getCompletion = async (prompt, modelType) => {
    if (modelType === 'openai') {
        return getCompletionFromOpenAI(prompt);
    } else if (modelType === 'gemini-text-only') {
        return textOnly(prompt);
    } else if (modelType === 'gemini-text-image') {
        return textAndImage(prompt);
    } else {
        return { Error: 'Invalid model type' };
    }
};


