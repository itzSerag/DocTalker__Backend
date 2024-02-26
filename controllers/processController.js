const DocumentModel = require("../models/document");
const chatmodel = require("../models/Chat");
const { connectDB } = require("../config/database");
const { convertDocToChunks } = require("../utils/extractDataFromDocs");
const { getEmbeddings } = require("../services/huggingface");



exports.handler = async (req, res) => {
  // 1. Check for POST call
  if (req.method !== "POST") {
    return res.status(400).json({ message: "HTTP method not allowed" });
  }

  try {
    // 2. Connect to MongoDB
    await connectDB();

    // 3. Get chat IDs from the request body -- its MAY an array now
    const { chatIds } = req.body;

    if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
      return res.status(400).json({ message: "Chat IDs are required as an array" });
    }


    // 4. Process files for each chat ID
    for (const chatId of chatIds) {
      const chat = await chatmodel.findById(chatId);

      if (!chat) {
        console.log(`Chat with ID ${chatId} not found`);
        continue; // Skip to the next chat ID
      }

      const myFile = await DocumentModel.findById(chat.documentId);

      


      if (!myFile) {
        console.log(`File associated with chat ID ${chatId} not found`);
        continue; // Skip to the next chat ID
      }

      console.log("myFile :", myFile);

      // 5. Check if the file is already processed
      if (myFile.isProcessed) {
        console.log(`File associated with chat ID ${chatId} is already processed`);
        continue; // Skip to the next chat ID
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

      console.log(`File associated with chat ID ${chatId} processed successfully`);
    }

    return res.status(200).json({ message: "Files processed and uploaded to MongoDB successfully" });
  } catch (error) {
    console.error("Error processing files:", error);
    return res.status(500).json({ message: error.message });
  }
};
