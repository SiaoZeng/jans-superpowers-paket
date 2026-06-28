---
description: Scout gathers context, planner creates an implementation plan, no implementation.
---

Use the `subagent` tool with the `chain` parameter to execute this workflow:

1. First, use the `scout` agent to find all code relevant to: $@
2. Then, use the `planner` agent to create an implementation plan for "$@" using the context from the previous step via `{previous}`

Execute this as a chain. Do NOT implement.
