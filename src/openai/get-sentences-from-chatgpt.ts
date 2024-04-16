/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NoteForProcessing } from '../anki';
import { generatePartsOfSpeechVocabularyPromptSegment } from './generate-prompt';
import { createJsonTranslator, createLanguageModel } from 'typechat';
import { createTypeScriptJsonValidator } from "typechat/ts";
import fs from 'fs';
import path from 'path';
import type { VocabularyExamples, AllVocabularyExamples } from './typechat-response-schema';
import type { AllPartsOfSpeech } from './typechat-response-parts-of-speech-schema';
import { mergeExamples } from '../utils/merge-examples';
// import { mergeExamples } from '../utils/merge-examples';

export const fetchExamples = async (language: string, note: NoteForProcessing): Promise<VocabularyExamples[]> => {
    const partsOfSpeechModel = createLanguageModel(process.env);
    // @todo path is from `build/openai/`
    const partsOfSpeechSchema = fs.readFileSync(path.join(__dirname, '../../src/openai/typechat-response-parts-of-speech-schema.ts'), 'utf8');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const partsOfSpeechValidator = createTypeScriptJsonValidator<AllPartsOfSpeech>(partsOfSpeechSchema, "AllPartsOfSpeech");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const partsOfSpeechTranslator = createJsonTranslator(partsOfSpeechModel, partsOfSpeechValidator);

    // Splitting
    const partsOfSpeechPrompt = `You are a helpful vocabulary learning assistant who helps users generate example sentences in ${language} for language learning. You understand that in Mandarin, words can serve different parts of speech depending on context, for example: nouns, pronouns, verbs, adjectives, adverbs, number words, measure words, prepositions, conjunctions, interjections, onomatopoeias, particles, function words, verbal measure words, auxiliary verbs.

Please find the possible usages for this word. Return the parts of speech as a single comma separated string.
    
${note.noteId}: ${note.text}`;
    
    // console.log(partsOfSpeechPrompt)

    const response = await partsOfSpeechTranslator.translate(partsOfSpeechPrompt);
    if (!response.success) {
        console.dir({ response });
        throw new Error('Error fetching data from chatGPT: ' + response.message);
    } 
    const partsOfSpeech = response.data.partsOfSpeech

    // console.dir(note)
    // console.dir(partsOfSpeech)
        
    const exampleSentencesModel = createLanguageModel(process.env);
    const exampleSentencesSchema = fs.readFileSync(path.join(__dirname, '../../src/openai/typechat-response-schema.ts'), 'utf8');
    const exampleSentencesValidator = createTypeScriptJsonValidator<AllVocabularyExamples>(exampleSentencesSchema, "AllVocabularyExamples");
    const exampleSentencesTranslator = createJsonTranslator(exampleSentencesModel, exampleSentencesValidator);

    const exampleSentencesPrompt = `Now that you have defined the possible parts of speech for each word, please generate at least sentences as requested below. The sentences should be medium or longer length and complexity of HSK5 or higher. Each sentence must contain the word. All sentences provided for a word must be unique.

Here is the list of words prefixed by ID with requests to generate sentences:
    
${generatePartsOfSpeechVocabularyPromptSegment([note], partsOfSpeech)}        
    
Examples sentences should be one flat list for each word, with the format like:

[
    {
      id: "the id",
      exampleSentences: [ 'sentence 1', 'sentence 2', ... ]
    }
]`

    // console.log(exampleSentencesPrompt)

    const exampleSentencesResponse = await exampleSentencesTranslator.translate(exampleSentencesPrompt);

    if (!exampleSentencesResponse.success) {
        console.dir({ response });
        throw new Error('Error fetching data from chatGPT: ' + exampleSentencesResponse.message);
    } else {
        const mergedSentences = mergeExamples(exampleSentencesResponse.data.items)

        console.dir({
            noteId: note.noteId,
            text: note.text,
            partsOfSpeech: partsOfSpeech[0]?.partsOfSpeech,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            exampleSentences: mergedSentences[0]?.exampleSentences
        })
        
        return mergedSentences;
    }
};
