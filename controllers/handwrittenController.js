const { uploadFile } = require('../services/aws');
const { generateImagesFromS3Pdf } = require('../utils/pdfToImages');
const Doc = require('../models/Document');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');

exports.uploadHandwrittenPDF = async (req, res, next) => {
    try {
        // Validate incoming request payload
        const file = req.file;
        const currUser = req.user;
        const session = await mongoose.startSession();

        if (!file || !file.buffer || !file.originalname || !file.mimetype) {
            return res.status(400).json({ error: 'Invalid file upload' });
        }

        // Generate unique folder name
        const folderName = `handwritten_${file.originalname}_${Date.now()}`;
        const filerWithUserId = currUser._id.toString() + '/' + folderName + '/';
        const imageFolderWithinPdf = filerWithUserId + 'images/';

        // Upload the PDF to S3
        const dataLocation = await uploadFile(file.originalname, file.buffer, file.mimetype, filerWithUserId);

        // Generate images from the uploaded PDF
        const ArrayImagesBody = await generateImagesFromS3Pdf(dataLocation);

        // Upload images to S3
        const ArrayImages = [];
        for (const image of ArrayImagesBody) {
            const fileName = `${file.originalname} image${ArrayImagesBody.indexOf(image) + 1}`;
            const fileKey = `${file.originalname} image${ArrayImagesBody.indexOf(image) + 1}`;
            const fileURL = await uploadFile(fileName, image, 'image/png', imageFolderWithinPdf);
            ArrayImages.push({ FileName: fileName, FileKey: fileKey, FileURL: fileURL });
        }

        session.startTransaction();

        // Save document information to the database
        const folder = new Doc({
            FileName: folderName,
            Files: ArrayImages.map((file) => ({
                FileName: file.FileName + '.png',
                FileKey: file.FileKey + '.png',
                FileURL: file.FileURL,
            })),
        });

        await folder.save({ session });

        // Create a chat entry for the document
        const chat = new Chat({
            documentId: folder._id,
            chatName: folderName, // Assuming the chat name is the same as the document name
        });
        await chat.save({ session });

        // Update user upload count
        currUser.uploadRequest += ArrayImages.length;
        await currUser.save({ session });

        session.commitTransaction();

        // Send success response
        res.status(200).json({
            status: 'success',
            message: 'handWritten PDF Uploaded successful',
            chatId: chat._id,
        });
    } catch (error) {
        console.error('Error uploading handwritten PDF:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        session.endSession();
    }
};

exports.uploadHandwrittenPic = async (req, res, next) => {
    // Future implementation
    res.status(501).json({ message: 'Not Implemented' });
};
