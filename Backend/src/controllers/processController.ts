import { Request, Response, NextFunction } from 'express';
import DocumentModel from '../models/Document';
import Chat from '../models/Chat';
import { convertDocToChunks } from '../utils/extractDataFromDocs';
import { getEmbeddings } from '../services/huggingface';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export const handler = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { chatId } = req.body;

    if (!chatId) {
        return next(new AppError('chatId is required in request body', 400));
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        return next(new AppError('Chat not found', 404));
    }

    const document = await DocumentModel.findById(chat.documentId);
    if (!document) {
        return next(new AppError('Document associated with this chat was not found', 404));
    }

    if (document.isProcessed) {
        return res.status(200).json({
            status: 'success',
            message: 'Document has already been processed',
            chatId: chat._id,
        });
    }

    // Process all files in the document
    for (const file of document.Files) {
        try {
            const chunks = await convertDocToChunks(file.FileName, file.FileURL, file.FileKey);

            const vectors: any[] = [];
            for (const chunk of chunks) {
                if (!chunk.chunk || chunk.chunk.trim().length === 0) continue;

                const embedding = await getEmbeddings(chunk.chunk);
                vectors.push({
                    rawText: chunk.chunk,
                    embeddings: embedding as number[],
                    pageNumber: chunk.pageNumber || null,
                    fileName: chunk.fileName,
                });
            }

            file.Chunks = vectors;
            file.isProcessed = true;
        } catch (error: any) {
            console.error(`Error processing file ${file.FileName}:`, error.message);
            return next(new AppError(`Error processing file ${file.FileName}: ${error.message}`, 500));
        }
    }

    document.isProcessed = true;
    await document.save();

    chat.isProcessed = true;
    chat.chatName = document.FileName;
    await chat.save();

    return res.status(200).json({
        status: 'success',
        message: 'Document processed and embeddings generated successfully',
        chatId: chat._id,
    });
});

export default { handler };
