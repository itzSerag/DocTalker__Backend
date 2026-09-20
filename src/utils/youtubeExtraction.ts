import { YoutubeTranscript } from 'youtube-transcript';
import AppError from './appError';

export const extractTranscript = async (url: string): Promise<string> => {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);

    if (!transcript || transcript.length === 0) {
      throw new AppError('No transcript found for this video', 404);
    }

    const text = transcript.map((item) => item.text).join(' ');
    return text;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    console.error('Error fetching YouTube transcript:', error.message);
    throw new AppError(`Failed to fetch YouTube transcript: ${error.message}`, 400);
  }
};

export default { extractTranscript };
