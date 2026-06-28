# Manifest

Public package manifest for `jans-superpowers-paket`.

## Package roots

- `agents/` — active packaged agents.
- `skills/` — packaged skill entrypoints and references.
- `extensions/` — OMP extensions.
- `prompts/` — reusable prompts.
- `themes/` — optional package theme placeholder.
- `examples/` — non-secret example configuration.
- `registries/` — public role and precedence registries.
- `packages/omp-ast-grep/` — companion ast-grep extension package.

## Excluded from public distribution

This public export intentionally excludes private planning, source inventory, drift reports, runtime baselines, handover notes, local remotes, and host-specific operational evidence from the private source repository.

## Validation

Run:

```bash
npm run validate
```

The public-sanitization check must pass before publishing.
