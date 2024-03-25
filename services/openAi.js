const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const OPEN_AI_COMPLETION_MODEL = 'gpt-3.5-turbo';

exports.getCompletion = async (prompt) => {
    const completion = await openai.chat.completions.create({
        model: OPEN_AI_COMPLETION_MODEL,
        temperature: 0.5,
        max_tokens: 500,
        messages: prompt,
    });

    console.log(completion.choices[0].message);

    return completion.choices[0].message.content;
};
