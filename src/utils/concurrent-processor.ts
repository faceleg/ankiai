import { logger } from './logger';
import { ProcessNote } from './process-note';

// Define a generic function to process items with a concurrency limit
export async function concurrentProcessor<T>(
    items: T[],
    concurrencyLimit: number,
    processItem: (item: T) => Promise<void>,
    delayBetweenStarts: number = 250,
): Promise<void> {
    logger.info(`Starting to process ${items.length} items`);
    const processingQueue: Promise<void>[] = [];

    async function processNextItem(): Promise<void> {
        const item = items.shift();
        if (item) {
            logger.debug(`Starting to process item: ${JSON.stringify(item)}`);

            const processingPromise = processItem(item);
            processingQueue.push(processingPromise);
            await processingPromise;
            const index = processingQueue.indexOf(processingPromise);
            if (index !== -1) {
                processingQueue.splice(index, 1);
            }
            console.log(`${items.length} items remaining. Completed: ${JSON.stringify(item)}`);
            logger.debug(`${items.length} items remaining. Completed: ${JSON.stringify(item)}`);
            await processNextItem();
        }
    }

    // Start initial tasks up to the concurrency limit
    for (let i = 0; i < concurrencyLimit && items.length > 0; i++) {
        processingQueue.push(processNextItem());

        if (i < concurrencyLimit) {
            // Stagger the initial tasks
            await new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, delayBetweenStarts);
            });
        }
    }

    // Wait for all tasks to complete
    await Promise.all(processingQueue);
}
