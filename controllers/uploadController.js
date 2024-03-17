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

    await connectDB().catch((err) => {
        console.error(err);
        return next(new AppError('Error connecting to MongoDB', 500));
    });

    try {
        if (req.method !== 'POST') {
            return next(new AppError(`Method ${req.method} not supported`, 400));
        }

        const dataLocation = await uploadFile(file.originalname, file.buffer, file.mimetype);

        session.startTransaction(session.defaultTransactionOptions);

        const myFile = new Doc([
            {
                FileName: file.originalname,
                Files: [
                    {
                        FileName: file.originalname,
                        FileKey: file.originalname,
                        FileURL: dataLocation,
                    },
                ],
            },
            {
                session: session,
            },
        ]);

        // await myFile.save();

        const chat = new chatModel({
            documentId: myFile._id,
            chatName: slugify(file.originalnam),
        });

        // await chat.save();

        const user = new User(
            [
                {
                    uploadRequest: currUser.uploadRequest + 1,
                    chats: currUser.chats.push(chat._id),
                },
            ],
            {
                session: session,
            }
        );

        // await user.save();

        await session.commitTransaction();

        return res.status(200).json({
            message: 'File uploaded to S3 and MongoDB successfully',
            chatId: chat._id,
        });
    } catch (err) {
        await session.abortTransaction();
    }
});

exports.folderUpload = catchAsync(async (req, res, next) => {
    const session = await Mongoose.startSession();
    const currUser = req.user;
    const files = req.files;
    let { folderName } = req.body;

    await connectDB().catch((err) => {
        console.error(err);
        return next(new AppError('Error connecting to MongoDB', 500));
    });

    try {
        if (req.method !== 'POST') {
            return next(new AppError(`Method ${req.method} not supported`, 400));
        }

        if (!folderName) {
            folderName = 'default5569';
        }

        session.startTransaction(session.defaultTransactionOptions);

        const dataLocation = await uploadFolder(files, folderName);

        const folder = new Doc([
            {
                FileName: folderName,
                Files: files.map((file) => ({
                    FileName: file.originalname,
                    FileKey: file.originalname,
                    FileURL: dataLocation[files.indexOf(file)],
                })),
            },
            {
                session: session,
            },
        ]);

        // await folder.save().catch((err) => {
        //     console.error(err);
        //     return next(new AppError('Error saving folder to MongoDB', 500));
        // });

        const chat = new chatModel(
            [
                {
                    documentId: folder._id,
                    chatName: slugify(folderName),
                },
            ],
            {
                session: session,
            }
        );

        // await chat.save().catch((err) => {
        //     console.error(err);
        //     return next(new AppError('Error saving chat to MongoDB', 500));
        // });

        const user = new User(
            [
                {
                    uploadRequest: currUser.uploadRequest + files.length,
                    chats: currUser.chats.push(chat._id),
                },
            ],
            {
                session: session,
            }
        );

        await session.commitTransaction();

        return res.status(200).json({
            status: 'success',
            message: 'Folder uploaded to S3 and MongoDB successfully',
            chatId: chat._id,
        });
    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        return next(new AppError('Error uploading folder', 500));
    }
});
