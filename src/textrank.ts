import { Tokenizer } from "./tokenizer.js";

/**
 * Implements the TextRank algorithm for ranking sentences by importance
 * TextRank is a graph-based ranking algorithm inspired by Google's PageRank
 */
export class TextRank {
    /** Damping factor used in the TextRank algorithm */
    private static DAMPING = 0.85;
    
    /** Maximum number of iterations for convergence */
    private static MAX_ITERATIONS = 50;
    
    /** Threshold for determining convergence */
    private static CONVERGENCE_THRESHOLD = 0.0001;
    
    /**
     * Calculates cosine similarity between two sentences
     * 
     * @param sentence1 - First sentence to compare
     * @param sentence2 - Second sentence to compare
     * @returns Similarity score between 0 and 1
     */
    public static calculateSimilarity(sentence1: string, sentence2: string): number {
        const words1 = new Set(Tokenizer.tokenizeWords(sentence1));
        const words2 = new Set(Tokenizer.tokenizeWords(sentence2));
        
        if (words1.size === 0 || words2.size === 0) return 0;
        
        const intersection = new Set([...words1].filter(word => words2.has(word)));
        
        return intersection.size / (Math.sqrt(words1.size) * Math.sqrt(words2.size));
    }
    
    /**
     * Builds a similarity matrix between all sentences
     * 
     * @param sentences - Array of sentences to compare
     * @returns Matrix of similarity scores
     */
    private static buildSimilarityMatrix(sentences: string[]): number[][] {
        const n = sentences.length;
        const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (i !== j) matrix[i][j] = this.calculateSimilarity(sentences[i], sentences[j]);
            }
        }
        
        return matrix;
    }
    
    /**
     * Ranks sentences by importance using the TextRank algorithm
     * 
     * @param sentences - Array of sentences to rank
     * @returns Array of importance scores (higher is more important)
     */
    static rankSentences(sentences: string[]): number[] {
        const n = sentences.length;
        if (n === 0) return [];
        if (n === 1) return [1];
        
        const similarityMatrix = this.buildSimilarityMatrix(sentences);
        
        const normalizedMatrix = similarityMatrix.map(row => {
            const sum = row.reduce((a, b) => a + b, 0);
            return sum === 0 ? row.map(() => 1/n) : row.map(val => val / sum);
        });
        
        let scores = Array(n).fill(1/n);
        let iteration = 0;
        let converged = false;
        
        while (!converged && iteration < this.MAX_ITERATIONS) {
            const newScores = Array(n).fill(0);
            
            for (let i = 0; i < n; i++) {
                for (let j = 0; j < n; j++) {
                    if (i !== j) {
                        newScores[i] += this.DAMPING * normalizedMatrix[j][i] * scores[j];
                    }
                }
                newScores[i] += (1 - this.DAMPING) / n;
            }
            
            const diff = Math.sqrt(
                scores.reduce((sum, score, idx) => 
                    sum + Math.pow(score - newScores[idx], 2), 0)
            );
            
            converged = diff < this.CONVERGENCE_THRESHOLD;
            scores = newScores;
            iteration++;
        }
        
        return scores;
    }
}