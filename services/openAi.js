const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const OPEN_AI_COMPLETION_MODEL = 'gpt-3.5-turbo';

exports.getCompletionfromOpenAI = async (prompt) => {
    const completion = await openai.chat.completions.create({
        model: OPEN_AI_COMPLETION_MODEL,
        max_tokens: 500,
        messages: prompt,
        stream: false, 
    });

    console.log(completion.choices[0].message);

    return completion.choices[0].message.content;
};