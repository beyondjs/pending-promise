# PendingPromise architecture

## Public API and construction

The [main module](../src/modules/main/module.json) publishes the marked `PendingPromise<T>` class from [pending-promise.ts](../src/modules/main/pending-promise.ts).

```ts
new PendingPromise<T>(executor?: (resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void)
```

Construction calls the native constructor with an executor that captures the resolver and the rejector, assigns them to the public `resolve` and `reject` members, then runs the given executor synchronously inside a try/catch whose catch rejects. The members do not need their object: they can be passed as callbacks. The source has no runtime imports; the declared Kernel dependency is packaging, not a call.

## Native behaviour and ownership

- Only the first settlement counts, including resolving with a pending thenable, which adopts its eventual state; a later `resolve` or `reject` is ignored.
- `await` and `then` observe a settlement asynchronously even when it happened synchronously.
- `then`, `catch`, `finally` and the static combinators construct instances of the subclass, each with its own `resolve` and `reject`; there is no custom `Symbol.species`.
- A rejection nobody observes is an unhandled rejection of the process. The class attaches no observer of its own; an owner that may reject a promise nobody awaits attaches one.
- The members are writable; replacing them breaks the owner's protocol without changing the native state.

The owner settles every success, failure and cancellation path. There is no timeout, reset, retry, settled flag, stored value, `value` member or destroy method; a consumer that needs a new attempt allocates a new promise.

```ts
const ready = new PendingPromise<void>();
async function initialise() {
    try {
        await setup();
        ready.resolve();
    } catch (error) {
        ready.reject(error);
    }
}
```

The Dynamic Processor readiness, the watchers readiness handshake and the IPC request correlation are this object. Kernel has a class of the same name with its own construction; the two public modules are not interchangeable.

## Package, build and validation

[beyond.json](../beyond.json) selects [src/package.json](../src/package.json), whose Node distributions use ports 8080 and 8081 and whose [TypeScript settings](../src/modules/main/tsconfig.json) target ES2017. The manifest's root `exports` entry points to a generated `index.js` that the source does not contain; the public module is what consumers import. The Jest configuration retained under [src/test](../src/test) is historical and not connected to a runner; the maintained tests are under [tests/](../tests/README.md) and [validation](validation.md) maps each contract to its test.
