import { PendingPromise } from '@beyond-js/pending-promise/main';

describe('PendingPromise', () => {
	it('should resolve with the correct value', async () => {
		const promise = new PendingPromise<string>();
		promise.resolve('test');
		const result = await promise;
		expect(result).toBe('test');
	});

	it('should reject with the correct reason', async () => {
		const promise = new PendingPromise<string>();
		promise.reject('error');
		try {
			await promise;
		} catch (error) {
			expect(error).toBe('error');
		}
	});
});
