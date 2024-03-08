const DocumentModel = require('../models/document');
const chatmodel = require('../models/Chat');
const { connectDB } = require('../config/database');
const { convertDocToChunks } = require('../utils/extractDataFromDocs');
const { getEmbeddings } = require('../services/huggingface');

exports.handler = async (req, res) => {
    // 1. Check for POST call
    if (req.method !== 'POST') {
        return res.status(400).json({ message: 'HTTP method not allowed' });
    }

    try {
        // 2. Connect to MongoDB
        await connectDB();

        // 3. Get chat IDs or file IDs from the request body
        let fileIds;
        if (Array.isArray(req.body.fileIds)) {
            fileIds = req.body.fileIds;
        } else if (typeof req.body.fileIds === 'string') {
            fileIds = [req.body.fileIds];
        } else {
            return res.status(400).json({ message: 'File IDs must be provided as a string or an array' });
        }

        // 4. Process each file
        for (const fileId of fileIds) {
            const myFile = await DocumentModel.findById(fileId);

            if (!myFile) {
                console.log(`File with ID ${fileId} not found`);
                continue; // Skip to the next file
            }

            // 5. Check if the file is already processed
            if (myFile.isProcessed) {
                console.log(`File with ID ${fileId} is already processed`);
                continue; // Skip to the next file
            }

            // 6. Chunk the text using RecursiveCharacterTextSplitter
            const chunks = await convertDocToChunks(myFile.FileName, myFile.FileUrl);

            // 7. Add the chunks to the database with the embeddings
            const vectors = [];
            for (const chunk of chunks) {
                const embedding = await getEmbeddings(chunk);
                vectors.push({
                    rawText: chunk,
                    embeddings: embedding,
                });
            }

            // 8. Update MongoDB with isProcessed set to true
            myFile.Chunks = vectors;
            myFile.isProcessed = true;
            await myFile.save();

            console.log(`File with ID ${fileId} processed successfully`);
        }

        return res.status(200).json({ message: 'Files processed and uploaded to MongoDB successfully' });
    } catch (error) {
        console.error('Error processing files:', error);
        return res.status(500).json({ message: error.message });
    }
};
