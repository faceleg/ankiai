/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NoteForProcessing } from '../anki';
import { generateBasicVocabularyPromptSegment, generatePartsOfSpeechVocabularyPromptSegment } from './generate-prompt';
import { createJsonTranslator, createLanguageModel } from 'typechat';
import { createTypeScriptJsonValidator } from "typechat/ts";
import fs from 'fs';
import path from 'path';
import type { AllVocabularyExamples, VocabularyExamples } from './typechat-response-schema';
import type { AllPartsOfSpeech } from './typechat-response-parts-of-speech-schema';

export const fetchExamples = async (language: string, vocabulary: NoteForProcessing[]): Promise<VocabularyExamples[]> => {
    if (vocabulary.length === 0) {
        throw new Error('No vocabulary passed!');
    }

    const partsOfSpeechModel = createLanguageModel(process.env);
    // @todo path is from `build/openai/`
    const partsOfSpeechSchema = fs.readFileSync(path.join(__dirname, '../../src/openai/typechat-response-parts-of-speech-schema.ts'), 'utf8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const partsOfSpeechValidator = createTypeScriptJsonValidator<AllPartsOfSpeech>(partsOfSpeechSchema, "AllPartsOfSpeech");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const partsOfSpeechTranslator = createJsonTranslator(partsOfSpeechModel, partsOfSpeechValidator);

    const vocabularyPrompt = generateBasicVocabularyPromptSegment(vocabulary);

    // Splitting
    const partsOfSpeechPrompt = `You are a helpful vocabulary learning assistant who helps users generate example sentences in Mandarin for language learning. You understand that in Mandarin, words can serve different parts of speech depending on context, for example: nouns, pronouns, verbs, adjectives, adverbs, number words, measure words, prepositions, conjunctions, interjections, onomatopoeias, particles, function words, verbal measure words, auxiliary verbs.

I will provide each word prefixed by ID. For each word, please find the possible usages for the words. Return the parts of speech as a single comma separated string.
    
Here is the list of words prefixed by ID:
    
${vocabularyPrompt}

For each word in the provided list, define all possible parts of speech based on context. If a word can have multiple parts of speech, list all possible parts of speech for that word explicitly.`;
    
    console.log(partsOfSpeechPrompt)

    const response = await partsOfSpeechTranslator.translate(partsOfSpeechPrompt);
    if (!response.success) {
        console.dir({ response });
        throw new Error('Error fetching data from chatGPT: ' + response.message);
    } 
    const partsOfSpeech = response.data.partsOfSpeech

    console.dir(partsOfSpeech)
        
    const exampleSentencesModel = createLanguageModel(process.env);
    const exampleSentencesSchema = fs.readFileSync(path.join(__dirname, '../../src/openai/typechat-response-schema.ts'), 'utf8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const exampleSentencesValidator = createTypeScriptJsonValidator<AllVocabularyExamples>(exampleSentencesSchema, "AllVocabularyExamples");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const exampleSentencesTranslator = createJsonTranslator(exampleSentencesModel, exampleSentencesValidator);

    const exampleSentencesPrompt = `Now that you have defined the possible parts of speech for each word, please generate one example sentence per part of speech for each word. The sentences should be medium or longer length and complexity of HSK5 or higher. Each possible part of speech must have at least one sentence generated for it.

Here is the list of words prefixed by ID:
    
${generatePartsOfSpeechVocabularyPromptSegment(vocabulary, partsOfSpeech)}
    
For each word in the provided list, generate example sentences for each defined part of speech. Wrap the ${language} sentences in <div class="char_example"></div>. `

/**
 * Also generate the English translation, wrapped in <div class="char_example_English"></div>. At the end of each English translation include the part of speech in brackets.

Return the examples and translations as a flat list of strings, with the the example and translation in pairs.
 */

    console.log(exampleSentencesPrompt)

    const exampleSentencesResponse = await exampleSentencesTranslator.translate(exampleSentencesPrompt);
    if (!exampleSentencesResponse.success) {
        console.dir({ response });
        throw new Error('Error fetching data from chatGPT: ' + exampleSentencesResponse.message);
    } else {
        return exampleSentencesResponse.data.items;
    }
};
