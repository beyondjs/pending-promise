# @beyond-js/pending-promise

A `PendingPromise` class that extends the native `Promise` to provide externally accessible `resolve` and `reject`
methods.

## Installation

```sh
npm install @beyond-js/pending-promise
```

## Usage

```typescript
import { PendingPromise } from '@beyond-js/pending-promise/main';

const promise = new PendingPromise<string>();

// Resolve the promise later
setTimeout(() => {
	promise.resolve('Hello, world!');
}, 1000);

promise.then(value => {
	console.log(value); // Output after 1 second: Hello, world!
});
```

## API

### `PendingPromise`

Extends the native `Promise` class with externally accessible `resolve` and `reject` methods.

#### Constructor

```typescript
new PendingPromise<T>(executor?: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void)
```

-   **executor**: Optional executor function that takes `resolve` and `reject` functions.
