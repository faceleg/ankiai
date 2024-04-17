/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NoteForProcessing } from '../anki';
// import { generatePartsOfSpeechVocabularyPromptSegment } from './generate-prompt';
import { createJsonTranslator, createLanguageModel } from 'typechat';
import { createTypeScriptJsonValidator } from 'typechat/ts';
import fs from 'fs';
import path from 'path';
import type { VocabularyExamplesList, VocabularyExamplesMerged } from './typechat-response-schema';
// import type { AllPartsOfSpeech } from './typechat-response-parts-of-speech-schema';
import { mergeExamples } from '../utils/merge-examples';

export const fetchExamples = async (language: string, note: NoteForProcessing): Promise<VocabularyExamplesMerged> => {
    //     const partsOfSpeechModel = createLanguageModel(process.env);
    //     // @todo path is from `build/openai/`
    //     const partsOfSpeechSchema = fs.readFileSync(path.join(__dirname, '../../src/openai/typechat-response-parts-of-speech-schema.ts'), 'utf8');
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    //     const partsOfSpeechValidator = createTypeScriptJsonValidator<AllPartsOfSpeech>(partsOfSpeechSchema, "AllPartsOfSpeech");
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    //     const partsOfSpeechTranslator = createJsonTranslator(partsOfSpeechModel, partsOfSpeechValidator);

    //     // Splitting
    //     const partsOfSpeechPrompt = `You are a helpful vocabulary learning assistant who helps users generate example sentences in ${language} for language learning. You understand that in Mandarin, words can serve different parts of speech depending on context, for example: nouns, pronouns, verbs, adjectives, adverbs, number words, measure words, prepositions, conjunctions, interjections, onomatopoeias, particles, function words, verbal measure words, auxiliary verbs.

    // Please find the possible usages for this word. Return the parts of speech as a single comma separated string.

    // ${note.noteId}: ${note.text}`;

    //     // console.log(partsOfSpeechPrompt)

    //     const response = await partsOfSpeechTranslator.translate(partsOfSpeechPrompt);
    //     if (!response.success) {
    //         console.dir({ response });
    //         throw new Error('Error fetching data from chatGPT: ' + response.message);
    //     }
    //     const partsOfSpeech = response.data.partsOfSpeech

    //     // console.dir(note)
    //     // console.dir(partsOfSpeech)

    //     const exampleSentencesModel = createLanguageModel(process.env);
    //     const exampleSentencesSchema = fs.readFileSync(path.join(__dirname, '../../src/openai/typechat-response-schema.ts'), 'utf8');
    //     const exampleSentencesValidator = createTypeScriptJsonValidator<AllVocabularyExamples>(exampleSentencesSchema, "AllVocabularyExamples");
    //     const exampleSentencesTranslator = createJsonTranslator(exampleSentencesModel, exampleSentencesValidator);

    //     const exampleSentencesPrompt = `Now that you have defined the possible parts of speech for each word, please generate at least sentences as requested below. The sentences should be medium or longer length and complexity of HSK5 or higher. Each sentence must contain the word. All sentences provided for a word must be unique.

    // Here is the list of words prefixed by ID with requests to generate sentences:

    // ${generatePartsOfSpeechVocabularyPromptSegment([note], partsOfSpeech)}

    // Examples sentences should be one flat list for each word, with the format like:

    // [
    //     {
    //       id: "the id",
    //       exampleSentences: [ 'sentence 1', 'sentence 2', ... ]
    //     }
    // ]`
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

JSON must be returned as an array of objects, with one object per part of speech for the word.`;
//     const exampleSentencesPrompt = `You are a helpful vocabulary learning assistant who helps users generate example sentences in ${language} for language learning. You understand that in ${language}, words can serve different parts of speech depending on context, for example: nouns, pronouns, verbs, adjectives, adverbs, number words, measure words, prepositions, conjunctions, interjections, onomatopoeias, particles, function words, verbal measure words, auxiliary verbs.

// Please find the possible usages for the word, and generate 3 example sentences for each usage.

// The sentences should be medium or longer length and complexity of HSK5 or higher. Each sentence must contain the the word. All sentences provided for the word must be unique.
    
// Only return JSON data and no other text content, no leading or trailing whitespace.

// JSON must be returned as an array and match the format below, with one object per part of speech for the word:

// This is the word I need help with: 

// ID: ${note.noteId}
// The word: ${note.text}

// [
//     {
//         id: "the id",
//         text: "the word",
//         partsOfSpeech: "the part of speech",
//         exampleSentences: [ "sentence 1", "sentence 2", "sentence 3" ]
//     }
// ]`;
    console.log(exampleSentencesPrompt);
    console.log({ attemptRepair: exampleSentencesTranslator.attemptRepair })
        const exampleSentencesResponse = await exampleSentencesTranslator.translate(exampleSentencesPrompt)
        console.dir(exampleSentencesResponse, { depth: 6});
      
    if (!exampleSentencesResponse.success) {
        console.dir({ note, exampleSentencesResponse });
        throw new Error('Error fetching data from chatGPT: ' + exampleSentencesResponse.message);
    } else {
        const mergedSentences = mergeExamples(note, exampleSentencesResponse.data.items);
        console.dir({ mergedSentences }, { depth: 6 });
        return mergedSentences;
    }
};
