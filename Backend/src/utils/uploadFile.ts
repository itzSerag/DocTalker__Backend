import multer from 'multer';

// Use memory storage so file buffers can be directly streamed to S3
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB limit
    },
});

export default upload;
