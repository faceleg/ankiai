import type { NoteForProcessing } from '../anki';
import type { PartsOfSpeech } from './typechat-response-parts-of-speech-schema';

export const generateBasicVocabularyPromptSegment = (vocabulary: NoteForProcessing[]): string => {
    return (
        vocabulary
            // .map((note) => `${note.noteId}: ${note.text}, additional context:\n    ${note.definitions}`)
            .map((note) => `${note.noteId}: ${note.text}`)
            .join('\n')
    );
};

const partsOfSpeechLookup = (noteId: number, partsOfSpeech: PartsOfSpeech[]): string[] => {
    const partOfSpeech = partsOfSpeech.find((partsOfSpeech): boolean | undefined => noteId === partsOfSpeech.id);

    if (partOfSpeech === undefined) {
        throw Error(`Part of speech not found for ${noteId}`);
    }

    return partOfSpeech.partsOfSpeech;
};

export const generatePartsOfSpeechVocabularyPromptSegment = (
    vocabulary: NoteForProcessing[],
    partsOfSpeech: PartsOfSpeech[],
): string => {
    return vocabulary
        .map((note) => {
            return `${note.noteId}: ${note.text} ${partsOfSpeechLookup(note.noteId, partsOfSpeech)
                .map((partOfSpeech) => {
                    return `generate three unique example sentences of varying length in Mandarin using ${note.text} as a ${partOfSpeech}`;
                })
                .join(
                    ' and ',
                )}; make sure all sentences for ${note.text} are unique and each sentence must  contain the word ${note.text}.`;
        })
        .join('\n');
};
