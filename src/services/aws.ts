import {
  DeleteObjectCommand,
  ListObjectsCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Readable } from 'stream';
import { s3 } from '../config/s3';

export interface UploadResult {
  Location: string;
  Key: string;
}

export const createS3Folder = async (folderName: string): Promise<string> => {
  const bucket = process.env.AWS_BUCKET_NAME || '';
  const key = folderName.endsWith('/') ? folderName : `${folderName}/`;

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: bucket,
      Key: key,
      Body: '',
    },
  });

  const data = await upload.done();
  return data.Location || '';
};

export const uploadFile = async (
  fileKey: string,
  fileBody: Buffer | Uint8Array | string,
  fileType: string = 'application/octet-stream',
  folderName: string = ''
): Promise<UploadResult> => {
  let normalizedFolder = folderName;
  if (normalizedFolder !== '' && !normalizedFolder.endsWith('/')) {
    normalizedFolder += '/';
  }

  const finalKey = `${normalizedFolder}${fileKey}`;
  const bucket = process.env.AWS_BUCKET_NAME || '';

  const upload = new Upload({
    client: s3,
    params: {
      Bucket: bucket,
      Key: finalKey,
      Body: fileBody,
      ContentType: fileType,
    },
  });

  const data = await upload.done();

  return {
    Location: data.Location || '',
    Key: data.Key || finalKey,
  };
};

export const deleteFile = async (fileKey: string) => {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME || '',
    Key: fileKey,
  });

  const response = await s3.send(command);
  return response.DeleteMarker;
};

export const listAllObjects = async (bucket: string, prefix: string) => {
  const command = new ListObjectsCommand({
    Bucket: bucket,
    Prefix: prefix,
  });

  return await s3.send(command);
};

export const getFileBuffer = async (fileKey: string): Promise<Buffer> => {
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME || '',
    Key: fileKey,
  });

  const response = await s3.send(command);
  const stream = response.Body as Readable;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

export const uploadFolder = async (
  files: Express.Multer.File[],
  userID: string,
  folderName: string
): Promise<{ locations: string[]; keys: string[] }> => {
  const folderPath = `${userID}/${folderName}/`;
  const locations: string[] = [];
  const keys: string[] = [];

  for (const file of files) {
    const uploaded = await uploadFile(
      file.originalname,
      file.buffer,
      file.mimetype,
      folderPath
    );
    locations.push(uploaded.Location);
    keys.push(uploaded.Key);
  }

  return { locations, keys };
};

export default {
  createS3Folder,
  uploadFile,
  deleteFile,
  listAllObjects,
  getFileBuffer,
  uploadFolder,
};
