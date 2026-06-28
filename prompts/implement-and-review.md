---
description: Worker implements, reviewer reviews, worker applies review feedback.
---

Use the `subagent` tool with the `chain` parameter to execute this workflow:

1. First, use the `worker` agent to implement: $@
2. Then, use the `reviewer` agent to review the implementation from the previous step via `{previous}`
3. Finally, use the `worker` agent to apply the review feedback from the previous step via `{previous}`

Execute this as a chain.
