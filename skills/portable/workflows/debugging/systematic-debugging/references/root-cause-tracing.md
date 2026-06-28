# Root Cause Tracing

## Overview

Errors often appear far downstream from the real trigger. Trace backward until you reach the source instead of fixing only where the symptom surfaced.

## When to Use

- the error appears deep in a long stack or workflow
- invalid data is visible but its origin is unclear
- the failing operation is only the last stage of a larger chain

## Tracing Pattern

1. observe the symptom exactly where it appears
2. identify the immediate operation that fails
3. ask what called that operation
4. inspect the value or state that was passed in
5. keep tracing upward until you find the original bad trigger
6. fix at the source, then add validation at downstream boundaries when useful

## Instrumentation Pattern

When manual tracing is not enough, log before the dangerous operation:

```typescript
async function dangerousOperation(input: string) {
  console.error('DEBUG dangerousOperation', {
    input,
    cwd: process.cwd(),
    stack: new Error().stack,
  })

  // perform operation
}
```

Use direct stderr or equivalent visible output in test/debug contexts so the evidence is not swallowed.

## Multi-Boundary Reminder

In chained systems, trace one boundary at a time. Do not jump from the final failure straight to a guessed source.

## Bottom Line

If you only fixed where the error appeared, you probably fixed the symptom, not the root cause.
