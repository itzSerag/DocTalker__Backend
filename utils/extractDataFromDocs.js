const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const { S3Loader } = require('langchain/document_loaders/web/s3');
const { PDFLoader } = require('langchain/document_loaders/fs/pdf');
const { DocxLoader } = require('langchain/document_loaders/fs/docx');
const { TextLoader } = require('langchain/document_loaders/fs/text');
const { textAndImage } = require('../services/gemini');
const s3Config = require('../config/s3Config');

const splitter = new RecursiveCharacterTextSplitter({
    chunkOverlap: 50,
    chunkSize: 512,
});

exports.convertDocToChunks = async (fileName, fileUrl, fileKey) => {
    console.log(`FileName: ${fileName} FileUrl: ${fileUrl}`);

    if (isImageFile(fileName)) {
        return await processImageFile(fileName, fileUrl);
    } else {
        return await processDocumentFile(fileName, fileKey, s3Config);
    }
};

// Helper functions:

function isImageFile(fileName) {
    return /\.(png|jpg|jpeg|gif|svg|bmp|tiff|webp)$/i.test(fileName);
}

async function processImageFile(fileName, fileUrl) {
    const fileUrls = [fileUrl];
    let text = '\nThis is a start of page\n';

    const generatedContent = await textAndImage(fileUrls);

    text += generatedContent;
    text += '\nThis is the end of page';

    const match = fileName.match(/image(\d+)/);

    return [
        {
            pageNumber: match ? parseInt(match[1]) : null,
            chunk: text,
        },
    ];
}

async function processDocumentFile(fileName, fileKey, s3Config) {
    const loader = createLoader(fileName, fileKey, s3Config);

    if (!loader) {
        throw new Error('Unsupported file type');
    }

    const documents = await loader.load();
    const chunksWithPageNumber = [];

    for (const document of documents) {
        const pageContent = document.pageContent;

        if (!pageContent) {
            continue;
        }

        const pageNumber = document.metadata?.loc?.pageNumber || 0;

        if (pageContent.trim().length > 600) {
            const chunks = await splitter.splitText(pageContent);
            chunks.forEach((chunk) => {
                chunksWithPageNumber.push({
                    pageNumber,
                    chunk,
                    fileName,
                });
            });
        } else {
            chunksWithPageNumber.push({
                pageNumber,
                chunk: pageContent,
                fileName,
            });
        }
    }

    return chunksWithPageNumber;
}

function createLoader(fileName, fileKey, s3Config) {
    const loaders = {
        '.pdf': PDFLoader,
        '.docx': DocxLoader,
        '.txt': TextLoader,
    };

    const extension = Object.keys(loaders).find((ext) => fileName.endsWith(ext));

    if (extension) {
        return new S3Loader({
            bucket: process.env.AWS_BUCKET_NAME,
            key: fileKey,
            s3Config: s3Config,
            UnstructuredLoader: loaders[extension],
        });
    }

    return null;
}
