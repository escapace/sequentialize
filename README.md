# sequentialize

Wrap async functions to queue multiple calls for sequential execution.

## Installation

```bash
pnpm add @escapace/sequentialize
```

## Usage

```typescript
import { sequentialize } from '@escapace/sequentialize'

const wrapper = sequentialize()

// Original async function
const fetchData = async (id: string) => {
  const response = await fetch(`/api/data/${id}`)
  return response.json()
}

// Wrapped function executes sequentially
const sequentialFetch = wrapper(fetchData)

// These calls will execute one after another, not concurrently
void sequentialFetch('1') // executes first
void sequentialFetch('2') // waits for first to complete
void sequentialFetch('3') // waits for second to complete
```

## How it works

The `sequentialize` function returns a wrapper that maintains an internal queue of promises. Each wrapped function call:

1. Waits for all previous calls to complete
2. Executes the original function
3. Resolves its promise
4. Allows the next queued call to proceed

Functions execute in first-in-first-out (FIFO) order regardless of their individual completion times.

## Error handling

When a sequentialized function fails, all subsequent functions in the queue will fail with the same error due to the promise chain dependency:

```typescript
const wrapper = sequentialize()
const mayFail = wrapper(async (shouldFail: boolean) => {
  if (shouldFail) throw new Error('Failed')
  return 'Success'
})

void mayFail(false).catch(() => console.log('Call 1 failed')) // does not catch
void mayFail(true).catch(() => console.log('Call 2 failed')) // logs "Call 2 failed"
void mayFail(false).catch(() => console.log('Call 3 failed')) // logs "Call 3 failed"
```

## API

### sequentialize()

Returns a wrapper function that converts async functions to sequential execution.

**Returns:** `<T>(fn: T) => T` - A function that wraps async functions
