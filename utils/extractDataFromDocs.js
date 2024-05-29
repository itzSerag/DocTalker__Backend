const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const {S3Loader} = require('langchain/document_loaders/web/s3');
const {PDFLoader} = require('langchain/document_loaders/fs/pdf');
const {DocxLoader} = require('langchain/document_loaders/fs/docx');
const {TextLoader} = require('langchain/document_loaders/fs/text');

const { textAndImage } = require('../services/gemini');



// !! ADD IT TO CONFIG FILE
const splitter = new RecursiveCharacterTextSplitter({
    chunkOverlap: 50,
    chunkSize : 512,

});

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
        const match = FileName.match(/image(\d+)/);

        let documentContent = [{
            pageNumber: match ? parseInt(match[1]) : null,
            chunk: text,
        }]

        console.log(documentContent);

        return documentContent
        

    } else {
    

        const loader = createLoader(FileName, FileKey, s3Config);

        if (!loader) {
            throw new Error('Unsupported file type');
        }

        const documents = await loader.load();
        console.log('Documents ::: ' + documents[0].metadata);
        const chunksWithPageNumber = [];

        for (const document of documents) {
            const pageContent = document.pageContent;

            if (pageContent === undefined) {
                // this is a document that has no text content
                continue;
            }
            
            let pageNumber = 0

            try{
            pageNumber = document.metadata.loc.pageNumber
            }catch(e){
                pageNumber = 0
            }

            // supposing 800 is max of one chunk

            if (pageContent.trim().length > 800)
            {
                const chunks = await splitter.splitText(pageContent);
                chunks.forEach(chunk => {
                    chunksWithPageNumber.push({
                        pageNumber: pageNumber,
                        chunk: chunk,
                    });
                });
            } else {
                chunksWithPageNumber.push({
                    pageNumber: pageNumber,
                    chunk: pageContent,
                });
            }
        }

        // i want to return the chunks with the page number and the documents name as array with it
        // so that i can use the page number to get the page number of the document


        return chunksWithPageNumbe;
    }

   

}




    
// Helper :


function createLoader(FileName, FileKey, s3Config) {
    let loader;
    const KEY = FileKey;

    if (FileName.endsWith('.pdf')) {
        loader = new S3Loader({
            bucket: process.env.AWS_BUCKET_NAME,
            key: KEY,
            s3Config: s3Config,
            UnstructuredLoader: PDFLoader,
        });
    } else if (FileName.endsWith('.docx')) {
        loader = new S3Loader({
            bucket: process.env.AWS_BUCKET_NAME,
            key: KEY,
            s3Config: s3Config,
            UnstructuredLoader: DocxLoader,
        });
    } else if (FileName.endsWith('.txt')) {
        loader = new S3Loader({
            bucket: process.env.AWS_BUCKET_NAME,
            key: KEY,
            s3Config: s3Config,
            UnstructuredLoader: TextLoader,
        });
    }

    return loader;
}