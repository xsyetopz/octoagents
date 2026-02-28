# Project Configuration

## Directory Standards

```
src/          # Source code
tests/        # Test files (mirror src/ structure)
docs/         # Documentation
dist/         # Build output (gitignore)
scripts/      # Build and tool scripts
```

## Configuration Files

Project root must contain:
- `.gitignore` — ignore build artifacts, secrets, editor files
- `README.md` — project overview
- `package.json` / `Cargo.toml` / language-appropriate manifest

TypeScript projects also need:
- `tsconfig.json` — strict mode recommended
- `biome.jsonc` or `eslint.config.js` — linting/formatting

## Environment Variables

1. Document all environment variables in `.env.example`
2. Never commit `.env` files
3. Use `SCREAMING_SNAKE_CASE` for environment variable names
4. Validate required environment variables at startup, fail fast with clear errors

## Dependency Management

- Lock exact versions in lockfile (`bun.lock`, `package-lock.json`)
- Separate dev dependencies from runtime dependencies
- Audit dependencies before adding
- Prefer small focused packages over large frameworks

## Script Naming

Use consistent script names across projects:
| Script | Purpose |
|---|---|
| `build` | Compile/bundle |
| `test` | Run test suite |
| `lint` | Run code linting |
| `format` | Run formatting |
| `start` / `dev` | Run application