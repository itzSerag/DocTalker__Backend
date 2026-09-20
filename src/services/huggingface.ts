import { HfInference } from '@huggingface/inference';

let hfClient: HfInference;

const getHfClient = (): HfInference => {
  if (!hfClient) {
    hfClient = new HfInference(process.env.HUGGING_FACE_KEY || '');
  }
  return hfClient;
};

const DEFAULT_EMBEDDING_MODEL =
  process.env.HUGGINGFACE_EMBEDDING_MODEL ||
  'sentence-transformers/all-MiniLM-L6-v2';

/**
 * Returns a 1D vector of embeddings for a single text or an array of vectors for multiple texts.
 */
export const getEmbeddings = async (
  content: string | string[]
): Promise<number[] | number[][]> => {
  const hf = getHfClient();

  if (typeof content === 'string') {
    const output = await hf.featureExtraction({
      model: DEFAULT_EMBEDDING_MODEL,
      inputs: content,
    });
    // In @huggingface/inference, single input output can be number[] or number[][]
    if (Array.isArray(output) && Array.isArray(output[0])) {
      return (output as number[][])[0];
    }
    return output as number[];
  } else if (Array.isArray(content)) {
    const results: number[][] = [];
    for (const text of content) {
      const output = await hf.featureExtraction({
        model: DEFAULT_EMBEDDING_MODEL,
        inputs: text,
      });
      if (Array.isArray(output) && Array.isArray(output[0])) {
        results.push((output as number[][])[0]);
      } else {
        results.push(output as number[]);
      }
    }
    return results;
  } else {
    throw new Error('Invalid input type. Expected string or array of strings.');
  }
};

export default { getEmbeddings };
