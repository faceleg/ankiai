import type { NoteForProcessing } from '../anki';
import type { VocabularyExamples } from '../openai/typechat-response-schema';

export interface VocabularyExamplesMerged {
    id: number;
    text: string;
    exampleSentences: string[];
    partsOfSpeech: string[];
}

export const mergeExamples = (
    originalNote: NoteForProcessing,
    examples: VocabularyExamples[],
): VocabularyExamplesMerged => {
    const mergedExamples: VocabularyExamplesMerged = {
        id: originalNote.noteId,
        text: originalNote.text,
        partsOfSpeech: [],
        exampleSentences: [],
    };

    examples.forEach((example) => {
        // Merge parts of speech
        if (!mergedExamples.partsOfSpeech.includes(example.partsOfSpeech)) {
            mergedExamples.partsOfSpeech.push(example.partsOfSpeech);
        }

        // Merge example sentences and remove duplicates
        example.exampleSentences.forEach((sentence) => {
            if (!mergedExamples.exampleSentences.includes(sentence)) {
                mergedExamples.exampleSentences.push(sentence);
            }
        });
    });

    return mergedExamples;
};
