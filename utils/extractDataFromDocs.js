const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const minify = require('string-minify');
const mammoth = require('mammoth');
const { log } = require('console');
const fetch = require('node-fetch');
const { textAndImage } = require('../services/gemini');
const pdf2json = require('pdf2json');

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
        let text = '\nThis is a start of page\n';

        const generatedContent = await textAndImage(fileUrl);

        log('generatedContent ::: ' + generatedContent);
        text += generatedContent;

        text += '\nThis is the end of page';

        documentContent = text;

        console.log('final text :::::::::::: \n' + documentContent);
    } else if (myFileUrlString.endsWith('.pdf')) {
        // For PDF files
        const pdfData = await fetch(FileUrl);
        const buffer = await pdfData.arrayBuffer();

        // Extract text from pdf using pdf2json
        const pdfParser = new pdf2json();
        pdfParser.parseBuffer(buffer);
        const pdfText = pdfParser.getRawTextContent();
        documentContent = pdfText;

        log('pdfText ::: ' + documentContent);

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
    } else {
        // For other file types
        return null;
    }

    // Minify the text
    documentContent = minify(documentContent);

    // Split the text into chunks
    const chunks = await splitter.splitText(documentContent);

    return chunks;
};
