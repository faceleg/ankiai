import { NoteForProcessing } from '../anki';
import { VocabularyExamples } from '../openai/typechat-response-schema';
import { removeSentencesWithoutCharacter } from '../utils/remove-sentences-without-character';

const capitaliseFirstLetter = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatExamplesForAnki = (examples: VocabularyExamples[], note: NoteForProcessing): string[] => {
    const ankiExamples: string[] = [];
    for (const example of examples) {
        // Remove sentences that do not contain the target word
        const filteredExampleSentences = removeSentencesWithoutCharacter(example.exampleSentences, note.text);
        if (example.exampleSentences.length !== filteredExampleSentences.length) {
            for (const exampleSentence of example.exampleSentences) {
                if (!example.exampleSentences.includes(note.text)) {
                    console.error(`"${note.text}" is not present in "${exampleSentence}"`);
                }
            }
        }

        // Only add the part of speech section if there are examples
        if (filteredExampleSentences.length > 0) {
            ankiExamples.push(
                `<div class="char_examples-parts-of-speech">${capitaliseFirstLetter(example.partsOfSpeech)}</div>`,
            );
            for (const exampleSentence of filteredExampleSentences) {
                ankiExamples.push(`<div class="char_example">${exampleSentence}</div>`);
            }
        }
    }

    if (ankiExamples.length === 0) {
        console.error(`Found 0 examples for "${note.text}"`);
    }

    return ankiExamples;
};
