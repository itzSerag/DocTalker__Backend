const { connectDB } = require('../config/database');
const Doc = require('../models/document');
const slugify = require('slugify');
const { uploadFile, uploadFolder } = require('../services/aws');
const chatModel = require('../models/Chat');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Mongoose = require('mongoose');
const User = require('../models/user');

exports.fileUpload = catchAsync(async (req, res, next) => {
    const session = await Mongoose.startSession();
    const file = req.file;
    const currUser = req.user;

    try {
        if (req.method !== 'POST') {
            return next(new AppError(`Method ${req.method} not supported`, 400));
        }

        await connectDB().catch((err) => {
            console.error(err);
            throw new AppError('Error connecting to MongoDB', 500);
        });

        const dataLocation = await uploadFile(file.originalname, file.buffer, file.mimetype);

        session.startTransaction(session.defaultTransactionOptions);

        const myFile = await Doc.create([
            {
                FileName: file.originalname,
                Files: [
                    {
                        FileName: file.originalname,
                        FileKey: file.originalname,
                        FileURL: dataLocation,
                    },
                ],
            }],
            {
                session: session,
                new: true,
            }
        );

        const chat = await chatModel.create([
            {
                documentId: myFile[0]._id,
                chatName: slugify(file.originalname),
            }],
            {
                session: session,
                new: true,
            }
        );

        const user = await User.findOneAndUpdate(
            { _id: currUser._id },
            {
                $inc: { uploadRequest: 1 }, // Increment uploadRequest by 1
                $push: { chats: chat._id }, // Push chat id to chats array
            },
            {
                session: session,
                new: true,
            }
        );

        await session.commitTransaction();

        return res.status(200).json({
            status: 'success',
            message: 'File uploaded to S3 and MongoDB successfully',
            chatId: chat[0]._id,
        });
    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        return next(new AppError('Error uploading file', 500));
    }
});

exports.folderUpload = catchAsync(async (req, res, next) => {
    const session = await Mongoose.startSession();
    const currUser = req.user;
    const files = req.files;
    let { folderName } = req.body;

    if (req.method !== 'POST') {
        return next(new AppError(`Method ${req.method} not supported`, 400));
    }

    if (!folderName) {
        folderName = 'default5569';
    }

    await connectDB().catch((err) => {
        console.error(err);
        return next(new AppError('Error connecting to MongoDB', 500));
    });

    try {
        // *      -- NOTE : every model model is array of one element now *  //

        console.log('folderName: ' + folderName);
        console.log('files: ' + files);
        session.startTransaction(session.defaultTransactionOptions);

        const dataLocation = await uploadFolder(files, folderName);

        const folder = await Doc.create(
            [
                {
                    FileName: folderName,
                    Files: files.map((file) => ({
                        FileName: file.originalname,
                        FileKey: file.originalname,
                        FileURL: dataLocation[files.indexOf(file)],
                    })),
                },
            ],
            {
                session: session,
            }
        );

        console.log(folder);

        // await folder.save().catch((err) => {
        //     console.error(err);
        //     return next(new AppError('Error saving folder to MongoDB', 500));
        // });

        const chat = await chatModel.create(
            [
                {
                    documentId: folder[0]._id,
                    chatName: slugify(folderName),
                },
            ],
            {
                session: session,
                new: true,
            }
        );

        console.log(chat);

        // await chat.save().catch((err) => {
        //     console.error(err);
        //     return next(new AppError('Error saving chat to MongoDB', 500));
        // });

        // With this block
        const user = await User.findOneAndUpdate(
            { _id: currUser._id },
            {
                $inc: { uploadRequest: files.length }, // Increment uploadRequest
                $push: { chats: chat[0]._id },
            },
            {
                session: session,
                new: true,
            }
        );

        console.log('chat id :' + chat[0]._id);
        await session.commitTransaction();

        return res.status(200).json({
            status: 'success',
            message: 'Folder uploaded to S3 and MongoDB successfully',
            chatId: chat[0]._id || 'undefined -- error',
        });
    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        return next(new AppError('Error uploading folder', 500));
    }
});
