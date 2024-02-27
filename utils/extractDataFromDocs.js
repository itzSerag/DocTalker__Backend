const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const pdfParse = require('pdf-parse');
const minify = require("string-minify");



exports.convertDocToChunks = async (files) => {


  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 50,
  });

  const allChunks = [];

  for (const file of files) {
    const { FileName, FileUrl } = file;
    let documentContent;
    
    if (!FileUrl) {
      console.log(`File URL not provided for ${FileName}`);
      continue; // Skip this file if URL (format) is not provided
    }

    if (FileName.endsWith('.pdf')) {
      // For PDF files
      const pdfData = await fetch(FileUrl);
      const buffer = await pdfData.arrayBuffer();

      // Extract text from pdf
      const pdfText = await pdfParse(buffer);
      documentContent = pdfText.text;

      // Minify the text
      documentContent = minify(documentContent);
    } else if (FileName.endsWith('.docx')) {
      // For Word documents (.docx)
      const docxData = await fetch(FileUrl);
      const buffer = await docxData.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      documentContent = result.value;
    } else if (FileName.endsWith('.txt')) {
      // For plain text files
      const txtData = await fetch(FileUrl);
      documentContent = await txtData.text();
    } else {
      console.log(`Unsupported file type for ${FileName}`);
      continue; // Skip this file if the file type is unsupported
    }

    // Split the text into chunks
    const chunks = await splitter.splitText(documentContent);
    allChunks.push(...chunks);
  }

  return allChunks;
};

