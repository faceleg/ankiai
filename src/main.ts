import * as dotenv from 'dotenv';
import { fetchExample } from './openai/get-sentences-from-chatgpt';
import { logger } from './utils/logger';
import { NoteForProcessing, fetchNotesFromAnki, updateNote } from './anki';
import sleep from './utils/sleep';
import { removeSentencesWithoutCharacter } from './utils/remove-sentences-without-character';
import type { VocabularyExamples } from './openai/typechat-response-schema';

const MAX_NOTES_PROCESSED_AT_ONCE = 2;
const MAX_NOTES_PROCESSED_AT_ONE_RUN = 400;

let notesProcessedCount = 0;

function capitaliseFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

const formatExamplesForAnki = (examples: VocabularyExamples[], note: NoteForProcessing): string[] => {
    const ankiExamples: string[] = [];
    for (const example of examples) {
        // Remove sentences that do not contain the target word
        const filteredExampleSentences = removeSentencesWithoutCharacter(example.exampleSentences, note.text);
        if (example.exampleSentences.length !== filteredExampleSentences.length) {
            for (const exampleSentence of example.exampleSentences) {
                if (!example.exampleSentences.includes(note.text)) {
                    console.error(`${note.text} is not present in ${exampleSentence}.`);
                    console.error(
                        `Adding ${filteredExampleSentences.length} examples to card, filtered from ${example.exampleSentences.length}.`,
                    );
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

    return ankiExamples;
};

const processNote = async (ankiLanguage: string, noteForProcessing: NoteForProcessing) => {
    const examplesFromChatGPT = await fetchExample(ankiLanguage, noteForProcessing);

    const fieldText = formatExamplesForAnki(examplesFromChatGPT, noteForProcessing).join('');

    const noteId = noteForProcessing.noteId;
    const noteForAnki = {
        id: +noteId,
        fields: {
            Examples: fieldText,
        },
    };

    // logger.verbose(noteForAnki);

    await updateNote(noteForAnki);
    return await sleep(100);
};

// const testApiWithoutUpdating = async () => {
//     logger.info(
//         await Promise.all([
//             fetchExample('Mandarin', {
//                 noteId: 1,
//                 text: '阳性',
//                 definitions: 'none',
//             }),
//             // fetchExample('Mandarin', {
//             //     noteId: 2,
//             //     text: '不',
//             //     definitions: 'none',
//             // }),
//             // fetchExample('Mandarin', {
//             //     noteId: 3,
//             //     text: '就',
//             //     definitions: 'none',
//             // }),
//             // fetchExample('Mandarin', {
//             //     noteId: 4,
//             //     text: '下',
//             //     definitions: 'none',
//             // }),
//             // fetchExample('Mandarin', {
//             //     noteId: 5,
//             //     text: '又',
//             //     definitions: 'none',
//             // }),
//             // fetchExample('Mandarin', {
//             //     noteId: 6,
//             //     text: '喂',
//             //     definitions: 'none',
//             // }),
//         ]),
//     );
//     return;
// };

void (async function () {
    dotenv.config({ path: '.env.local' });
    // return testApiWithoutUpdating();

    const ankiDeck = process.env['ANKI_DECK'];
    if (ankiDeck === undefined) {
        throw new Error('ANKI_DECK is not configured in env');
    }

    const ankiLanguage = process.env['ANKI_LANGUAGE'];
    if (ankiLanguage === undefined) {
        throw new Error('ANKI_LANGUAGE is not configured in env');
    }

    logger.info(`Processing cards from Anki deck "${ankiDeck}" in language "${ankiLanguage}"...`);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,no-constant-condition
    while (true) {
        const notes = await fetchNotesFromAnki(ankiDeck);
        logger.info(`Found ${notes.length} notes eligible for fetching`);
        if (notes.length === 0) {
            break;
        }

        const notesForProcessing = notes.slice(0, MAX_NOTES_PROCESSED_AT_ONCE);
        logger.info(`Processing batch of ${notesForProcessing.length} notes.`);

        await Promise.all(notesForProcessing.map((note) => processNote(ankiLanguage, note)));

        notesProcessedCount += notesForProcessing.length;
        if (notesProcessedCount >= MAX_NOTES_PROCESSED_AT_ONE_RUN) {
            logger.info(`Processed ${notesProcessedCount} notes, quiting.`);
            console.dir(notes.map((note) => note.text).join(', '));
            break;
        }
    }
})();