import { Request, Response, NextFunction } from 'express';
import slugify from 'slugify';
import DocumentModel from '../models/Document';
import Chat from '../models/Chat';
import { uploadFile, uploadFolder } from '../services/aws';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

// Handle single file upload
export const fileUpload = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const currUser = req.user;

    if (!currUser) {
        return next(new AppError('User not authenticated', 401));
    }

    if (!file) {
        return next(new AppError('Please upload a file', 400));
    }

    const userFolder = `${currUser._id}/`;
    const uploadResult = await uploadFile(file.originalname, file.buffer, file.mimetype, userFolder);

    const documentDoc = new DocumentModel({
        FileName: file.originalname,
        Files: [
            {
                FileName: file.originalname,
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
        chatName: slugify(file.originalname, { lower: true, strict: true }) || 'New Chat',
    });

    await chat.save();

    currUser.uploadRequest += 1;
    currUser.chats.push(chat._id as any);
    await currUser.save();

    return res.status(200).json({
        status: 'success',
        message: 'File uploaded successfully',
        chatId: chat._id,
        documentId: documentDoc._id,
    });
});

// Handle folder / multi-file upload
export const folderUpload = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const currUser = req.user;

    if (!currUser) {
        return next(new AppError('User not authenticated', 401));
    }

    const files = (req.files as Express.Multer.File[]) || [];
    if (!files || files.length === 0) {
        return next(new AppError('No files uploaded', 400));
    }

    const folderName = req.body.folderName || `folder_${Date.now()}`;
    const { locations, keys } = await uploadFolder(files, currUser._id.toString(), folderName);

    const documentDoc = new DocumentModel({
        FileName: folderName,
        Files: files.map((file, idx) => ({
            FileName: file.originalname,
            FileKey: keys[idx],
            FileURL: locations[idx],
            Chunks: [],
            isProcessed: false,
        })),
        isProcessed: false,
    });

    await documentDoc.save();

    const chat = new Chat({
        documentId: documentDoc._id,
        chatName: slugify(folderName, { lower: true, strict: true }) || 'New Folder Chat',
    });

    await chat.save();

    currUser.uploadRequest += files.length;
    currUser.chats.push(chat._id as any);
    await currUser.save();

    return res.status(200).json({
        status: 'success',
        message: 'Folder uploaded successfully',
        chatId: chat._id,
        documentId: documentDoc._id,
    });
});

export default { fileUpload, folderUpload };
