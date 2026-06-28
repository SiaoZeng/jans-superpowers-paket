# Superpowers Governor

Log-only OMP safety/audit extension for Superpowers workflows.

## Behavior

- Default mode: `log-only`.
- No `Allow this action?` modal is shown.
- No tool call is blocked by the Governor.
- Risky classifications are recorded as JSONL audit events.
- The persistent log is bounded to 5 MiB.
- Secrets, tokens, passwords, API keys, credentials, and `.env` contents are redacted before logging.

## Runtime paths

Runtime paths are resolved from the active OMP agent directory at load time.

- Log: `<agent-dir>/logs/superpowers-governor.jsonl`
- Skill backups: `<agent-dir>/skill-backups/`
- Extension backups: `<agent-dir>/extension-backups/`
- Prompt and theme backups: `<agent-dir>/resource-backups/`
- Governance roots: `<agent-dir>/skills`, `<agent-dir>/extensions`, `<agent-dir>/prompts`, `<agent-dir>/themes`

The package source does not hardcode a host-specific user path.

## Commands

- `/governor-reload` reloads extensions, skills, prompt templates, and themes.
- `/governor-log` shows the bounded log tail.
- `/governor-log --tail 20` shows a specific number of JSONL lines.

## Validation

```bash
node --experimental-strip-types extensions/superpowers-governor/validation-classifier.test.mjs
rg -n "Allow this action|ctx\\.ui\\.confirm|return \\{ block: true|Blocked by superpowers governor" extensions/superpowers-governor
```

The second command must return no active blocking or confirmation path.

## Rollback

Remove the package or disable this extension through OMP package configuration, then run `/reload`. Do not delete user-local logs, sessions, backups, auth files, MCP configs, model configs, or settings as part of package rollback.
