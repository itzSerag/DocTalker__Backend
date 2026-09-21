import { S3Client } from '@aws-sdk/client-s3';

export const getS3Client = (): S3Client => {
    return new S3Client({
        region: process.env.AWS_BUCKET_REGION || 'us-east-1',
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        },
    });
};

export const s3 = getS3Client();

export default s3;
