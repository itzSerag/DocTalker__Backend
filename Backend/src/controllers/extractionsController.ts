import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import { scrapeWebpage } from '../utils/webScrapper';
import { extractTranscript } from '../utils/youtubeExtraction';
import { uploadFile } from '../services/aws';
import DocumentModel from '../models/Document';
import Chat from '../models/Chat';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

export const isYoutubeURL = (url: string): boolean => {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
};

export const extractContent = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { url } = req.body;
    const currUser = req.user;

    if (!currUser) {
        return next(new AppError('User not authenticated', 401));
    }

    if (!url || typeof url !== 'string') {
        return next(new AppError('Please provide a valid URL in request body', 400));
    }

    let text: string;
    let prefix: string;

    if (isYoutubeURL(url)) {
        text = await extractTranscript(url);
        prefix = 'youtube';
    } else {
        text = await scrapeWebpage(url);
        prefix = 'webpage';
    }

    const timestamp = Date.now();
    const fileName = `${prefix}_${timestamp}.txt`;
    const fileBuffer = Buffer.from(text, 'utf-8');
    const userFolder = `${currUser._id}/`;

    // Upload directly from memory to S3 (no temp disk files)
    const uploadResult = await uploadFile(fileName, fileBuffer, 'text/plain', userFolder);

    const documentDoc = new DocumentModel({
        FileName: fileName,
        Files: [
            {
                FileName: fileName,
                FileURL: uploadResult.Location,
                FileKey: uploadResult.Key,
                Chunks: [],
                isProcessed: false,
            },
        ],
        isProcessed: false,
    });

    await documentDoc.save();

    const chat = new Chat({
        documentId: documentDoc._id,
        chatName: slugify(`${prefix}_${timestamp}`, { lower: true, strict: true }),
    });

    await chat.save();

    currUser.uploadRequest += 1;
    currUser.chats.push(chat._id as any);
    await currUser.save();

    return res.status(200).json({
        status: 'success',
        message: 'Content extracted and uploaded to S3 and database successfully',
        chatId: chat._id,
        documentId: documentDoc._id,
    });
});

export default { extractContent };
