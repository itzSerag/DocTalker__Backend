import axios from 'axios';
import mime from 'mime-types';

export interface GenerativePart {
  inlineData: {
    data: string;
    mimeType: string;
  };
}

export const urlToGenerativePart = async (url: string): Promise<GenerativePart | null> => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000,
    });

    const rawHeader = response.headers['content-type'];
    const headerMime = typeof rawHeader === 'string' ? rawHeader : undefined;
    const lookupResult = mime.lookup(url);
    const detectedMime = typeof lookupResult === 'string' ? lookupResult : 'image/png';
    const mimeType: string =
      headerMime && headerMime.startsWith('image/') ? headerMime : detectedMime;

    if (!mimeType || !mimeType.startsWith('image/')) {
      console.error('processImages | Unsupported image MIME type:', mimeType);
      return null;
    }

    const base64Data = Buffer.from(response.data).toString('base64');

    return {
      inlineData: {
        data: base64Data,
        mimeType,
      },
    };
  } catch (error: any) {
    console.error('processImages | Error fetching image from URL:', error.message);
    return null;
  }
};

export const processImages = async (images: string[]): Promise<GenerativePart[]> => {
  try {
    const parts = await Promise.all(images.map((img) => urlToGenerativePart(img)));
    return parts.filter((part): part is GenerativePart => part !== null);
  } catch (error: any) {
    console.error('processImages | Error:', error.message);
    return [];
  }
};

export default { processImages, urlToGenerativePart };
