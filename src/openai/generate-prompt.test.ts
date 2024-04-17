import { expect, test } from 'vitest';
import { generateBasicVocabularyPromptSegment } from './generate-prompt';

test('generate prompt', () => {
    const prompt = generateBasicVocabularyPromptSegment([
        {
            noteId: 1,
            text: 'der Foo',
            definitions: 'This is the definition',
        },
        {
            noteId: 33,
            text: 'der Bar',
            definitions: 'This is the second definition',
        },
        {
            noteId: 2,
            text: 'die FooBaz',
            definitions: 'This is the third definition',
        },
    ]);

    expect(prompt).toBe('1: der Foo\n33: der Bar\n2: die FooBaz');
});
