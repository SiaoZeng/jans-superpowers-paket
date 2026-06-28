# Spec Templates

Use the smallest safe template.

Choose `Mini Spec` when the change is clear, bounded, and usually limited to 1-3 files.
Choose `Full Spec` when the change is cross-cutting, risky, architectural, migration-heavy, or still has meaningful design alternatives.

## Drafting Rules

Apply these rules to both templates:

- checklist items use `- [ ]`
- use absolute file paths in affected-file tables
- list every affected file individually
- avoid vague phrases such as `etc.`, `analog`, `similar changes`, `and so on`, or `restliche Dateien`
- prefer production-ready solutions over temporary workarounds
- separate the stable `what` and `why` from the later implementation `how`
- when the task is feature-level, prefer prioritized user journeys and acceptance scenarios over vague prose
- make success criteria measurable whenever possible
- document assumptions instead of silently guessing
- if `brainstorming` preceded the spec, carry forward its framing decisions, trade-offs, and open questions explicitly
- if ports change, include `~/PORTS.md`
- if migrations, services, config, data operations, or destructive steps are involved, make rollback explicit
- if research influenced the design, cite it in `References` or `Research Findings`
- include `W-Question Coverage Map`, `Evidence Ledger`, `Decision Ledger`, and `Session Evidence` when they materially affect scope, safety, state, or planning readiness
- treat session transcripts as evidence requiring corroboration, not as automatic truth
- when a W-question is irrelevant, mark it as `N/A — reason` instead of silently omitting it

## Mini Spec Template

```markdown
# {Title} — Mini Spec

**Date:** YYYY-MM-DD
**Project:** {Project Name}
**Status:** Draft
<!-- Update to `Approved` only after spec review passes and before planning handoff. -->

## Spec Review Status
- Review Status: Pending | Approved
- Reviewer Type: Independent | Second-pass self-review | N/A while draft
- Review Date: YYYY-MM-DD or `N/A while draft`
- Blocking Issues Fixed: {cumulative count across review iterations or `0`}
- Review Artifact: {inline approval notes, adjacent review artifact path, or `N/A while draft`}
- Approval Notes: {why the reviewed spec is planning-ready or `N/A while draft`}

## Problem
What is missing, broken, or risky?

## Proposed Change
What will be changed, at a concrete level?

## Goals
- G1: {Goal}

## Non-Goals
- NG1: {Explicitly out of scope}

## Acceptance Scenarios
1. **Given** {initial state}, **When** {action}, **Then** {expected outcome}

## W-Question Coverage Map
| W-Question | Answer | Evidence | Blocking if missing? |
|---|---|---|---|
| Wer | {user/operator/reviewer or `N/A — reason`} | {source} | Yes/No |
| Was | {responsibility and non-scope} | {source} | Yes/No |
| Wann | {trigger, stop, handoff timing} | {source} | Yes/No |
| Wo | {source-of-truth paths and write boundaries} | {source} | Yes/No |
| Wie | {context, design, validation method} | {source} | Yes/No |
| Womit | {tools, agents, MCP surfaces, commands} | {source} | Yes/No |
| Wovon | {dependencies and input artifacts} | {source} | Yes/No |
| Wogegen | {risks and failure modes prevented} | {source} | Yes/No |
| Warum/Wieso/Weshalb | {rationale and rejected alternatives} | {source} | Yes/No |
| Welche | {evidence, risks, validation signals} | {source} | Yes/No |

## Evidence Ledger
| Evidence ID | Source | Method | Relevant Claim | Limitations |
|---|---|---|---|---|
| E-001 | {path, session, GraphRAG finding, URL, or `N/A`} | {read, rg, GraphRAG, dg, browser, user constraint} | {claim} | {limitation or `None`} |

## Decision Ledger
| Decision ID | Decision | Alternatives Considered | Why Chosen | Evidence | Revisit Condition |
|---|---|---|---|---|---|
| D-001 | {decision or `N/A`} | {alternatives} | {reason} | E-001 | {condition or `None`} |

## Session Evidence
| Session / Handover | Why Relevant | State Extracted | Confidence | Follow-up Check |
|---|---|---|---|---|
| {path or `N/A`} | {reason} | {state} | High/Medium/Low | {check or `None`} |

## Success Criteria
- SC1: {Measurable outcome}

## Assumptions
- A1: {Assumption or `None`}

## Affected Files
| Absolute Path | Action | Reason |
|---|---|---|
| /absolute/path/to/file | Modify | {Why this file changes} |

## Delivery Notes
- DN1: {Implementation constraint, sequencing note, or dependency relevant for later planning}
- DN2: {Optional or `None`}

## Testing
- [ ] Automated: {tests or commands}
- [ ] Manual: {manual verification}

## Rollback
- [ ] Revert {file or change}
- [ ] Undo {config, migration, service, or port change if relevant}

## Open Questions
None

Use `- [ ] {Question}` only for actual non-blocking follow-up questions. Blocking questions mean the spec is not ready for planning.

## References
- {Repo docs, issues, prior specs, brainstorming outputs, research URLs, or `None`}
```

## Full Spec Template

