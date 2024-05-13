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
                content: 'what the weather today looks like',
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

    // deal with the final response
    // !! Long response  > 4096 tokens are not throwing an error but it the response is :
    // !!    It looks like you have entered a long list of words. Is there anything specific you would like help with or any information you need? Feel free to ask!

    res.end()
    
}
















// ###############################


exports.testWithAuth = (req, res) => {


    res.status(200).json({
        message: 'Test route with auth',

    });
}