const { connectDB } = require('../config/database');
const Doc = require('../models/document');
const slugify = require('slugify');
const { uploadFile, uploadFolder } = require('../services/aws');
const { deleteFile } = require('../services/aws');
const chatModel = require('../models/Chat');
const { isOkayToUpload } = require('../utils/isOkayUser');
const { isUserFree } = require('../utils/isOkayUser');
const AppError = require('../utils/appError');

exports.fileUpload = async (req, res, next) => {
  const file = req.file;
  const currUser = req.user;
  if (!file) {
    return next(new AppError('Please upload a file', 400));
  }
  try {
    await connectDB().then(() => {
      console.log('db conntected in upload phase');
    });
    const dataLocation = await uploadFile(
      file.originalname,
      file.buffer,
      file.mimetype
    );
    const myFile = new Doc({
      FileName: file.originalname,
      Files: {
        FileName: file.originalname,
        FileKey: file.originalname,
        FileURL: dataLocation,
      },
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

                            currUser.save();
                            return res.status(200).json({
                                message: 'File uploaded to S3 and MongoDB successfully',
                                chatId: chat._id,
                            });
                        })
                        .catch((err) => {
                            res.status(500).json({ message: err.message });
                        });
                })
                .catch((err) => {
                    console.log('file faild to save on mongo db', err);
                });
            // await disconnectDB()
        }
    } // end else
};

//////////////
////////////////

exports.folderUpload = async (req, res, next) => {

  const currUser = req.user;
  const files = req.files;
  let { folderName } = req.body;
  const freeUser = await isUserFree(req, res);

  if (folderName === undefined) {
    folderName = 'default5569';
  }

  if (freeUser) {
    return next(new AppError('Only Premimum & Gold Users are allowed.', 400));
  }

  if (req.method !== 'POST') {
    return next(new AppError(`method ${req.method} not supported`, 400));
  }

  if (!isOkayToUpload(req, res)) {
    return next(new AppError('You have exceeded your upload limit', 400));
  } else {
    await connectDB().then(() => {
      console.log('db conntected in upload phase');
    });

    // Check if the file object exists
    if (!files || Object.keys(req.files).length === 0) {
      return next(new AppError('Please upload the files', 400));

    const currUser = req.user;
    const files = req.files;

    let { folderName } = req.body;

    console.log(folderName + '  folder name');
    const freeUser = await isUserFree(req, res);

    if (folderName === undefined) {
        folderName = 'default5569';
    }

    if (freeUser) {
        return next(new AppError('Only Premimum & Gold Users are allowed.', 400));

    }

    // 4. upload the file to s3
    const dataLocation = await uploadFolder(files, folderName);

    // 7. save file info to the mongodb db

    const folder = new Doc({
      FileName: folderName,
      Files: files.map((file, index) => ({
        FileName: file.originalname,
        FileKey: file.originalname,
        FileURL: dataLocation[index],
      })),
      // aws file url
    });

    await folder
      .save()
      .then(() => {
        console.log('file info successfully saved in mongo db');
        const chat = new chatModel({
          documentId: folder._id,
          chatName: slugify(folderName),
        });
        console.log(chat);

        chat
          .save()
          .then(() => {
            console.log('chat info successfully saved in mongo db');
            // Increse the upload request for the user
            // add the length of files to the upload request
            currUser.uploadRequest += files.length;
            currUser.chats.push(chat._id);

            currUser.save();
            return res.status(200).json({
              message: 'File uploaded to S3 and MongoDB successfully',
              chatId: chat._id,
            });
          })
          .catch((err) => {
            res.status(500).json({ message: err.message });
          });
      })
      .catch((err) => {
        console.log('file faild to save on mongo db', err);
      });
    // await disconnectDB()
  } // end else
};
