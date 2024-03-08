// models/openaiModel.js

const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

exports.getCompletion = async (prombet) => {
    try {
        const config = {
            model: 'gpt-3.5-turbo',
            stream: true,
            messages: prombet,
        };
        const completion = await openai.chat.completions.create(config);
        const response = completion.map((chunk) => chunk.choices[0].delta.content).join('');
        return response;
    } catch (error) {
        throw new Error('Failed to get chat completion from OpenAI');
    }
};
