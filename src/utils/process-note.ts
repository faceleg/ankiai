import { NoteForProcessing, updateNote } from '../anki';
import { formatExamplesForAnki } from '../anki/format-items-for-anki';
import { fetchExample } from '../openai/get-sentences-from-chatgpt';
import { logger } from './logger';
import sleep from './sleep';

export interface ProcessNote {
    (noteForProcessing: NoteForProcessing): Promise<void>;
}

export const primeProcessNote = (ankiLanguage: string): ProcessNote => {
    return async (noteForProcessing: NoteForProcessing): Promise<void> => {
        const examplesFromChatGPT = await fetchExample(ankiLanguage, noteForProcessing);

        const fieldText = formatExamplesForAnki(examplesFromChatGPT, noteForProcessing).join('');

        const noteId = noteForProcessing.noteId;
        const noteForAnki = {
            id: +noteId,
            fields: {
                Examples: fieldText,
            },
        };

        await updateNote(noteForAnki);
        logger.debug(`Updated Anki with ${noteForProcessing.text}`);
        // return await sleep(250);
    };
};
