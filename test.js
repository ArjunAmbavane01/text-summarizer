import {Summarizer} from "./dist/index.js";

const text = `
Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by humans and animals. Leading AI textbooks define the field as the study of "intelligent agents": any device that perceives its environment and takes actions that maximize its chance of successfully achieving its goals.

As machines become more capable, tasks considered to require "intelligence" are often removed from the definition of AI, a phenomenon known as the AI effect. For instance, optical character recognition (OCR) is frequently excluded from things considered to be AI, having become a routine technology.

AI research has been divided into subfields that often fail to communicate with each other. These subfields are specialized based on particular problems, the tools used, or the application domains. The central problems of AI research include reasoning, knowledge representation, planning, learning, natural language processing (NLP), perception, and the ability to move and manipulate objects. General intelligence is still a long-term goal of AI research, but this goal is more often defined by the ability of AI to perform a wide range of tasks.
`;

const summary = Summarizer.summarize(
  text,
  0.3,       // 30% of original length
  4,        // Maximum 10 sentences
  {
    deduplicateSimilar: true,     // Remove redundant sentences
    favorPositionScore: true      // Give more weight to intro/conclusion
  }
);
console.log(summary)