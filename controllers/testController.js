const { OpenAI } = require('openai');


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



exports.test = async (req, res) => {

    const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'system',
                content: 'You are a helpful assistant.',
            },
            {
                role: 'user',
                content: 'What is the fastest car in the world? say in 500 words at least.',
            },
        ],

        stream: true

    });

    
    let final_response = ''

    const stream = completion

    for await (const chunk of stream) {
    console.log(chunk.choices[0].delta?.content)
    res.write(chunk.choices[0]?.delta?.content || '')
    final_response += chunk.choices[0]?.delta?.content || ''
    }

    res.end()
    
}
















// ###############################


exports.testWithAuth = (req, res) => {


    res.status(200).json({
        message: 'Test route with auth',

    });
}