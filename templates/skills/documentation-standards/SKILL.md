# Documentation Standards

## README Structure

Project README must include (in order):
1. One-sentence description
2. Quick start (minimal steps to run)
3. Installation instructions
4. Usage examples
5. Configuration reference
6. Contributing guide (or link)
7. License

## API Documentation

Each public function/method needs documentation of:
- Purpose (one sentence)
- Parameters (with types and constraints)
- Return value (with type)
- Throw/reject conditions
- Usage examples

## Code Comments

Comment why, not what:

```typescript
// Wrong: increment counter
counter++;

// Correct: compensate for off-by-one in upstream API response
counter++;
```

Complex algorithms need reference comments:
```typescript
// Using Fisher-Yates shuffle: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
```

## Markdown Standards

- Blank line between sections
- Code blocks must have language tags
- Use reference-style for long links
- Align table header separators

## Changelog

Format: Keep a Changelog (https://keepachangelog.com)
Sections: Added, Changed, Deprecated, Removed, Fixed, Security