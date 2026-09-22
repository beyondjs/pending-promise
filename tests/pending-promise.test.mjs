/**
 * The contract of a promise settled from outside: construction, the executor, first settlement, thenable
 * adoption, rejection observation and the native combinators.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PendingPromise } from '@beyond-js/pending-promise/main';

test('it is a native Promise with resolve and reject on the instance', async () => {
	const pending = new PendingPromise();
	assert.ok(pending instanceof Promise);
	assert.equal(typeof pending.resolve, 'function');
	assert.equal(typeof pending.reject, 'function');
	pending.resolve('value');
	assert.equal(await pending, 'value');
});

test('reject settles it with the reason, observed by whoever awaits', async () => {
	const pending = new PendingPromise();
	pending.reject(new Error('reason'));
	await assert.rejects(pending, /reason/);
});

test('only the first settlement counts', async () => {
	const pending = new PendingPromise();
	pending.resolve(1);
	pending.resolve(2);
	pending.reject(new Error('late'));
	assert.equal(await pending, 1);

	const rejected = new PendingPromise();
	rejected.reject(new Error('first'));
	rejected.resolve('late');
	await assert.rejects(rejected, /first/);
});

test('the executor runs synchronously during construction, and its throw rejects', async () => {
	const order = [];
	const pending = new PendingPromise(resolve => {
		order.push('executor');
		resolve('from executor');
	});
	order.push('after construction');
	assert.deepEqual(order, ['executor', 'after construction']);
	assert.equal(await pending, 'from executor');

	const throwing = new PendingPromise(() => {
		throw new Error('executor threw');
	});
	await assert.rejects(throwing, /executor threw/);
});

test('resolving with a pending thenable adopts its eventual state, and a later direct settlement is ignored', async () => {
	const inner = new PendingPromise();
	const outer = new PendingPromise();
	outer.resolve(inner);
	outer.resolve('ignored');
	inner.resolve('adopted');
	assert.equal(await outer, 'adopted');

	const failing = new PendingPromise();
	const adopting = new PendingPromise();
	adopting.resolve(failing);
	failing.reject(new Error('adopted rejection'));
	await assert.rejects(adopting, /adopted rejection/);
});

test('resolve and reject are detachable: they do not need their object', async () => {
	const pending = new PendingPromise();
	const { resolve } = pending;
	setImmediate(() => resolve('detached'));
	assert.equal(await pending, 'detached');
});

test('await observes the settlement asynchronously even when it happened synchronously', async () => {
	const pending = new PendingPromise();
	pending.resolve('now');
	let observed = false;
	pending.then(() => (observed = true));
	assert.equal(observed, false, 'then callbacks run as microtasks');
	await pending;
	assert.equal(observed, true);
});

test('derived promises and combinators keep the subclass and their own settlement functions', async () => {
	const pending = new PendingPromise();
	const derived = pending.then(value => value * 2);
	assert.ok(derived instanceof PendingPromise, 'then() creates an instance of the subclass');
	assert.equal(typeof derived.resolve, 'function');
	pending.resolve(21);
	assert.equal(await derived, 42);

	const all = PendingPromise.all([PendingPromise.resolve(1), 2]);
	assert.ok(all instanceof PendingPromise);
	assert.deepEqual(await all, [1, 2]);
});

test('a rejection is delivered to a handler attached after it happened; observing it is the consumer\'s job', async () => {
	const pending = new PendingPromise();
	pending.reject(new Error('later'));
	// Attached synchronously after the rejection: the utility adds no observer of its own
	const reason = await pending.catch(error => error.message);
	assert.equal(reason, 'later');
});

test('there is no value, settled, reset or timeout member', () => {
	const pending = new PendingPromise();
	assert.equal('value' in pending, false);
	assert.equal('settled' in pending, false);
	assert.equal('reset' in pending, false);
	assert.equal('timeout' in pending, false);
	pending.resolve();
});
