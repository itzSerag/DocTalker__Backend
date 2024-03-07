const { connectDB } = require('../config/database');
const Doc = require('../models/document');
const slugify = require('slugify');
const { uploadFile } = require('../services/aws');
const chatmodel = require('../models/Chat');

const uploadSingleFile = async (req, res) => {
    try {
        // Connect to the MongoDB database
        await connectDB();
        console.log('MongoDB Connected -- uploading single file phase -- ');

        const file = req.file;
        const currUser = req.user;

        // Check if the file is a PDF
        if (file.mimetype !== 'application/pdf') {
            return res.status(400).json({ error: 'Only PDF files are allowed.' });
        }

        // Upload the file to S3
        const dataLocation = await uploadFile(file.originalname, file.buffer, file.mimetype);

        // Save file info to the MongoDB database
        const myFile = new Doc({
            FileName: file.originalname,
            FileUrl: [dataLocation], // Store the URL as an array
        });

        await myFile
            .save()
            .then(() => {
                const chat = new chatmodel({
                    documentId: myFile._id,
                    chatName: slugify(file.originalname),
                });

                chat.save()
                    .then(() => {
                        // Increase the upload request for the user
                        currUser.uploadRequest++;
                        currUser.chats.push(chat._id);
                        currUser.save();
                        return res.status(200).json({
                            message: 'File uploaded to S3 and MongoDB successfully',
                            chatId: chat._id,
                        });
                    })
                    .catch((err) => {
                        console.error('Error saving chat:', err);
                        return res.status(500).json({ message: err.message });
                    });
            })
            .catch((err) => {
                console.error('Error saving file:', err);
                return res.status(500).json({ message: err.message });
            });
    } catch (err) {
        console.error('Error uploading single file:', err);
        return res.status(500).json({ message: err.message });
    }
};

const uploadFolder = async (req, res) => {
    try {
        // Connect to the MongoDB database
        await connectDB();
        console.log('MongoDB Connected -- uploading folder phase -- ');

        // Iterate through the files and upload all of them to S3
        const files = req.files;
        const fileUrls = [];
        const currUser = req.user;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];

            if (
                file.mimetype === 'application/pdf' ||
                file.mimetype === 'application/msword' ||
                file.mimetype === 'text/plain'
            ) {
                const dataLocation = await uploadFile(file.originalname, file.buffer, file.mimetype);
                fileUrls.push(dataLocation);
            } else {
                continue;
            }

            // Save file info to the MongoDB database for each file
            const myFile = new Doc({
                FileName: file.originalname,
                FileUrl: [dataLocation],
            });

            await myFile
                .save()
                .then(() => {
                    const chat = new chatmodel({
                        documentId: myFile._id,
                        chatName: slugify(file.originalname),
                    });

                    chat.save()
                        .then(() => {
                            // Increase the upload request for the user
                            currUser.uploadRequest++;
                            currUser.save();
                        })
                        .catch((err) => {
                            console.error('Error saving chat:', err);
                        });
                })
                .catch((err) => {
                    console.error('Error saving file:', err);
                });
        }

        return res.status(200).json({
            message: 'Files uploaded to S3 and MongoDB successfully',
        });
    } catch (err) {
        console.error('Error uploading folder:', err);
        return res.status(500).json({ message: err.message });
    }
};

exports.handler = async (req, res) => {
    // Only allow POST methods
    if (req.method !== 'POST') {
        return res.status(400).send('Method not supported');
    }

    // the files are sent -- check the console
    console.log('files:', req.files);

    if (!req.user) {
        return res.status(400).json({ message: 'You are not logged or missing' });
    }

    const file = req.file;
    const files = req.files;
    const currUser = req.user;

    console.log('User:', currUser);
    // Check user's upload limit
    const isOkayToUpload = currUser.maxUploadRequest - currUser.uploadRequest > 0;
    const userAuth = currUser.subscription;

    if (!isOkayToUpload) {
        return res.status(400).json({ message: 'You have exceeded your upload limit' });
    } else {
        if (file) {
            // Upload single file
            return uploadSingleFile(req, res);


        } else if (files && userAuth !== 'free') {
            // Upload folder
            // Check the maximum files upload request and the quota of the user
            if (currUser.maxUploadRequest - currUser.uploadRequest < files.length) {
                return res.status(400).json({ message: 'You have exceeded your upload limit' });
            }

            // Max files in the folder is 5 -- for now
            if (files.length > 5) {
                return res.status(400).json({ message: 'You can only upload 5 files at a time' });
            }

            return uploadFolder(req, res);

            
        } else {
            return res.status(400).json({ message: 'No file uploaded' });
        }
    }
};
