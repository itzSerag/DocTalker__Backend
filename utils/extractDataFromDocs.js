const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const {S3Loader} = require('langchain/document_loaders/web/s3');
const {PDFLoader} = require('langchain/document_loaders/fs/pdf');
const {DocxLoader} = require('langchain/document_loaders/fs/docx');
const {TextLoader} = require('langchain/document_loaders/fs/text');

const { textAndImage } = require('../services/gemini');



// !! ADD IT TO CONFIG FILE
const s3Config = {
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  };





exports.convertDocToChunks = async (FileName , FileUrl , FileKey) => {
    // GET THEM FROM DB

    console.log('FileName ::: ' + FileName + ' FileUrl ::: ' + FileUrl );


    let documentContent;


    if (FileName.endsWith('.png' || '.jpg' || '.jpeg' || '.gif' || '.svg' || '.bmp' || '.tiff' || '.webp')) {
        // work with the array of url
        // extract the data from the gemini text by passing the array of url
        // return the text in the image
        const fileUrl = [];
        fileUrl.push(FileUrl);
        let text = '\nThis is a start of page\n';

        const generatedContent = await textAndImage(fileUrl);

        text += generatedContent;

        text += '\nThis is the end of page';

        documentContent = text;
        console.log('final text :::::::::::: \n' + documentContent);


    } else if (FileName.startsWith('handwritten')) {
        // extract the data from the gemini text by passing the array of url
        // return the text in the image

        const text = 'This is a start of page';
        text += (await textAndImage(FileUrl)).toString;
        text += 'This is the end of page';

        documentContent = text;

    } else {
    

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 512,
            chunkOverlap: 50,
        });


        let loader;
        const KEY = FileKey;

    

        let docType = null;



        if (FileName.endsWith('.pdf')) {
           

            loader = new S3Loader({
                bucket: process.env.AWS_BUCKET_NAME,
                key: KEY,
                s3Config: s3Config,

            UnstructuredLoader: PDFLoader,
            });

            
            const documents = await loader.load();
            const chunksWithPageNumber = [];

            for (const document of documents) {
                const pageContent = document.pageContent; // Get the page content(text)
                const pageNumber = document.metadata.loc.pageNumber; // Get the page number


                if (pageContent.trim().length > 1600) {
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
            }

            return chunksWithPageNumber

        }

        if (FileName.endsWith('.docx')) {

            docType = 'docx';
            loader = new S3Loader({
                bucket: process.env.AWS_BUCKET_NAME,
                key: KEY,
                s3Config: s3Config,

            UnstructuredLoader: DocxLoader,
            });
        }

        if (FileName.endsWith('.txt')) {

            docType = 'txt';
            loader = new S3Loader({
                bucket: process.env.AWS_BUCKET_NAME,
                key: KEY,
                s3Config: s3Config,
            UnstructuredLoader: TextLoader,
            });
        }

        if (FileName.endsWith('txt') || FileName.endsWith('docx') ){

            const documents = await loader.load();
            const chunks = splitter.splitText(documents.pageContent);

            return chunks;
        }
    }
}




//     for (const document of documents) {
//         const pageContent = document.pageContent;
        
//         // Check if the document is a PDF
//         if (docType === 'pdf') {
//             const pageNumber = document.metadata.loc.pageNumber; // Get the page number
            
//             if (pageContent.trim().length > 1600) {
//                 // split the page into chunks
//                 const chunks = await splitter.splitText(pageContent);
                
            
//                 // add each chunk with its page number to the array
//                 for (const chunk of chunks) {

//                     chunksWithPageNumber.push({
//                         pageNumber: pageNumber, // Add the page number or null
//                         chunk: chunk,
//                     });
//                 }
//             } else {
//                 // add the page content as one chunk with its page number
//                 chunksWithPageNumber.push({
//                     pageNumber: pageNumber, // Add the page number or null
//                     chunk: pageContent,
//                 });
//             }
        
//         } else {
//             // add the page content as one chunk with its page number
//             const chunks = await splitter.splitText(pageContent);
//             return chunks;
//         }
           
//     }
    
//     return chunksWithPageNumber;
// }
    


    
