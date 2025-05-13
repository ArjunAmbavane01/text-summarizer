import { STOPWORDS } from "./stopwords.js";

/**
 * Provides text tokenization and preprocessing utilities
 * for sentence splitting and word tokenization
 */
export class Tokenizer {
    /**
     * Splits text into sentences
     * 
     * @param text - Text to split into sentences
     * @returns Array of sentences
     */
    static splitSentences(text: string): string[] {
        const preprocessed = text.replace(/([A-Z][a-z]+\.)(\s[A-Z])/g, '$1_PERIOD_$2');

        const sentences = preprocessed.split(/(?<=[.!?])\s+(?=[A-Z"]|$)/).map(s => s.replace(/_PERIOD_/g, '.').trim()).filter(sentence => sentence.length > 0);

        return sentences;
    }

    /**
     * Tokenizes a sentence into words
     * 
     * @param sentence - Sentence to tokenize
     * @param removeStopwords - Whether to remove common stopwords
     * @returns Array of tokenized words
     */
    static tokenizeWords(sentence: string, removeStopwords: boolean = true): string[] {
        const expanded = sentence
            .replace(/n't\b/gi, " not")
            .replace(/'ll\b/gi, " will")
            .replace(/'re\b/gi, " are")
            .replace(/'ve\b/gi, " have")
            .replace(/'m\b/gi, " am")
            .replace(/'s\b/gi, "");

        const words = expanded
            .toLowerCase()
            .replace(/[^\w\s-]/g, ' ')
            .split(/\s+/)
            .map(word => word.trim())
            .filter(word => word.length > 0);

        const stemmedWords = words.map(word => this.stemWord(word));

        return removeStopwords
            ? stemmedWords.filter(word => !STOPWORDS.has(word))
            : stemmedWords;
    }

    /**
     * Performs basic stemming on a word
     * 
     * @param word - Word to stem
     * @returns Stemmed word
     */
    static stemWord(word: string): string {
        if (word.includes('-')) {
            const parts = word.split('-');
            return parts.map(part => this.stemWord(part)).join('-');
        }

        if (word.length <= 2) return word;

        if (word.endsWith('ing') && word.length > 5) {
            const stem = word.slice(0, -3);
            if (/[aeiou]/.test(stem)) return stem;
        }

        if (word.endsWith('ed') && word.length > 4) {
            const stem = word.slice(0, -2);
            if (/[aeiou]/.test(stem)) return stem;
        }

        if (word.endsWith('ly') && word.length > 4) return word.slice(0, -2);

        if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';

        if (word.endsWith('es') && word.length > 3) return word.slice(0, -2);

        if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);

        return word;
    }
}