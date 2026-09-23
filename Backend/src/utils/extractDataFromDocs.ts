import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { textAndImage } from '../services/gemini';
import { getFileBuffer } from '../services/aws';

export interface ExtractedChunk {
    chunk: string;
    pageNumber: number | null;
    fileName: string;
}

export const splitTextIntoChunks = (text: string, chunkSize: number = 512, chunkOverlap: number = 50): string[] => {
    if (!text || text.trim().length === 0) return [];

    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
        const endIndex = Math.min(startIndex + chunkSize, text.length);
        const chunk = text.slice(startIndex, endIndex).trim();

        if (chunk.length > 0) {
            chunks.push(chunk);
        }

        if (endIndex >= text.length) break;
        startIndex += chunkSize - chunkOverlap;
    }

    return chunks;
};

export const isImageFile = (fileName: string): boolean => {
    return /\.(png|jpg|jpeg|gif|svg|bmp|tiff|webp)$/i.test(fileName);
};

export const processImageFile = async (fileName: string, fileUrl: string): Promise<ExtractedChunk[]> => {
    let text = '\n[Start of Image Page]\n';
    const generatedContent = await textAndImage([fileUrl]);
    text += generatedContent;
    text += '\n[End of Image Page]';

    const match = fileName.match(/image(\d+)/i);
    const pageNumber = match ? parseInt(match[1], 10) : null;

    return [
        {
            pageNumber,
            chunk: text,
            fileName,
        },
    ];
};

export const processDocumentFile = async (fileName: string, fileKey: string): Promise<ExtractedChunk[]> => {
    const buffer = await getFileBuffer(fileKey);
    const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

    let fullText: string;
    const chunksWithPage: ExtractedChunk[] = [];

    if (ext === '.pdf') {
        const pdfData = await pdfParse(buffer);
        fullText = pdfData.text || '';
    } else if (ext === '.docx' || ext === '.doc') {
        const docxData = await mammoth.extractRawText({ buffer });
        fullText = docxData.value || '';
    } else if (ext === '.txt') {
        fullText = buffer.toString('utf-8');
    } else if (ext === '.csv') {
        fullText = buffer.toString('utf-8');
    } else {
        throw new Error(`Unsupported document extension: ${ext}`);
    }

    fullText = fullText.replace(/\r\n/g, '\n').trim();

    if (fullText.length > 600) {
        const splitChunks = splitTextIntoChunks(fullText, 512, 50);
        splitChunks.forEach((chunk) => {
            chunksWithPage.push({
                pageNumber: null,
                chunk,
                fileName,
            });
        });
    } else if (fullText.length > 0) {
        chunksWithPage.push({
            pageNumber: null,
            chunk: fullText,
            fileName,
        });
    }

    return chunksWithPage;
};

export const convertDocToChunks = async (
    fileName: string,
    fileUrl: string,
    fileKey: string
): Promise<ExtractedChunk[]> => {
    if (isImageFile(fileName)) {
        return await processImageFile(fileName, fileUrl);
    } else {
        return await processDocumentFile(fileName, fileKey);
    }
};

export default {
    convertDocToChunks,
    isImageFile,
    splitTextIntoChunks,
};
