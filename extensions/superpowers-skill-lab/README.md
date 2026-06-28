# Superpowers Skill Lab

Offline quarantine/evaluation extension for candidate skills and skill-like artifacts.

## Behavior

- Reads packaged fixture skills and datasets from this extension directory.
- Writes runs only below `<agent-dir>/skill-lab/runs`.
- Writes user registry state only below `<agent-dir>/registries/skill-lab`.
- Reads packaged seed registries from `<package-root>/registries/skill-lab` when the user registry is absent.
- Refuses writes under live governance roots such as `<agent-dir>/skills`, `<agent-dir>/extensions`, `<agent-dir>/prompts`, and `<agent-dir>/themes`.
- Never promotes candidates automatically.

## Commands

- `/skill-lab-run`
- `/skill-lab-inspect --run <run-id-or-run-dir>`
- `/skill-lab-list`
- `/skill-lab-validate-registry`

## Validation

```bash
node --experimental-strip-types extensions/superpowers-skill-lab/skill-lab.test.mjs
```

Expected result: all tests pass, including quarantine path checks, package fixture path checks, user-local run and registry path checks, registry seed validation, and no live target mutation.

## Rollback

Disable or remove the package and run `/reload`. Package rollback must not delete user-local Skill Lab runs, registries, sessions, logs, backups, auth files, MCP configs, model configs, or settings.
