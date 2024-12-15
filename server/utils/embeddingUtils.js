function cosineSimilarity(A, B) {

    if (A.length !== B.length) {
        throw new Error('Vectors must be of same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < A.length; i++) {
        dotProduct += A[i] * B[i];
        normA += A[i] * A[i];
        normB += B[i] * B[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
        return 0;
    }

    const similarity = dotProduct / (normA * normB);
    
    return similarity * 100;
}

module.exports = { cosineSimilarity };
