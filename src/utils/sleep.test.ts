import { describe, expect, test } from '@jest/globals';

import sleep from './sleep';

describe('sleep', () => {
    test('returns a promise', () => {
        const sleepPromise = sleep(1);
        expect(sleepPromise).toBeInstanceOf(Promise);
    });

    test('can be called with await', async () => {
        await sleep(1);
    });
});
