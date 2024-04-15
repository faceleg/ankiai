/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NoteForProcessing } from '../anki';
import { generatePrompt } from './generate-prompt';
import { createJsonTranslator, createLanguageModel } from 'typechat';
import { createTypeScriptJsonValidator } from "typechat/ts";
import fs from 'fs';
import path from 'path';
import type { VocabularyExamples, AllVocabularyExamples } from './typechat-response-schema';

export const fetchExamples = async (language: string, vocabulary: NoteForProcessing[]): Promise<VocabularyExamples[]> => {
    if (vocabulary.length === 0) {
        throw new Error('No vocabulary passed!');
    }

    const model = createLanguageModel(process.env);
    // @todo path is from `build/openai/`
    const schema = fs.readFileSync(path.join(__dirname, '../../src/openai/typechat-response-schema.ts'), 'utf8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const validator = createTypeScriptJsonValidator<AllVocabularyExamples>(schema, "AllVocabularyExamples");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const translator = createJsonTranslator(model, validator);

    const vocabularyPrompt = generatePrompt(vocabulary);
    console.log({ vocabularyPrompt});

    const prompt =
        'You are a helpful vocabulary learning assistant who helps user generate example sentences in ' +
        language +
        ' for language learning. I will provide each word prefixed by ID and you will generate two example sentences for each input. The sentences should be complex enough for HSK4 or higher level.\n' +
        vocabularyPrompt;

    const response = await translator.translate(prompt);
    if (!response.success) {
        console.dir({ response });
        throw new Error('Error fetching data from chatGPT: ' + response.message);
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        console.dir({ items: response.data.items });
        return (response.data.items as VocabularyExamples[]);
    }
};
