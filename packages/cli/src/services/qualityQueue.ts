import { QualityChecker, QualityValidationResult } from '@agentfoundry/validator';

export class QualityQueue {
    private queue: (() => Promise<void>)[] = [];
    private isProcessing = false;

    /**
     * Adds a quality check task to the queue and returns a promise that resolves with the results.
     * This ensures only one suite of build/test runs at a time to prevent race conditions.
     */
    public async enqueue(projectDir: string): Promise<QualityValidationResult> {
        return new Promise((resolve, reject) => {
            const task = async () => {
                try {
                    const checker = new QualityChecker(projectDir);
                    const results = await checker.runChecks();
                    resolve(results);
                } catch (error) {
                    reject(error);
                }
            };

            this.queue.push(task);
            this.processNext();
        });
    }

    private async processNext() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const task = this.queue.shift();

        if (task) {
            await task();
        }

        this.isProcessing = false;
        this.processNext();
    }
}

export const qualityQueue = new QualityQueue();
