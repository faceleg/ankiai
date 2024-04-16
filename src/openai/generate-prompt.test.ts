import { expect, test } from 'vitest';
import { generateBasicVocabularyPromptSegment } from './generate-prompt';

test('generate prompt', () => {
    const prompt = generateBasicVocabularyPromptSegment([
        {
            noteId: 1,
            text: 'der Foo',
        },
        {
            noteId: 33,
            text: 'der Bar',
        },
        {
            noteId: 2,
            text: 'die FooBaz',
        },
    ]);

    expect(prompt).toBe('1: der Foo\n33: der Bar\n2: die FooBaz');
});
