# text-summarizer

A lightweight, zero-dependency NLP summarization package built with TypeScript. Performs extractive text summarization using traditional NLP techniques like TextRank and TF-IDF — without any API or AI calls.

[![npm version](https://img.shields.io/npm/v/text-summarizer.svg)](https://www.npmjs.com/package/text-summarizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- **Lightweight** - Zero external runtime dependencies
- **No API Calls** - Works entirely offline
- **Advanced Algorithms** - Uses TextRank and TF-IDF for better summaries
- **Configurable** - Control summary length and other parameters
- **TypeScript** - Full type definitions included

## Installation

```bash
npm install text-summarizer
# or
yarn add text-summarizer
# or
pnpm add text-summarizer
```

## Usage

### Basic Example

```typescript
import { Summarizer } from 'text-summarizer';

const text = `
Machine learning is a subset of artificial intelligence that provides systems the ability to automatically learn and improve from experience without being explicitly programmed. Machine learning focuses on the development of computer programs that can access data and use it to learn for themselves.

The process of learning begins with observations or data, such as examples, direct experience, or instruction, in order to look for patterns in data and make better decisions in the future based on the examples that we provide. The primary aim is to allow the computers learn automatically without human intervention or assistance and adjust actions accordingly.

Machine learning algorithms are often categorized as supervised or unsupervised. Supervised algorithms can apply what has been learned in the past to new data. Unsupervised algorithms can draw inferences from datasets.
`;

// Get a 30% length summary
const summary = Summarizer.summarize(text, 0.3);
console.log(summary);

// Or specify a maximum number of sentences
const threeLineSummary = Summarizer.summarize(text, undefined, 3);
console.log(threeLineSummary);
```

### Advanced Options

```typescript
import { Summarizer } from 'text-summarizer';

const longText = `...your long text here...`;

const summary = Summarizer.summarize(
  longText,
  0.25, // Summarize to 25% of original length
  10,   // Maximum of 10 sentences
  {
    deduplicateSimilar: true,     // Remove similar sentences
    favorPositionScore: true,     // Prioritize intro/conclusion sentences
  }
);

console.log(summary);
```

### Using Other Components

```typescript
import { Tokenizer, TextRank, STOPWORDS } from 'text-summarizer';

// Split text into sentences
const sentences = Tokenizer.splitSentences("Hello world! This is a test.");

// Tokenize words from text
const words = Tokenizer.tokenizeWords("Hello world! This is a test.");

// Calculate sentence importance using TextRank
const sentenceScores = TextRank.rankSentences(sentences);

// Check if a word is a stopword
const isStopword = STOPWORDS.has('the'); // true
```

## API Reference

### Summarizer

```typescript
static summarize(
  text: string,
  summaryRatio: number = 0.3,
  maxSentences?: number,
  options: {
    deduplicateSimilar?: boolean;
    favorPositionScore?: boolean;
  } = {}
): string
```

- `text`: The text to summarize
- `summaryRatio`: Target length as a ratio of original text (default: 0.3)
- `maxSentences`: Maximum number of sentences to include
- `options`:
  - `deduplicateSimilar`: Remove semantically similar sentences
  - `favorPositionScore`: Prioritize sentences from introduction and conclusion

### Tokenizer

```typescript
static splitSentences(text: string): string[]
static tokenizeWords(sentence: string, removeStopwords: boolean = true): string[]
static stemWord(word: string): string
```

### TextRank

```typescript
static calculateSimilarity(sentence1: string, sentence2: string): number
static rankSentences(sentences: string[]): number[]
```

## How It Works

This package implements extractive summarization using multiple scoring methods:

1. **TextRank** - A graph-based ranking algorithm inspired by PageRank
2. **TF-IDF** - Term Frequency-Inverse Document Frequency for word importance
3. **Position Scoring** - Favors sentences from introduction and conclusion
4. **Length Scoring** - Balanced sentence length consideration

## License

MIT © [Arjun Ambavane](https://github.com/ArjunAmbavane01)
