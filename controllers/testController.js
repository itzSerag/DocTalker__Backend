const { OpenAI } = require('openai');
const {S3Loader} = require('langchain/document_loaders/web/s3');
const {PDFLoader} = require('langchain/document_loaders/fs/pdf');
const {DocxLoader} = require('langchain/document_loaders/fs/docx');
const {TextLoader} = require('langchain/document_loaders/fs/text');

const {RecursiveCharacterTextSplitter} = require('langchain/text_splitter');


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});



exports.test = async (req, res) => {


    // const completion = await openai.chat.completions.create({
    //     model: 'gpt-3.5-turbo',
    //     messages: [
    //         {
    //             role: 'system',
    //             content: 'You are a helpful assistant.',
    //         },
    //         {
    //             role: 'user',
    //             content: 'what the weather today looks like',
    //         },
    //     ],

    //     stream: true

    // });

    
    // let final_response = ''

    // const stream = completion

    // for await (const chunk of stream) {
    // console.log(chunk.choices[0].delta?.content)
    // res.write(chunk.choices[0]?.delta?.content || '')
    // final_response += chunk.choices[0]?.delta?.content || ''
    // }

    // // deal with the final response
    // // !! Long response  > 4096 tokens are not throwing an error but it the response is :
    // // !!    It looks like you have entered a long list of words. Is there anything specific you would like help with or any information you need? Feel free to ask!

    // res.end()
    
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 512,
        chunkOverlap: 50,
    });



    let loader;
    const KEY = "6642546f31de26f729de981b/sss.docx"

    const s3Config = {
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  };


    let docType = null;

    if (KEY.endsWith('.pdf')) {

        docType = 'pdf';

        loader = new S3Loader({
            bucket: process.env.AWS_BUCKET_NAME,
            key: KEY,
            s3Config: s3Config,

        UnstructuredLoader: PDFLoader,
        });




    }

    if (KEY.endsWith('.docx')) {

        docType = 'docx';
        loader = new S3Loader({
            bucket: process.env.AWS_BUCKET_NAME,
            key: KEY,
            s3Config: s3Config,

        UnstructuredLoader: DocxLoader,
        });
    }

    if (KEY.endsWith('.txt')) {

        docType = 'txt';
        loader = new S3Loader({
            bucket: process.env.AWS_BUCKET_NAME,
            key: KEY,
            s3Config: s3Config,
        UnstructuredLoader: TextLoader,
        });
    }


    const documents = await loader.load();
    const chunksWithPageNumber = [];


    for (const document of documents) {
        const pageContent = document.pageContent;
        let pageNumber = null; // Initialize pageNumber as null
        
        // Check if the document is a PDF
        if (docType === 'pdf') {
            pageNumber = document.metadata.loc.pageNumber; // Get the page number
            
            if (pageContent.length > 2000) {
                // split the page into chunks
                const chunks = await splitter.splitText(pageContent);
                
                

                // add each chunk with its page number to the array
                for (const chunk of chunks) {

                    chunksWithPageNumber.push({
                        pageNumber: pageNumber, // Add the page number or null
                        chunk: chunk,
                    });
                }
            } else {
                // add the page content as one chunk with its page number
                chunksWithPageNumber.push({
                    pageNumber: pageNumber, // Add the page number or null
                    chunk: pageContent,
                });
            }
        
        } else {
            // add the page content as one chunk with its page number
            const chunks = await splitter.splitText(pageContent);
            console.log(chunks);
            return chunks;
        }
           
    }
    
    return chunksWithPageNumber;
    
}

    
    


    // make each page is one chunk and if the page is too long > 2000 chars , split it into 3 chunks




// ###############################


exports.testWithAuth = (req, res) => {


    res.status(200).json({
        message: 'Test route with auth',

    });
}