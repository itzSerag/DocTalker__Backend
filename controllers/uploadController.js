const { connectDB } = require('../config/database');
const Doc = require('../models/Document');
const slugify = require('slugify');
const { uploadFile, uploadFolder } = require('../services/aws');
const chatModel = require('../models/Chat');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Mongoose = require('mongoose');

exports.fileUpload = catchAsync(async (req, res, next) => {
    let session;

    try {
        session = await Mongoose.startSession();
        session.startTransaction(session.defaultTransactionOptions);

        const file = req.file;
        const currUser = req.user;

        await connectDB();

        const filerWithUserId = currUser._id.toString() + '/';

        const dataLocation = await uploadFile(file.originalname, file.buffer, file.mimetype, filerWithUserId);
        const myFile = new Doc({
            FileName: file.originalname,
            Files: [
                {
                    FileName: file.originalname,
                    FileURL: dataLocation.Location,
                    FileKey: dataLocation.Key,
                },
            ],
        });

        await myFile.save({ session });

        const chat = new chatModel({
            documentId: myFile._id,
            chatName: slugify(file.originalname),
        });

        await chat.save({ session });

        currUser.uploadRequest += 1;
        currUser.chats.push(chat._id);

        await currUser.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            message: 'File uploaded to S3 and MongoDB successfully',
            chatId: chat._id,
        });
    } catch (err) {
        await session.abortTransaction();
        return next(new AppError(err.message, 400));
    } finally {
        session.endSession();
    }
});

exports.folderUpload = catchAsync(async (req, res, next) => {
    let session;
    try {
        session = await Mongoose.startSession();
        session.startTransaction(session.defaultTransactionOptions);

        let { folderName } = req.body;
        const files = req.files;
        const currUser = req.user;

        await connectDB();

        if (!folderName) {
            folderName = 'default5569/';
        }
        const uploadFolderNameWithUserId = currUser._id.toString();

        const [Locations, Keys] = await uploadFolder(files, uploadFolderNameWithUserId, folderName);

        console.log(Keys, Locations);

        const folder = new Doc({
            FileName: folderName,
            Files: files.map((file) => ({
                FileName: file.originalname,
                FileKey: Keys[0][files.indexOf(file)],
                FileURL: Locations[0][files.indexOf(file)],
            })),
        });

        await folder.save({ session });

        const chat = new chatModel({
            documentId: folder._id,
            chatName: slugify(folderName),
        });

        await chat.save({ session });

        currUser.uploadRequest += files.length;
        currUser.chats.push(chat._id);

        await currUser.save({ session });

        await session.commitTransaction();

        return res.status(200).json({
            status: 'success',
            message: 'Folder uploaded to S3 and MongoDB successfully',
            chatId: chat._id,
        });
    } catch (err) {
        await session.abortTransaction();
        return next(new AppError(err.message, 400));
    } finally {
        session.endSession();
    }
});
