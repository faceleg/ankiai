/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchNotesFromAnki, updateNote } from './anki';
import * as dotenv from 'dotenv';
import { fetchExamples } from './openai/get-sentences-from-chatgpt';
import sleep from './utils/sleep';
require('axios-debug-log/enable');

const MAX_NOTES_PROCESSED_AT_ONCE = 8;
const MAX_NOTES_PROCESSED_AT_ONE_RUN = 200;

let notesProcessedCount = 0;

void (async function () {
    dotenv.config({ path: '.env.local' });

    const ankiDeck = process.env['ANKI_DECK'];
    if (ankiDeck === undefined) {
        throw new Error('ANKI_DECK is not configured in env!');
    }

    const ankiLanguage = process.env['ANKI_LANGUAGE'];
    if (ankiLanguage === undefined) {
        throw new Error('ANKI_LANGUAGE is not configured in env!');
    }

    console.log(`Processing cards from Anki deck "${ankiDeck}" in language "${ankiLanguage}"...`);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,no-constant-condition
    while (true) {
        const notes = await fetchNotesFromAnki(ankiDeck);
        console.log(`Found ${notes.length} notes eligible for fetching!`);

        const notesForProcessing = notes.slice(0, MAX_NOTES_PROCESSED_AT_ONCE);
        console.log(`Processing batch of ${notesForProcessing.length} notes.`);

        const examplesFromChatGPT = await fetchExamples(ankiLanguage, notesForProcessing);

        for (const vocabularyExample of examplesFromChatGPT) {
            const noteId = vocabularyExample.id;
            const examples = vocabularyExample.exampleSentences;

            console.log(`Updating Anki note ${noteId} with ${examples}`)
            const fieldText = examples.map((example) => `<div class="char_example">${example}</div>`).join('')

            const noteForAnki = {
                id: +noteId,
                fields: {
                    Examples: fieldText,
                },
            };

            console.dir(noteForAnki);
            await updateNote(noteForAnki);
            await sleep(500);
        }

        notesProcessedCount += notesForProcessing.length;
        if (notesProcessedCount >= MAX_NOTES_PROCESSED_AT_ONE_RUN) {
            console.log(`Processed ${notesProcessedCount} notes, quiting.`);
            break;
        }
    }
})();
