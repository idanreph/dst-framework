# Demo

Runnable tests and examples for the DST framework.

> For conceptual explanations, see [/docs/examples](../docs/examples/).

## Contents

| File | Description |
|------|-------------|
| `bad-code-test.js` | Sample codebase with known DST stress patterns |
| `run-test.sh` | Shell script to run the DST scanner against the test input |
| `expected-output.txt` | What the scanner should output for the bad-code-test |

## Run locally

```bash
# Clone the repo
git clone https://github.com/idanreph/DST-framework
cd DST-framework

# Run the demo
bash demo/run-test.sh
```

## What to expect

The scanner will detect:
- κ (masking) — hidden stress
- σ (stress loops) — circular dependencies
- ρ (healing) — recovery capacity
- Θ (capacity) — real operating capacity

Compare the output to `expected-output.txt` to verify your setup is working.
