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

    if (!req.user || !req.user.chats.some((userChatId) => userChatId.toString() === String(chatId))) {
        return next(new AppError('Chat not found or access denied', 404));
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

            const readableChunks = chunks.filter((chunk) => chunk.chunk?.trim());
            const vectors: any[] = [];
            // Keep a small concurrency cap: avoid slow one-request-at-a-time
            // ingestion without flooding the embedding provider on large files.
            for (let index = 0; index < readableChunks.length; index += 4) {
                const batch = readableChunks.slice(index, index + 4);
                const embeddings = await Promise.all(batch.map((chunk) => getEmbeddings(chunk.chunk)));
                batch.forEach((chunk, batchIndex) => {
                    const embedding = embeddings[batchIndex];
                    if (!Array.isArray(embedding) || embedding.length === 0 || Array.isArray(embedding[0])) {
                        throw new Error('Embedding service returned an invalid vector');
                    }
                    vectors.push({
                        rawText: chunk.chunk,
                        embeddings: embedding as number[],
                        pageNumber: chunk.pageNumber || null,
                        fileName: chunk.fileName,
                    });
                });
            }

            file.Chunks = vectors;
            file.isProcessed = true;
        } catch (error: any) {
            console.error(`Error processing file ${file.FileName}:`, error.message);
            return next(new AppError(`Error processing file ${file.FileName}: ${error.message}`, 500));
        }
    }

    if (document.Files.some((file) => file.Chunks.length === 0)) {
        return next(new AppError('No readable text could be extracted from one or more files in this source.', 422));
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
