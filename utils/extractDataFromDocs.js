const { RecursiveCharacterTextSplitter } = require('langchain/text_splitter');
const pdfParse = require('pdf-parse');
const minify = require('string-minify');
const mammoth = require('mammoth');
const { log } = require('console');
const fetch = require('node-fetch');

exports.convertDocToChunks = async (FileName, FileUrl) => {
    // GET THEM FROM DB

    log('FileName ::: ' + FileName + ' FileUrl ::: ' + FileUrl);

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 512,
        chunkOverlap: 50,
    });

    let documentContent;
    const myFileUrlString = FileName;

    if (myFileUrlString.endsWith('.pdf')) {
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
    } else if (FileUrl.endsWith('.png' || '.jpg' || '.jpeg' || '.gif' || '.svg' || '.bmp' || '.tiff' || '.webp')) {
        // TODO : ADD MORE FILE TYPES
        // extract using google lens and put in in txt file
        return NULL;
    } else {
        // Unsupported file type

        // TODO : ADD A FUNCTION TO EXTRACT TEXT FROM WEBSITES
        return NULL;
    }

    // Minify the text
    documentContent = minify(documentContent);

    // Split the text into chunks
    const chunks = await splitter.splitText(documentContent);

    return chunks;
};
