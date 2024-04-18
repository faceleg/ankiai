import { logger } from './utils/logger';
import { fetchNotesFromAnki } from './anki';
import { concurrentProcessor } from './utils/concurrent-processor';
import { primeProcessNote } from './utils/process-note';

import * as dotenv from 'dotenv-extended';

// Load environment variables from .env file
dotenv.load({
    path: '.env.local',
    errorOnMissing: true,
    errorOnExtra: true,
});

// Define types for your environment variables
interface EnvVariables {
    ANKI_DECK: string;
    ANKI_LANGUAGE: string;
    MAX_CONCURRENCY: string;
}

const { ANKI_DECK, ANKI_LANGUAGE, MAX_CONCURRENCY }: EnvVariables = process.env as unknown as EnvVariables;

(async function (): Promise<void> {
    logger.info(`Processing cards from Anki deck "${ANKI_DECK}" in language "${ANKI_LANGUAGE}"...`);

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition,no-constant-condition
    while (true) {
        const notes = await fetchNotesFromAnki(ANKI_DECK);
        logger.info(`Found ${notes.length} notes eligible for fetching`);
        if (notes.length === 0) {
            break;
        }

        await concurrentProcessor(notes, parseInt(MAX_CONCURRENCY as string), primeProcessNote(ANKI_LANGUAGE));
    }
})();
