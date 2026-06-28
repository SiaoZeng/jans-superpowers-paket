# jans-superpowers-paket

Portable OMP Superpowers package with reusable agents, skills, prompts, and extensions.

This repository is the public distribution form. It intentionally excludes private runtime inventories, local handover notes, private remotes, and host-specific source-of-truth artifacts.

## Contents

- `agents/` — reusable OMP agent definitions.
- `skills/` — portable skill workflows and references.
- `extensions/` — OMP extension surfaces shipped by the package.
- `prompts/` — reusable prompt templates.
- `examples/` — safe example configuration files.
- `packages/omp-ast-grep/` — companion OMP ast-grep extension package.

## Install from a local checkout

```bash
git clone https://github.com/SiaoZeng/jans-superpowers-paket.git jans-superpowers-paket
cd jans-superpowers-paket
omp install "$PWD"
```

Reload your OMP session after installation if your runtime requires it.

## Validate

```bash
npm run validate
```

The validation suite includes a public-sanitization gate that rejects private host/user paths and private remote identifiers.

## Companion package

```bash
cd packages/omp-ast-grep
npm install
npm test
npm run typecheck
```

## License

MIT. See `LICENSE`.
