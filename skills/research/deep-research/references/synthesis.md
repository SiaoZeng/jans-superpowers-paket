# Synthesis Patterns

## Compare Multiple Sources

Use this pattern when you have 2 or more sources that may overlap or disagree.

1. Identify the claim that must be answered.
2. Extract the smallest relevant evidence from each source.
3. Label each source by type:
   - official docs
   - release notes
   - repository issue or pull request
   - maintainer post
   - community discussion
4. Rank the sources by authority and recency.
5. Write the answer from highest-authority evidence first.
6. Call out disagreements explicitly instead of averaging them away.

## Verify Claims Across Docs, Releases, And Issues

Use this pattern when feature behavior may have changed over time.

1. Check official docs for the current intended behavior.
2. Check release notes or changelogs for changes in behavior.
3. Check issues or pull requests for implementation details, regressions, or ambiguity.
4. If docs and implementation evidence disagree, say which source is likely stale.

## Write Evidence-Based Summaries

Good summary shape:

1. Current answer in one sentence.
2. Primary evidence source.
3. Supporting or conflicting evidence.
4. Remaining uncertainty, if any.

Example structure:

```text
Current status: Feature X is supported in version Y.
Primary evidence: Official docs and latest release notes both say so.
Supporting detail: Issue #123 confirms the implementation landed in commit abc.
Uncertainty: Older docs pages still mention the previous limitation.
```

## Handle Conflicting Claims

When sources conflict:

1. Prefer official, newer, and directly relevant sources.
2. Treat closed issues and merged PRs as stronger than open speculation.
3. Treat blog posts and forum answers as secondary unless they quote official material.
4. Do not hide the conflict. Explain it briefly.

## Escalate To Browser Research

Escalate only when:

- `curl` returns incomplete or misleading content
- the page depends on JavaScript rendering
- the evidence sits behind tabs, expanders, or dynamic DOM state
- screenshots or DOM snapshots are needed for confidence
