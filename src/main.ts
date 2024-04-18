import * as dotenv from 'dotenv';
import { logger } from './utils/logger';
import { fetchNotesFromAnki } from './anki';
import { concurrentProcessor } from './utils/concurrent-processor';
import { primeProcessNote } from './utils/process-note';

const MAX_NOTES_PROCESSED_AT_ONCE = 4;
const MAX_NOTES_PROCESSED_AT_ONE_RUN = 400;

let notesProcessedCount = 0;

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

        await concurrentProcessor(notes, MAX_NOTES_PROCESSED_AT_ONCE, primeProcessNote(ankiLanguage));

        // const notesForProcessing = notes.slice(0, MAX_NOTES_PROCESSED_AT_ONCE);
        // logger.info(`Processing batch of ${notesForProcessing.length} notes.`);

        // await Promise.all(notesForProcessing.map((note) => processNote(ankiLanguage, note)));

        // notesProcessedCount += notesForProcessing.length;
        // if (notesProcessedCount >= MAX_NOTES_PROCESSED_AT_ONE_RUN) {
        //     logger.info(`Processed ${notesProcessedCount} notes, quiting.`);
        //     console.dir(notes.map((note) => note.text).join(', '));
        //     break;
        // }
    }
})();