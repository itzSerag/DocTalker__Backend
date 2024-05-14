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
    

        const loader = createLoader(FileName, FileKey, s3Config);

        if (!loader) {
            throw new Error('Unsupported file type');
        }

        const documents = await loader.load();
        const chunksWithPageNumber = [];

        for (const document of documents) {
            const pageContent = document.pageContent;
            const pageNumber = document.metadata.loc.pageNumber;


            // supposing 800 is max of one chunk

            if (pageContent.trim().length > 800) {
                const chunks = await splitter.splitText(pageContent);
                chunks.forEach(chunk => {
                    chunksWithPageNumber.push({
                        pageNumber: pageNumber || null,
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

        return chunksWithPageNumber;
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