```markdown
# {Title} — Full Spec

**Date:** YYYY-MM-DD
**Project:** {Project Name}
**Status:** Draft
<!-- Update to `Approved` only after spec review passes and before planning handoff. -->

## Spec Review Status
- Review Status: Pending | Approved
- Reviewer Type: Independent | Second-pass self-review | N/A while draft
- Review Date: YYYY-MM-DD or `N/A while draft`
- Blocking Issues Fixed: {cumulative count across review iterations or `0`}
- Review Artifact: {inline approval notes, adjacent review artifact path, or `N/A while draft`}
- Approval Notes: {why the reviewed spec is planning-ready or `N/A while draft`}

## 1. Context and Scope
What exists today, where the change fits, and what boundaries apply.

## 2. User Scenarios and Testing
### 2.1 User Story 1 — {Title} (Priority: P1)
{Describe the user journey in plain language}

**Why this priority**: {Why this matters first}

**Independent Test**: {How this can be tested independently}

**Acceptance Scenarios**:
1. **Given** {initial state}, **When** {action}, **Then** {expected outcome}

## 3. Edge Cases
- EC1: {Boundary or failure case}

## 4. Goals
- G1: {Goal}

## 5. Non-Goals
- NG1: {Out of scope and why}

## 6. Requirements
### 6.1 Functional Requirements
- FR-001: {Requirement}

### 6.2 Non-Functional Requirements
- NFR-001: {Performance, security, reliability, operability, or maintainability requirement}

## 7. Success Criteria
- SC-001: {Measurable outcome}

## 8. W-Question Coverage Map
| W-Question | Answer | Evidence | Blocking if missing? |
|---|---|---|---|
| Wer | {user/operator/reviewer or `N/A — reason`} | {source} | Yes/No |
| Was | {responsibility and non-scope} | {source} | Yes/No |
| Wann | {trigger, stop, handoff timing} | {source} | Yes/No |
| Wo | {source-of-truth paths and write boundaries} | {source} | Yes/No |
| Wie | {context, design, validation method} | {source} | Yes/No |
| Womit | {tools, agents, MCP surfaces, commands} | {source} | Yes/No |
| Wovon | {dependencies and input artifacts} | {source} | Yes/No |
| Wogegen | {risks and failure modes prevented} | {source} | Yes/No |
| Warum/Wieso/Weshalb | {rationale and rejected alternatives} | {source} | Yes/No |
| Welche | {evidence, risks, validation signals} | {source} | Yes/No |

## 9. Evidence Ledger
| Evidence ID | Source | Inspection Date | Method | Relevant Claim | Limitations |
|---|---|---|---|---|---|
| E-001 | {path, session, GraphRAG finding, URL, or `N/A`} | YYYY-MM-DD | {read, rg, GraphRAG, dg, browser, user constraint} | {claim} | {limitation or `None`} |

## 10. Decision Ledger
| Decision ID | Decision | Alternatives Considered | Why Chosen | Evidence | Revisit Condition |
|---|---|---|---|---|---|
| D-001 | {decision or `N/A`} | {alternatives} | {reason} | E-001 | {condition or `None`} |

## 11. Session Evidence
| Session / Handover | Why Relevant | State Extracted | Confidence | Follow-up Check |
|---|---|---|---|---|
| {path or `N/A`} | {reason} | {state} | High/Medium/Low | {check or `None`} |

## 12. Assumptions
- A1: {Assumption}

## 13. Key Entities
- Entity 1: {Meaning and relevant attributes without implementation detail}

## 14. Design
### 14.1 Overview
High-level approach.

### 14.2 Data Model and State
Schemas, persistence, caches, or state transitions.

### 14.3 APIs and Interfaces
Requests, responses, contracts, events, CLI, or service boundaries.

### 14.4 UX or Operator Flow
UI, admin flow, or operational workflow if relevant.

### 14.5 Migration and Rollout
Backfill, sequencing, feature flags, deployment order, or compatibility concerns.

## 15. Alternatives Considered
| Approach | Pros | Cons | Why not chosen |
|---|---|---|---|
| {Option} | {Pro} | {Con} | {Reason} |

## 16. Research Findings
Only include findings that influenced the design.

## 17. Technical Context
- Language/Version: {Value or `N/A`}
- Primary Dependencies: {Value or `N/A`}
- Storage: {Value or `N/A`}
- Testing Stack: {Value or `N/A`}
- Platform: {Value or `N/A`}
- Constraints: {Value or `N/A`}

## 18. Affected Files
| Absolute Path | Action | Reason |
|---|---|---|
| /absolute/path/to/file | Modify | {Why this file changes} |

## 19. Delivery Notes
- DN-001: {Implementation constraint, sequencing note, or dependency relevant for later planning}
- DN-002: {Optional or `None`}

## 20. Testing
- [ ] Unit: {coverage target}
- [ ] Integration: {flow or contract}
- [ ] Manual: {runtime validation}

## 21. Risks and Mitigations
- Risk: {Risk}
- Mitigation: {Mitigation}

## 22. Rollback Plan
- [ ] Revert /absolute/path/to/file
- [ ] Undo dependent config, service, migration, or data changes in reverse order
- [ ] Restore prior port registration state if `~/PORTS.md` was changed

## 23. Open Questions
None

Use `- [ ] {Question}` only for actual non-blocking follow-up questions. Blocking questions mean the spec is not ready for planning.

## 24. References
- {Repo docs, ADRs, issues, brainstorming outputs, research URLs, GraphRAG references}
```
