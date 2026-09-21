import { getCompletionFromOpenAI } from '../services/openAi';
import { textOnly, textAndImage } from '../services/gemini';
import AppError from './appError';

export const getCompletion = async (prompt: any, modelType: string): Promise<string> => {
    if (modelType === 'openai') {
        return await getCompletionFromOpenAI(prompt);
    } else if (modelType === 'gemini-text') {
        const textPrompt = typeof prompt === 'string' ? prompt : JSON.stringify(prompt);
        return await textOnly(textPrompt);
    } else if (modelType === 'gemini-text-image') {
        if (Array.isArray(prompt)) {
            return await textAndImage(prompt);
        }
        throw new AppError('Images must be provided as an array of URLs for gemini-text-image', 400);
    } else {
        throw new AppError(`Unsupported model type: ${modelType}`, 400);
    }
};

export default { getCompletion };
