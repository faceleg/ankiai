import fs from 'fs';
import path from 'path';
import { createJsonTranslator, createLanguageModel } from 'typechat';
import { createTypeScriptJsonValidator } from 'typechat/ts';

import type { NoteForProcessing } from '../anki';
import type { VocabularyExamples, VocabularyExamplesList } from './typechat-response-schema';
import { logger } from '../utils/logger';

export const fetchExample = async (language: string, note: NoteForProcessing): Promise<VocabularyExamples[]> => {
    const exampleSentencesModel = createLanguageModel(process.env);

    const exampleSentencesSchema = fs.readFileSync(
        path.join(__dirname, '../../src/openai/typechat-response-schema.ts'),
        'utf8',
    );
    const exampleSentencesValidator = createTypeScriptJsonValidator<VocabularyExamplesList>(
        exampleSentencesSchema,
        'VocabularyExamplesList',
    );
    const exampleSentencesTranslator = createJsonTranslator(exampleSentencesModel, exampleSentencesValidator);
    const exampleSentencesPrompt = `You are a helpful vocabulary learning assistant who helps users generate example sentences in ${language} for language learning. You understand that in ${language}, words can serve different parts of speech depending on context.

Please find the possible usages this word: ${note.text}, and generate 3 example sentences for each usage.

The sentences should be medium or longer length and complexity of HSK5 or higher. Each sentence must contain the the word. All sentences provided for the word must be unique.

JSON must be returned as an array of objects, with one object per part of speech for the word. You must return valid JSON.`;

    logger.debug(exampleSentencesPrompt);

    const exampleSentencesResponse = await exampleSentencesTranslator.translate(exampleSentencesPrompt);

    if (!exampleSentencesResponse.success) {
        console.dir({ note, exampleSentencesResponse }, { depth: 15});
        throw new Error('Error fetching data from chatGPT: ' + exampleSentencesResponse.message);
    } else {
        logger.debug(exampleSentencesResponse.data.items);
        return exampleSentencesResponse.data.items;
    }
};
