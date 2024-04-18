import { describe, expect, test } from '@jest/globals';
import { mergeExamples } from './merge-examples';
import type { NoteForProcessing } from '../anki';

describe('merge-examples', () => {
    test('it should merge examples', () => {
        const note: NoteForProcessing = {
            noteId: 5,
            text: '又',
            definitions: 'none',
        };
        const response = {
            items: [
                {
                    id: 1,
                    text: '又',
                    exampleSentences: [
                        '他又高又帅，是我心目中的完美男人。',
                        '她又聪明又勤奋，是我们班的学霸。',
                        '这个问题又复杂又深奥，需要认真思考才能理解。',
                    ],
                    partsOfSpeech: 'conjunction',
                },
                {
                    id: 2,
                    text: '又',
                    exampleSentences: [
                        '他又来晚了，老板一定会生气的。',
                        '她又哭又笑，情绪变化很快。',
                        '这个电影又搞笑又感人，让人忍不住流泪。',
                    ],
                    partsOfSpeech: 'adverb',
                },
            ],
        };

        const mergedItems = mergeExamples(note, response.items);

        expect(mergedItems).toMatchObject({
            id: 5,
            text: '又',
            partsOfSpeech: ['conjunction', 'adverb'],
            exampleSentences: [
                '他又高又帅，是我心目中的完美男人。',
                '她又聪明又勤奋，是我们班的学霸。',
                '这个问题又复杂又深奥，需要认真思考才能理解。',
                '他又来晚了，老板一定会生气的。',
                '她又哭又笑，情绪变化很快。',
                '这个电影又搞笑又感人，让人忍不住流泪。',
            ],
        });
    });
});
