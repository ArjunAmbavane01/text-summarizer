import { Summarizer } from '../src/index.js';

// Sample text to summarize
const text = `
Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to natural intelligence displayed by animals including humans. 
AI research has been defined as the field of study of intelligent agents, which refers to any system that perceives its environment and takes actions that maximize its chance of achieving its goals.

The term "artificial intelligence" had previously been used to describe machines that mimic and display "human" cognitive skills that are associated with the human mind, such as "learning" and "problem-solving". This definition has since been rejected by major AI researchers who now describe AI in terms of rationality and acting rationally, which does not limit how intelligence can be articulated.

AI applications include advanced web search engines (e.g., Google), recommendation systems (used by YouTube, Amazon, and Netflix), understanding human speech (such as Google Assistant, Siri, and Alexa), self-driving cars (e.g., Waymo), generative or creative tools (ChatGPT and AI art), automated decision-making, and competing at the highest level in strategic game systems (such as chess and Go).

As machines become increasingly capable, tasks considered to require "intelligence" are often removed from the definition of AI, a phenomenon known as the AI effect. For instance, optical character recognition is frequently excluded from things considered to be AI, having become a routine technology.

The various sub-fields of AI research are centered around particular goals and the use of particular tools. The traditional goals of AI research include reasoning, knowledge representation, planning, learning, natural language processing, perception, and support for robotics. General intelligence (the ability to solve an arbitrary problem) is among the field's long-term goals. To solve these problems, AI researchers have adapted and integrated a wide range of problem-solving techniques, including search and mathematical optimization, formal logic, artificial neural networks, and methods based on statistics, operations research, and economics. AI also draws upon computer science, psychology, linguistics, philosophy, and many other fields.
`;

// Example 1: Basic usage with default settings (30% summary)
console.log("==== BASIC SUMMARY (30% length) ====");
const basicSummary = Summarizer.summarize(text);
console.log(basicSummary);
console.log("\n");

// Example 2: Fixed number of sentences
console.log("==== THREE SENTENCE SUMMARY ====");
const threeSentenceSummary = Summarizer.summarize(text, undefined, 3);
console.log(threeSentenceSummary);
console.log("\n");

// Example 3: More configuration options
console.log("==== ADVANCED SUMMARY ====");
const advancedSummary = Summarizer.summarize(text, 0.2, undefined, {
  deduplicateSimilar: true,
  favorPositionScore: true
});
console.log(advancedSummary);
console.log("\n");

// Example 4: Using the Tokenizer directly
import { Tokenizer } from '../src/index.js';
console.log("==== SENTENCE SPLITTING ====");
const sentences = Tokenizer.splitSentences(text);
console.log(`Text contains ${sentences.length} sentences. First sentence:`);
console.log(sentences[0]);
console.log("\n");

console.log("==== WORD TOKENIZATION ====");
const words = Tokenizer.tokenizeWords(sentences[0]);
console.log(`First sentence contains ${words.length} non-stopwords after tokenization:`);
console.log(words);
console.log("\n");

// Example 5: Using TextRank directly
import { TextRank } from '../src/index.js';
console.log("==== SENTENCE RANKING ====");
const scores = TextRank.rankSentences(sentences.slice(0, 5));
console.log("TextRank scores for first 5 sentences:");
scores.forEach((score, idx) => {
  console.log(`Sentence ${idx + 1}: ${score.toFixed(4)} - "${sentences[idx].substring(0, 50)}..."`);
});