# DST Tools

## What this does

Scans your codebase and detects:
- **κ** (masking) — hidden stress, silent error suppression
- **σ** (stress loops) — circular dependencies, feedback traps
- **ρ** (healing) — recovery capacity, circuit breakers
- **Θ** (capacity) — real operating capacity vs. theoretical max

---

## Run locally

```bash
node tools/dst-scanner.js [path/to/file-or-directory]
```

Example:

```bash
node tools/dst-scanner.js demo/bad-code-test.js
```

---

## Tools

### `dst-scanner.js`

Analyzes source files for DST stress signals.

**Input:** File path or directory  
**Output:** Per-signal scores + overall DST score + verdict

### `dst-action.js`

GitHub Action wrapper for the DST scanner.

Run DST checks automatically on every pull request.

---

## Output format

```
=== DST Scanner Results ===

File: path/to/file.js

Signals detected:
  κ (masking)     : [LOW|MEDIUM|HIGH]
  σ (stress loops): [LOW|MEDIUM|HIGH]
  ρ (healing)     : [LOW|MEDIUM|HIGH]
  Θ (capacity)    : [LOW|MEDIUM|HIGH]

DST Score: X.XX / 1.00
Verdict: [description]
```

---

## Related

- [Demo](../demo/) — runnable test cases
- [Docs: Examples](../docs/examples/) — conceptual walkthroughs
- [Docs: Math](../docs/math/) — the formal model
