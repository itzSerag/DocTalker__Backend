// -- Gemini has two services we can use
// 1- Text Only Model
// 2- Text and array Image Model

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { HarmBlockThreshold, HarmCategory } = require('@google/generative-ai');
const { processImages } = require('../utils/processImages');

// ?? We can put these on a separate file but its fine for now

const config = {
    gemini: {
        textOnlyModel: 'gemini-pro',
        textAndImageModel: 'gemini-pro-vision',
        apiKey: process.env.GEMINI_API_KEY,

        // Gemini Safety Settings
        // Explore all Harm categories here -> https://ai.google.dev/api/rest/v1beta/HarmCategory
        // Explore all threshold categories -> https://ai.google.dev/docs/safety_setting_gemini

        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT, 
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
        ],
    },
};

const genAI = new GoogleGenerativeAI(config.gemini.apiKey);

// This function is used for a text only model of Gemini AI
exports.textOnly = async (prompt) => {
    const model = genAI.getGenerativeModel({
        model: config.gemini.textOnlyModel,
        safetySettings: config.gemini.safetySettings,
    });

    // prompt is a single string
    try {
        const result = await model.generateContent(prompt);

        return result.response.text()
    } catch (error) {
        console.error('textOnly | error', error);
        return { Error: 'Caught error while fetching AI response' };
    }
};

exports.textAndImage = async (images) => {
    const model = genAI.getGenerativeModel({
        model: config.gemini.textAndImageModel,
        safetySettings: config.gemini.safetySettings,
    });

    // prompt is a single string
    // imageParts is an array containing base64 strings of images

    let imageParts = await processImages(images);

    try {
        const result = await model.generateContent([(prompt = ''), ...imageParts]);
        const chatResponse = result?.response?.text();

        return chatResponse; // String
    } catch (error) {
        console.error('textAndImage | error', error);
        return { Error: 'Uh oh! Caught error while fetching AI response' };
    }
};