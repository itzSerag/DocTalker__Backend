import { Request, Response, NextFunction } from 'express';
import { uploadFile } from '../services/aws';
import { generateImagesFromS3Doc } from '../utils/pdfToImages';
import DocumentModel from '../models/Document';
import Chat from '../models/Chat';
import AppError from '../utils/appError';
import catchAsync from '../utils/catchAsync';

export const uploadHandwrittenPDF = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    const currUser = req.user;

    if (!currUser) {
      return next(new AppError('User not authenticated', 401));
    }

    if (!file || !file.buffer || !file.originalname) {
      return next(new AppError('Invalid or missing file upload', 400));
    }

    const folderName = `handwritten_${file.originalname}_${Date.now()}`;
    const userFolder = `${currUser._id}/${folderName}/`;
    const imageFolderWithinPdf = `${userFolder}images/`;

    // Upload the original PDF
    const dataLocation = await uploadFile(
      file.originalname,
      file.buffer,
      file.mimetype,
      userFolder
    );

    // Convert PDF pages to image buffers
    let arrayImagesBody: Buffer[] = [];
    try {
      arrayImagesBody = await generateImagesFromS3Doc(dataLocation.Location);
    } catch (err: any) {
      console.warn('Warning: Could not convert PDF to images via S3 URL:', err.message);
    }

    const arrayImages: { FileName: string; FileKey: string; FileURL: string }[] = [];

    // The primary PDF file
    arrayImages.push({
      FileName: file.originalname,
      FileKey: dataLocation.Key,
      FileURL: dataLocation.Location,
    });

    // Upload each page image
    for (let i = 0; i < arrayImagesBody.length; i++) {
      const pageImage = arrayImagesBody[i];
      const pageFileName = `${file.originalname}_page_${i + 1}.png`;
      const uploadedImage = await uploadFile(
        pageFileName,
        pageImage,
        'image/png',
        imageFolderWithinPdf
      );

      arrayImages.push({
        FileName: pageFileName,
        FileKey: uploadedImage.Key,
        FileURL: uploadedImage.Location,
      });
    }

    const documentDoc = new DocumentModel({
      FileName: folderName,
      Files: arrayImages.map((f) => ({
        FileName: f.FileName,
        FileKey: f.FileKey,
        FileURL: f.FileURL,
        Chunks: [],
        isProcessed: false,
      })),
      isProcessed: false,
    });

    await documentDoc.save();

    const chat = new Chat({
      documentId: documentDoc._id,
      chatName: folderName,
    });

    await chat.save();

    currUser.uploadRequest += arrayImages.length;
    currUser.chats.push(chat._id as any);
    await currUser.save();

    return res.status(200).json({
      status: 'success',
      message: 'Handwritten PDF uploaded and processed successfully',
      chatId: chat._id,
      documentId: documentDoc._id,
    });
  }
);

export const uploadHandwrittenPic = (
  _req: Request,
  res: Response
): void => {
  res.status(501).json({ status: 'fail', message: 'Not Implemented yet' });
};

export default { uploadHandwrittenPDF, uploadHandwrittenPic };
