// import { NoteForProcessing, fetchNotesFromAnki, updateNote } from './anki';
import * as dotenv from 'dotenv';
import { fetchExamples } from './openai/get-sentences-from-chatgpt';
// import sleep from './utils/sleep';
// import { removeSentencesWithoutCharacter } from './utils/remove-sentences-without-character';
require('axios-debug-log/enable');

// const MAX_NOTES_PROCESSED_AT_ONCE = 10;
// const MAX_NOTES_PROCESSED_AT_ONE_RUN = 250;

// let notesProcessedCount = 0;

// const processNote = async (ankiLanguage: string, noteForProcessing: NoteForProcessing) => {
//     const examplesFromChatGPT = await fetchExamples(ankiLanguage, noteForProcessing);
//     // console.log(examplesFromChatGPT)

//         for (const vocabularyExample of examplesFromChatGPT) {
//             const noteId = vocabularyExample.id;
//             const examples = vocabularyExample.exampleSentences;

//             // Remove sentences that do not contain the target word
//             const filteredExamples = removeSentencesWithoutCharacter(examples, noteForProcessing.text)
//             if (examples.length !== filteredExamples.length) {
//                 for (const example of examples) {
//                     if (!example.includes(noteForProcessing.text)) {
//                         console.error(`\n\n\n${noteForProcessing.text} is not present in ${example}\n\n\n`)
//                     }
//                 }
//             }

//             // console.log(`Updating Anki note ${noteForProcessing.text} (${noteId}) with:\n${examples.join('\n')}\n`);

//             const fieldText = filteredExamples
//                 .map((example) => `<div class="char_example">${example}</div>`)
//                 .join('');

//             const noteForAnki = {
//                 id: +noteId,
//                 fields: {
//                     Examples: fieldText,
//                 },
//             };

//             await updateNote(noteForAnki);
//             await sleep(100);
//         }
// }

void (async function () {
    dotenv.config({ path: '.env.local' });
    console.log(
        await Promise.all([
            fetchExamples('Mandarin', {
                noteId: 1,
                text: '得',
                definitions: 'none',
            }),
            fetchExamples('Mandarin', {
                noteId: 2,
                text: '不',
                definitions: 'none',
            }),
            // fetchExamples('Mandarin', {
            //     noteId: 3,
            //     text: '就',
            //     definitions: 'none',
            // }),
            // fetchExamples('Mandarin', {
            //     noteId: 4,
            //     text: '下',
            //     definitions: 'none',
            // }),
            fetchExamples('Mandarin', {
                noteId: 5,
                text: '又',
                definitions: 'none',
            }),
            // fetchExamples('Mandarin', {
            //     noteId: 6,
            //     text: '喂',
            //     definitions: 'none',
            // }),
        ]),
    );
    return;
    // const ankiDeck = process.env['ANKI_DECK'];
    // if (ankiDeck === undefined) {
    //     throw new Error('ANKI_DECK is not configured in env!');
    // }

    // const ankiLanguage = process.env['ANKI_LANGUAGE'];
    // if (ankiLanguage === undefined) {
    //     throw new Error('ANKI_LANGUAGE is not configured in env!');
    // }

    // console.log(`Processing cards from Anki deck "${ankiDeck}" in language "${ankiLanguage}"...`);

    // // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,no-constant-condition
    // while (true) {
    //     const notes = await fetchNotesFromAnki(ankiDeck);
    //     console.log(`Found ${notes.length} notes eligible for fetching!`);
    //     if (notes.length === 0) {
    //         break;
    //     }

    //     const notesForProcessing = notes.slice(0, MAX_NOTES_PROCESSED_AT_ONCE);
    //     console.log(`Processing batch of ${notesForProcessing.length} notes.`);

    //     await Promise.all(notesForProcessing.map((note) => processNote(ankiDeck, note)));

    //     notesProcessedCount += notesForProcessing.length;
    //     if (notesProcessedCount >= MAX_NOTES_PROCESSED_AT_ONE_RUN) {
    //         console.log(`Processed ${notesProcessedCount} notes, quiting.`);
    //         console.dir(notes.map((note) => note.text).join(', '));
    //         break;
    //     }
    // }
})();
