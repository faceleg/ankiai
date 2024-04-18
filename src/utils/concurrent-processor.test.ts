import { describe, expect, jest, afterEach, it } from '@jest/globals';
import { logger } from './logger';
import { concurrentProcessor } from './concurrent-processor';

// Mock logger
jest.mock('./logger', () => ({
    logger: {
        info: jest.fn(),
        debug: jest.fn(),
    },
}));

const mockProcessItem = jest.fn().mockImplementation((item: any) => {
    return Promise.resolve();
});

describe('concurrentProcessor function', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should process all items without processing the same item twice', async () => {
        const items = [1, 2, 3, 4, 5];

        await concurrentProcessor(items, 2, mockProcessItem as any);

        expect(logger.info).toHaveBeenCalledWith('Starting to process 5 items');
        expect(logger.debug).toHaveBeenCalledTimes(5 * 2); // 5 items, each processed twice
        expect(mockProcessItem).toHaveBeenCalledTimes(5); // 5 items processed
    });

    it('should handle concurrency limit properly', async () => {
        const items = [1, 2, 3, 4, 5];

        await concurrentProcessor(items, 2, mockProcessItem as any);

        expect(logger.info).toHaveBeenCalledWith('Starting to process 5 items');
        expect(logger.debug).toHaveBeenCalledTimes(5 * 2); // 5 items, each processed twice
        expect(mockProcessItem).toHaveBeenCalledTimes(5); // 5 items processed

        // Ensure that only 2 items were processed concurrently
        expect(mockProcessItem.mock.calls.slice(0, 2)).toEqual([[1], [2]]);
    });
});
