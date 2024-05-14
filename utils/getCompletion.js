const { getCompletionfromOpenAI } = require('../services/openAi');
const { textAndImage } = require('../services/gemini');
const { textOnly } = require('../services/gemini');

exports.getCompletion = async (prompt, modelType) => {

    if (modelType === 'openai') {
        return getCompletionfromOpenAI(prompt);

    } else if (modelType === 'gemini-text') {
        return textOnly(prompt);

    } else if (modelType === 'gemini-text-image') {
        return textAndImage(prompt);

    } else {
        return { Error: 'Invalid model type' };
    }
};
