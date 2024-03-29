const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const pdfParse = require('pdf-parse');
const minify = require('string-minify');
const mammoth = require('mammoth');
const { log } = require('console');
const fetch = require('node-fetch');
const { textAndImage } = require('../services/gemini');

exports.convertDocToChunks = async (FileName, FileUrl) => {
    // GET THEM FROM DB

    log('FileName ::: ' + FileName + ' FileUrl ::: ' + FileUrl);

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 512,
        chunkOverlap: 50,
    });

    let documentContent;
    const myFileUrlString = FileName;

    if (FileName.endsWith('.png' || '.jpg' || '.jpeg' || '.gif' || '.svg' || '.bmp' || '.tiff' || '.webp')) {
        // work with the array of url
        // extract the data from the gemini text by passing the array of url
        // return the text in the image
        const fileUrl = [];
        fileUrl.push(FileUrl);
        let text = 'This is a start of page';

        const generatedContent = await textAndImage(fileUrl);

        log('generatedContent ::: ' + generatedContent);
        text += generatedContent.result;

        text += 'This is the end of page';

        console.log('text ::: ' + text);

        documentContent = text;
    }

    else if (FileUrl.startsWith('handwritten')) {
        // extract the data from the gemini text by passing the array of url
        // return the text in the image

        const text = 'This is a start of page';
        text += await textAndImage(FileUrl);
        text += 'This is the end of page';

        documentContent = text;
    }

    else if (myFileUrlString.endsWith('.pdf')) {
        // For PDF files
        const pdfData = await fetch(FileUrl);
        const buffer = await pdfData.arrayBuffer();

        // extract text from pdf
        const pdfText = await pdfParse(buffer);
        documentContent = pdfText.text;

        // TODO : ADD MORE FILE TYPES
    } else if (FileUrl.endsWith('.docx')) {
        // For Word documents (.docx)
        const docxData = await fetch(FileUrl);
        const buffer = await docxData.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        documentContent = result.value;

        // TXT FILES
    } else if (FileUrl.endsWith('.txt')) {
        // For plain text files
        const txtData = await fetch(FileUrl);
        documentContent = await txtData.text();
    } else{
        // For other file types
        return NULL;
    }

    // Minify the text
    documentContent = minify(documentContent);

    // Split the text into chunks
    const chunks = await splitter.splitText(documentContent);

    return chunks;
};
