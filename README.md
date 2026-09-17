# Pending Promise

PendingPromise extends native Promise with public resolve and reject functions. It lets an object expose one readiness promise while settling it later from callbacks or initialization logic.

```ts
import { PendingPromise } from '@beyond-js/pending-promise/main';

const ready = new PendingPromise<string>();
const consume = ready.then(value => console.log(value));
ready.resolve('ready');
await consume;
```

The optional executor runs synchronously during construction. Native Promise rules still govern fulfillment, rejection, thenable adoption and the first settlement. This class does not add timeout, cancellation, retry or observable state.

The selected implementation exposes the promise directly: use `await ready`, not `await ready.value`. A compatibility variant adds a value getter returning the promise itself; that getter is absent here and never means the fulfilled payload.

Read [architecture and compatibility](docs/architecture.md) for exact API, lifecycle and build/test limitations. The Beyond source package is [src/package.json](src/package.json), selected by [beyond.json](beyond.json); the public module is `@beyond-js/pending-promise/main`.
