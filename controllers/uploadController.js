const { connectDB } = require('../config/database');
const Doc = require('../models/document');
const slugify = require('slugify');
const { uploadFile, uploadFolder } = require('../services/aws');
const chatModel = require('../models/Chat');
const AppError = require('../utils/appError');

exports.fileUpload = async (req, res, next) => {
    try {
        const file = req.file;
        const currUser = req.user;

        await connectDB();

        const dataLocation = await uploadFile(file.originalname, file.buffer, file.mimetype);

        const myFile = new Doc({
            FileName: file.originalname,
            Files: [
                {
                    FileName: file.originalname,
                    FileKey: file.originalname,
                    FileURL: dataLocation,
                },
            ],
        });

        await myFile.save();

        const chat = new chatModel({
            documentId: myFile._id,
            chatName: slugify(file.originalname),
        });

        await chat.save();

        currUser.uploadRequest += 1;
        currUser.chats.push(chat._id);
        await currUser.save();

        return res.status(200).json({
            message: 'File uploaded to S3 and MongoDB successfully',
            chatId: chat._id,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};

exports.folderUpload = async (req, res, next) => {
    try {
        const currUser = req.user;
        const files = req.files;
        let { folderName } = req.body;

        if (req.method !== 'POST') {
            return next(new AppError(`Method ${req.method} not supported`, 400));
        }

        await connectDB();

        if (!folderName) {
            folderName = 'default5569';
        }

        const dataLocation = await uploadFolder(files, folderName);

        const folder = new Doc({
            FileName: folderName,
            Files: files.map((file) => ({
                FileName: file.originalname,
                FileKey: file.originalname,
                FileURL: dataLocation[files.indexOf(file)],
            })),
        });

        await folder.save().catch((err) => {
            console.error(err);
            return next(new AppError('Error saving folder to MongoDB', 500));
        });

        const chat = new chatModel({
            documentId: folder._id,
            chatName: slugify(folderName),
        });

        await chat.save().catch((err) => {
            console.error(err);
            return next(new AppError('Error saving chat to MongoDB', 500));
        });

        currUser.uploadRequest += files.length;
        currUser.chats.push(chat._id);
        await currUser.save();

        return res.status(200).json({
            message: 'Folder uploaded to S3 and MongoDB successfully',
            chatId: chat._id,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
};
