/**
 * Computes the cosine similarity between two numeric vectors.
 * Returns a value between -1.0 and 1.0 (or 0 if magnitude is 0).
 */
export const cosineSimilarity = (vecA: number[], vecB: number[]): number => {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
        return 0;
    }

    const length = Math.min(vecA.length, vecB.length);
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) {
        return 0;
    }

    return dotProduct / denominator;
};

export default cosineSimilarity;
