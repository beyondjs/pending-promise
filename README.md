# Pending Promise

`PendingPromise` is a native `Promise` whose `resolve` and `reject` are members of the instance, so an object can expose one readiness promise and settle it later from callbacks or initialisation logic.

```ts
import { PendingPromise } from '@beyond-js/pending-promise/main';

const ready = new PendingPromise<string>();
const consume = ready.then(value => console.log(value));
ready.resolve('ready');
await consume;
```

Native rules govern everything else: the optional executor runs synchronously during construction and its throw rejects; only the first settlement counts; resolving with a thenable adopts it; `then` and the combinators return instances of the subclass with their own settlement members; a rejection nobody observes is an unhandled rejection of the process. The class adds no timeout, cancellation, reset, settled flag or `value` member: the owner settles every path, and awaits the promise itself.

Read [architecture and compatibility](docs/architecture.md) and [validation](docs/validation.md). The Beyond source package is [src/package.json](src/package.json), selected by [beyond.json](beyond.json); the public module is `@beyond-js/pending-promise/main`.
