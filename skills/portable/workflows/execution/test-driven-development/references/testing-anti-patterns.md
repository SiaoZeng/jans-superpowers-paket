# Testing Anti-Patterns

Load this reference when writing or changing tests, adding mocks, or considering test-only helpers in production code.

## Core Principle

Test real behavior, not mock behavior.

## Anti-Pattern 1: Testing Mock Behavior

Bad:

```typescript
test('renders sidebar', () => {
  render(<Page />)
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument()
})
```

Why this fails:

- it proves the mock exists, not that the real behavior works
- it creates false confidence

Prefer:

```typescript
test('renders sidebar navigation', () => {
  render(<Page />)
  expect(screen.getByRole('navigation')).toBeInTheDocument()
})
```

## Anti-Pattern 2: Test-Only Methods in Production

Bad:

```typescript
class Session {
  async destroy() {
    await this.workspaceManager.destroyWorkspace(this.id)
  }
}
```

If only tests call it, it does not belong in production.

Prefer test utilities:

```typescript
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo()
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id)
  }
}
```

## Anti-Pattern 3: Mocking Without Understanding Dependencies

Bad:

```typescript
vi.mock('ToolCatalog', () => ({
  discoverAndCacheTools: vi.fn().mockResolvedValue(undefined),
}))
```

If the real method writes config or establishes state the test depends on, the mock breaks the test model.

Rule:

- understand the side effects first
- mock at the lowest useful boundary
- do not mock high-level behavior the test is trying to prove

## Anti-Pattern 4: Incomplete Mocks

Bad:

```typescript
const mockResponse = {
  status: 'success',
  data: { userId: '123' },
}
```

If real code depends on omitted fields, the test becomes dishonest.

Rule:

- mirror the real schema completely when mocking structured data
- if uncertain, inspect real responses or docs first

## Anti-Pattern 5: Tests as Afterthought

Bad sequence:

```text
Implement feature -> manual check -> add tests later
```

Correct sequence:

```text
Write failing test -> verify RED -> write minimal code -> verify GREEN -> refactor
```

## Red Flags

- asserting on `*-mock` test IDs
- mock setup is larger than the behavior under test
- methods exist only to help tests
- you cannot explain why a mock is needed
- you are mocking "just to be safe"

## Bottom Line

If TDD reveals that a test only proves the mock works, rewrite the test around real behavior or remove the mock.
