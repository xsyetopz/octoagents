# Git Workflow

## Commit Messages

Use Conventional Commits: `type(scope): description`

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `ci`

Rules:
1. Imperative mood: write "add feature" not "added feature"
2. Subject line no longer than 72 characters
3. Body explains why, not what
4. Reference issues: `Closes #123`

## Branch Naming

| Branch | Purpose |
|---|---|
| `main` / `master` | Production code |
| `feat/<name>` | New feature development |
| `fix/<name>` | Bug fixes |
| `refactor/<name>` | Refactoring without behavior changes |
| `chore/<name>` | Maintenance tasks |

## Pull Request

1. Title follows Conventional Commits format
2. Description includes: what changed, why, how to test
3. Keep PRs focused -- one PR solves one problem
4. Rebase to main before merge, prefer squash merge for small PRs

## Workflow

1. Create branch from main
2. Commit focused changes
3. Run tests before pushing
4. Create PR with clear description
5. Address review feedback
6. Merge after approval
