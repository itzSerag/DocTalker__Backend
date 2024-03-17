const webScraper = require('../utils/webScrapper');
const youtubeTrans = require('../utils/youtubeExtraction');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const fs = require('fs');
const { uploadFile } = require('../services/aws');
const Document = require('../models/Document');
const chatModel = require('../models/Chat');
const slugify = require('slugify');



const makeTextFile = (text, fileName) => {
    const filePath = `./temp/${fileName + '_'}${Date.now()}.txt`;
    fs.writeFileSync(filePath, text, 'utf-8');
    const originalFileName = fileName + '_' + Date.now() + '.txt';

    return {
        filePath: filePath,
        fileName: originalFileName,
    };
};

const uploadTxtFileToS3 = (fileInfoObj) => {
    return new Promise(async (resolve, reject) => {
        const fileName = fileInfoObj.fileName;
        const filePath = fileInfoObj.filePath;

        console.log('fileName ::: ' + fileName);

        try {
            // Read file asynchronously
            const file = await readFileAsync(filePath);

            // Upload file to S3
            const AWSUrl = await uploadFile(fileName, file, 'text/plain');

            console.log('AWS URL ::: ' + AWSUrl);

            fs.unlinkSync(filePath);

            resolve(AWSUrl);
        } catch (err) {
            // Handle errors
            console.error('Error:', err);
            reject(err);
        }
    });
};

exports.extractContent = catchAsync(async (req, res, next) => {
    if (!req.body.url) return next(new AppError('Please provide a URL', 400));

    const { url } = req.body;
    const currUser = req.user; // Assuming req.user contains the current user information

    let text, fileName, fileInfo, filePath, dataLocation;

    if (isYoutubeURL(url)) {
        // If it's a YouTube URL, extract transcript
        const transcript = await youtubeTrans.extractTranscript(url);
        text = transcript;
        fileInfo = makeTextFile(transcript, 'youtube');

        fileName = fileInfo.fileName;
    } else {
        // If it's not a YouTube URL, scrape webpage
        text = await webScraper.scrapeWebpage(url);
        fileInfo = makeTextFile(text, 'webpage');

        fileName = fileInfo.fileName;
    }

    dataLocation = await uploadTxtFileToS3(fileInfo);

    const fileNameWithoutTimestamp = extractFileName(fileName);

    const myFile = new Document({
        FileName: fileInfo.fileName,
        Files: [
            {
                FileName: fileInfo.fileName,
                FileKey: fileInfo.fileName,
                FileURL: dataLocation,
            },
        ],
    });

    await myFile.save();

    const chat = new chatModel({
        documentId: myFile._id,
        chatName: slugify(fileNameWithoutTimestamp),
    });

    await chat.save();

    currUser.uploadRequest += 1;
    currUser.chats.push(chat._id);

    await currUser.save();

    res.status(200).json({
        message: 'File uploaded to S3 and MongoDB successfully',
        chatId: chat._id,
    });
});

function isYoutubeURL(url) {
    // Check if the URL contains 'youtube.com'
    return url.includes('youtube.com');
}

function extractFileName(fullFileName) {
    // Split the full file name by underscores
    const parts = fullFileName.split('_');

    // Remove the last part (timestamp) and rejoin the remaining parts
    const fileNameWithoutTimestamp = parts.slice(0, -1).join('_');

    return fileNameWithoutTimestamp;
}
