---
description: Full implementation workflow - scout gathers context, planner creates a plan, worker implements.
---

Use the `subagent` tool with the `chain` parameter to execute this workflow:

1. First, use the `scout` agent to find all code relevant to: $@
2. Then, use the `planner` agent to create an implementation plan for "$@" using the context from the previous step via `{previous}`
3. Finally, use the `worker` agent to implement the plan from the previous step via `{previous}`

Execute this as a chain.
