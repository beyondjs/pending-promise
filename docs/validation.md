# Validation

| Contract or risk | Test | Observed |
| --- | --- | --- |
| A native Promise with `resolve` and `reject` on the instance | `pending-promise` 1 | `instanceof Promise`; resolves |
| `reject` observed by whoever awaits | `pending-promise` 2 | rejects with the reason |
| Only the first settlement counts | `pending-promise` 3 | later resolve, reject ignored, both orders |
| The executor runs synchronously; its throw rejects | `pending-promise` 4 | order recorded; rejection |
| A pending thenable is adopted; a later direct settlement is ignored | `pending-promise` 5 | adopted value and adopted rejection |
| `resolve` and `reject` are detachable | `pending-promise` 6 | resolved from a detached reference |
| Settlement observed asynchronously | `pending-promise` 7 | `then` runs as a microtask |
| Derived promises and combinators keep the subclass with their own members | `pending-promise` 8 | `then()` and `all()` instances |
| A rejection is delivered to a handler attached later; observing it is the consumer's | `pending-promise` 9 | reason delivered |
| No `value`, `settled`, `reset` or `timeout` member | `pending-promise` 10 | absent |

Inside the Beyond Suite, `node utils/validation/run.mjs pending-promise` prepares the server and runs the file; [the tests guide](../tests/README.md) states the prerequisites.

## Not established

- The process-level unhandled-rejection behaviour is native and was not asserted inside the test runner, which converts it into a test failure; the contract is stated from the platform.
