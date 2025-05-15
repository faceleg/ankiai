import { NoteForProcessing, updateNote } from '../anki';
import { formatExamplesForAnki } from '../anki/format-items-for-anki';
import { fetchExample } from '../openai/get-sentences-from-chatgpt';
import { logger } from './logger';
import sleep from './sleep';

export interface ProcessNote {
    (noteForProcessing: NoteForProcessing): Promise<void>;
}

function replaceStringWithBlanks(html: string, strToReplace: string): string {
    // Create a string of underscores with the same length as strToReplace
    const blankString = '_'.repeat(strToReplace.length);
    // Wrap the blankString in the span tag
    const replacement = `<span class="char_example_blank">${blankString}</span>`;
    // Replace all occurrences of strToReplace in the html with the replacement
    return html.split(strToReplace).join(replacement);
}
function updateClassNames(html: string): string {
    // Replace the class name "char_example" with "char_examples_blank"
    let updatedHtml = html.replace(/class="char_example"/g, 'class="char_examples_blank"');
    // Replace the class name "char_examples-parts-of-speech" with "char_examples_blank-parts-of-speech"
    // updatedHtml = updatedHtml.replace(/class="char_examples-parts-of-speech"/g, 'class="char_examples_blank-parts-of-speech"');
    return updatedHtml;
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
                ExamplesBlank: updateClassNames(replaceStringWithBlanks(fieldText, noteForProcessing.text)),
            },
        };

        await updateNote(noteForAnki);
        logger.debug(`Updated Anki with ${noteForProcessing.text}`);
        // return await sleep(250);
    };
};
