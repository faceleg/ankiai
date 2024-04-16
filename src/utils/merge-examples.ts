import type { VocabularyExamples } from "../openai/typechat-response-schema";

export const  mergeExamples = (examples: VocabularyExamples[]): VocabularyExamples[] => {
       const uniqueExamplesMap = new Map<number, string[]>();

    // Iterate through examples and store unique example sentences by ID
    examples.forEach((example) => {
        if (uniqueExamplesMap.has(example.id)) {
            // If ID exists in the map, merge example sentences
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const existingSentences = uniqueExamplesMap.get(example.id)!;
            uniqueExamplesMap.set(
                example.id,
                [...existingSentences, ...example.exampleSentences.filter(sentence =>
                    !existingSentences.includes(sentence)
                )]
            );
        } else {
            // If ID doesn't exist, add a new entry to the map
            uniqueExamplesMap.set(example.id, example.exampleSentences);
        }
    });

    // Convert uniqueExamplesMap back to an array of Example objects
    const uniqueExamples: VocabularyExamples[] = [];
    uniqueExamplesMap.forEach((exampleSentences, id) => {
        uniqueExamples.push({ id, exampleSentences });
    });

    return uniqueExamples;
  }