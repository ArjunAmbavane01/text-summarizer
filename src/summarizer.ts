import { TextRank } from "./textrank.js";
import { Tokenizer } from "./tokenizer.js";

/**
 * Represents a sentence with its metadata for scoring purposes
 */
interface SentenceWithMetadata {
    /** Original position in text */
    index: number;       
    /** Sentence text */
    text: string;        
    /** Original paragraph number */
    paragraph: number;   
    /** Word count */
    length: number;      
    /** Position score (favors intro/conclusion sentences) */
    position: number;    
}

/**
 * Main summarizer class that implements extractive summarization using 
 * TF-IDF, TextRank, position scoring, and length consideration
 */
export class Summarizer {

    /**
     * Calculates TF-IDF scores for words in a collection of sentences
     * 
     * @param sentences - Array of sentences to analyze
     * @returns Map of words to their TF-IDF scores
     */
    private static calculateTfIdf(sentences: string[]): Map<string, number> {
        const wordFrequency = new Map<string, number>();
        const documentFrequency = new Map<string, number>();
        const totalDocs = sentences.length;

        sentences.forEach(sentence => {
            const words = Tokenizer.tokenizeWords(sentence);
            const uniqueWords = Array.from(new Set(words));

            words.forEach(word => { wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1) });

            uniqueWords.forEach(word => { documentFrequency.set(word, (documentFrequency.get(word) || 0) + 1) });
        });

        const tfIdfScores = new Map<string, number>();
        wordFrequency.forEach((freq, word) => {
            const df = documentFrequency.get(word) || 1;
            const idf = Math.log(totalDocs / df);
            tfIdfScores.set(word, freq * idf);
        });

        return tfIdfScores;
    }

    /**
     * Scores sentences based on multiple factors:
     * - TF-IDF word importance
     * - TextRank graph-based importance
     * - Position in paragraph/document
     * - Sentence length
     * 
     * @param sentences - Array of sentences with metadata
     * @param tfIdfScores - Map of words to their TF-IDF scores
     * @returns Map of sentence indices to their final scores
     */
    private static scoreSentences(
        sentences: SentenceWithMetadata[],
        tfIdfScores: Map<string, number>
    ): Map<number, number> {
        const scores = new Map<number, number>();

        const textRankScores = TextRank.rankSentences(sentences.map(s => s.text));

        sentences.forEach((sentence, idx) => {
            const words = Tokenizer.tokenizeWords(sentence.text);

            const tfIdfScore = words.reduce((sum, word) => sum + (tfIdfScores.get(word) || 0), 0) / Math.max(1, words.length);

            const textRankScore = textRankScores[idx];

            const positionScore = sentence.position;

            const lengthScore = Math.min(1, sentence.length / 10);

            const finalScore = 0.4 * tfIdfScore + 0.3 * textRankScore + 0.2 * positionScore + 0.1 * lengthScore;

            scores.set(sentence.index, finalScore);
        });

        return scores;
    }

    /**
     * Removes semantically similar sentences from a list of candidates
     * 
     * @param candidates - Array of candidate sentences
     * @param similarityThreshold - Threshold for determining similarity (0-1)
     * @returns Array of deduplicated sentences
     */
    private static deduplicateSentences(
        candidates: SentenceWithMetadata[],
        similarityThreshold: number = 0.6
    ): SentenceWithMetadata[] {
        const result: SentenceWithMetadata[] = [];

        candidates.forEach(candidate => {
            const isDuplicate = result.some(selected => TextRank.calculateSimilarity(candidate.text, selected.text) > similarityThreshold);

            if (!isDuplicate) result.push(candidate);
        });

        return result;
    }

    /**
     * Generates an extractive summary of the provided text
     * 
     * @param text - The text to summarize
     * @param summaryRatio - Target length as a ratio of original text (default: 0.3)
     * @param maxSentences - Maximum number of sentences to include
     * @param options - Additional options for summarization
     * @param options.deduplicateSimilar - Remove semantically similar sentences
     * @param options.favorPositionScore - Prioritize sentences from introduction and conclusion
     * @returns Summarized text
     */
    static summarize(
        text: string,
        summaryRatio: number = 0.3,
        maxSentences?: number,
        options: {
            deduplicateSimilar?: boolean;
            favorPositionScore?: boolean;
        } = {}
    ): string {
        if (!text) return '';

        const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);

        if (paragraphs.length === 0) return '';

        const sentencesWithMetadata: SentenceWithMetadata[] = [];
        let globalIndex = 0;

        paragraphs.forEach((paragraph, paragraphIdx) => {
            const sentences = Tokenizer.splitSentences(paragraph);
            const paragraphSentCount = sentences.length;

            sentences.forEach((sentenceText, localIdx) => {
                let positionScore: number;
                if (paragraphSentCount <= 1) positionScore = 1;
                else if (localIdx === 0) positionScore = 1;
                else if (localIdx === paragraphSentCount - 1) positionScore = 0.8;
                else positionScore = 0.5 - 0.4 * (localIdx / paragraphSentCount);

                if (paragraphIdx === 0) positionScore *= 1.2;
                else if (paragraphIdx === paragraphs.length - 1) positionScore *= 1.1;

                positionScore = Math.max(0, Math.min(1, positionScore));

                const words = Tokenizer.tokenizeWords(sentenceText, false);

                sentencesWithMetadata.push({
                    index: globalIndex++,
                    text: sentenceText,
                    paragraph: paragraphIdx,
                    length: words.length,
                    position: options.favorPositionScore ? positionScore : 0.5
                });
            });
        });

        if (sentencesWithMetadata.length <= 1) return text;

        const tfIdfScores = this.calculateTfIdf(sentencesWithMetadata.map(s => s.text));

        const sentenceScores = this.scoreSentences(sentencesWithMetadata, tfIdfScores);

        const sentenceCount = maxSentences
            ? Math.min(maxSentences, sentencesWithMetadata.length)
            : Math.max(1, Math.floor(sentencesWithMetadata.length * summaryRatio));

        const topSentences = sentencesWithMetadata
            .map(s => ({ sentence: s, score: sentenceScores.get(s.index) || 0 }))
            .sort((a, b) => b.score - a.score)
            .slice(0, options.deduplicateSimilar ? sentenceCount * 2 : sentenceCount)
            .map(item => item.sentence);

        const selectedSentences = options.deduplicateSimilar
            ? this.deduplicateSentences(topSentences).slice(0, sentenceCount)
            : topSentences;

        selectedSentences.sort((a, b) => a.index - b.index);

        const paragraphSummaries: string[] = [];
        const sentencesByParagraph = new Map<number, SentenceWithMetadata[]>();

        selectedSentences.forEach(sentence => {
            if (!sentencesByParagraph.has(sentence.paragraph)) sentencesByParagraph.set(sentence.paragraph, []);
            sentencesByParagraph.get(sentence.paragraph)!.push(sentence);
        });

        sentencesByParagraph.forEach((sentences, paragraphIdx) => {
            sentences.sort((a, b) => a.index - b.index);

            const paragraphSummary = sentences.map(s => s.text).join(' ');

            if (paragraphSummary) paragraphSummaries.push(paragraphSummary);
        });

        return paragraphSummaries.join('\n\n');
    }
}