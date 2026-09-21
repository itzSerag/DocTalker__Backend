import axios from 'axios';
import { pdfToPng } from 'pdf-to-png-converter';

/**
 * Downloads a PDF from an S3 URL and converts each page into a PNG Buffer.
 */
export const generateImagesFromS3Doc = async (s3DocUrl: string): Promise<Buffer[]> => {
    try {
        const response = await axios.get(s3DocUrl, {
            responseType: 'arraybuffer',
            timeout: 30000,
        });

        const pdfBuffer = Buffer.from(response.data);
        const pngPages = await pdfToPng(pdfBuffer, {
            viewportScale: 2.0,
        });

        return pngPages.map((page) => page.content).filter((buf): buf is Buffer => Buffer.isBuffer(buf));
    } catch (error: any) {
        console.error('Error generating images from PDF document:', error.message);
        throw error;
    }
};

export default { generateImagesFromS3Doc };
