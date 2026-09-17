# PendingPromise architecture

## Public API and construction

The [main module](../src/modules/main/module.json) publishes the marked `PendingPromise<T>` class from [pending-promise.ts](../src/modules/main/pending-promise.ts). Internal source organization does not add other public modules.

```ts
new PendingPromise<T>(executor?: (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: any) => void
) => void)
```

The instance has writable public resolve/reject function properties. Resolve accepts T or a thenable of T; rejection accepts any reason. A PendingPromise<void> can be resolved with undefined. The type signature does not make the resolver's value argument generally optional for arbitrary T.

Construction always invokes the native Promise constructor with an executor that captures its resolver/rejector. It then assigns those captured functions to the instance and, if an executor was supplied, calls it synchronously inside try/catch. An executor exception rejects the promise. The captured functions do not depend on a caller's this binding, so they can be passed as callbacks directly.

There is no import-time filesystem, network or timer behavior in this implementation. Its source has no runtime imports; the package's declared Kernel dependency is not a source-level call made by the class. Platform `*` still requires native Promise and the compiled module's own loading environment.

## Native promise behavior and ownership

Only the first settlement attempt takes effect, including resolving with a still-pending thenable. Await/then observes fulfillment/rejection asynchronously even if resolve was called synchronously. A thrown executor error after settlement cannot replace the result. An async executor's returned Promise is ignored, as with the native pattern: callers must explicitly connect its errors to reject rather than expect automatic adoption of its return.

Inherited then/catch/finally and static combinators use Promise subclass semantics. The constructor supports the executor supplied by those operations; derived promises receive their own public settlement functions as well. No custom Symbol.species or scheduling behavior is defined. The public functions are writable, so replacing them can break the owner's intended readiness protocol without changing the native promise internals.

The owner must settle every success, failure and cancellation path. There is no timeout, reset, retry, cancellation signal, settled flag, value storage or destroy method. A function returning early after creating an unresolved readiness promise can strand all later waiters. Error logging alone does not reject it. A consumer that needs retries must allocate and manage an explicit new attempt rather than reuse a settled promise.

```ts
const ready = new PendingPromise<void>();
async function initialize() {
    try {
        await performSetup();
        ready.resolve();
    } catch (error) {
        ready.reject(error);
    }
}
```

This fragment requires an application-defined performSetup and a rejection observer; it illustrates ownership, not an automatic class initializer. Attach the consumer's rejection handling early to avoid unhandled rejections.

## Compatibility with value wrappers

The selected main implementation has no `.value` property. The `feat/beyond-migration` variant adds a deprecated getter returning `this`, while keeping the same resolver/executor behavior. Code written for a wrapper must be migrated deliberately: await the promise itself, or use an explicit compatibility adapter. Reading a missing `.value` produces undefined and `await undefined` proceeds immediately, so this mismatch can silently bypass readiness instead of throwing.

The compatibility getter does not expose the fulfilled value synchronously. Native Promise remains the state/settlement mechanism. Kernel also has its own PendingPromise class with different source and construction details; sharing the class name does not make the two public module contracts interchangeable.

Dynamic processors and asynchronous database/provider setup are typical consumers. They store one promise and settle it on completion. This utility cannot fix an owner's missing reject/reset or destruction path; lifecycle correctness must be checked where the promise is created and returned.

## Package, build and validation

[beyond.json](../beyond.json) selects [src/package.json](../src/package.json), where Node distributions use 8080/8081 and [TypeScript settings](../src/modules/main/tsconfig.json) target ES2017/ES2020 modules. The manifest's root exports entry points to index.js, but that generated file is not the TypeScript source entry. Root package-lock presence without a root package manifest does not make repository-root npm execution a complete build recipe.

The source package declares Jest and Jest types. [The Jest configuration](../src/test/jest.config.js) selects ts-jest even though that package is not declared there, points to a setup file absent from this layout and matches a different test directory/name than [the supplied tests](../src/test/pending-promise.ts). Those tests cover basic resolution and rejection, but the rejection test can pass without entering its catch if rejection behavior changes. No test script connects this configuration to a complete runner. Correct discovery, transformation and public-module resolution before interpreting it as a reproducible test command.

[The legacy runner](../runners/empty.js) only initializes BEE on a fixed port and contains no PendingPromise assertion. The publish workflow selects a distribution named npm while the source manifest declares only node/node-ts; build configuration and output location need reconciliation before use. Neither runner nor workflow establishes compatibility with every installed package version.

Tests for a maintained implementation should cover synchronous executor timing/throws, resolve/reject races, thenable adoption, inheritance/combinators, detached callbacks, no-executor construction, rejected initialization and the deliberate presence/absence of value. Keep protocol changes explicit and preserve the simple Promise subclass structure where it remains sufficient.
