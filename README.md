# DST Framework — Declining Stress Threshold

> **Your system isn’t failing because you’re a bad engineer.**
> **It’s failing because the structure allows damage to hide.**

DST is a **structural diagnostics framework + CI tool** that measures:

* **Θ (theta)** — real remaining capacity
* **κ (kappa)** — masking (technical debt that hides, not fixes)
* **σ (sigma)** — stress amplification loops
* **ρ (rho)** — real structural healing

---

## ⚡ What This Actually Does

Add DST to your repo → every pull request gets analyzed.

You don’t just see “code quality”.

You see **structural reality**:

```text
Θ = 42/100  → Plastic

Apparent = 71  → Gap = 29 ⚠️

💰 Cost of masking: $2.1M/year  
⚠️ Stability is being maintained artificially (κ)  
📉 dΘ/dt = -2.3 per PR → Declining  

🟥 Structural replacement may become necessary soon
```

---

> This is not a linter.
> This is a **capacity measurement system for software**.

---

## 🚀 Install (60 seconds)

```bash
cp tools/dst-scanner.js ./
cp tools/dst-action.js ./

mkdir -p .github/workflows
cp .github/workflows/dst-diagnostic.yml .github/workflows/

git add . && git commit -m "Add DST diagnostic" && git push
```

Next PR → full structural analysis.

---

## 🧠 The Model

```text
dΘ/dt = ρ − (σ − κ)
```

* **σ (stress)** → things that amplify problems
* **ρ (healing)** → real structural improvement
* **κ (masking)** → hides damage, doesn’t remove it
* **Θ (capacity)** → how much change the system can still absorb

---

### 🔍 Key insight

> A system can look stable while actually collapsing.

This is the **observability gap**:

```text
Apparent ≠ Real
```

---

## 🔥 The Four Regimes

| Θ Range | Regime          | Reality                                 |
| ------- | --------------- | --------------------------------------- |
| 75–100  | 🟢 Elastic      | Structure dominates. Fast, safe change. |
| 50–74   | 🟡 Plastic      | Works, but balance is fragile.          |
| 25–49   | 🟠 Late Plastic | Costs rising fast. Breakage likely.     |
| 0–24    | 🔴 Residual     | Masking dominates. Rewrite approaching. |

---

## 🔍 What DST Detects

### κ — masking (hidden debt)

* Silent error handling
* Retry loops hiding failure
* TODO / HACK accumulation
* Implicit state mutation
* “It works” code paths

---

### σ — stress (amplifiers)

* Circular dependencies
* N+1 queries
* Unbounded growth patterns

---

### ρ — healing (real structure)

* Pure functions
* Explicit boundaries
* Immutable state
* Observable failures

---

## 💰 Why This Matters

Most teams feel this, but can’t measure it:

* features slow down every sprint
* bugs multiply
* onboarding gets harder
* quick fixes make things worse

---

DST turns that into:

> **measurable capacity, trajectory, and cost**

---

## 📊 Real-World Results

DST applied to major systems:

```text
React     → Θ ~100 → Elastic
Next.js   → Θ ~65  → Plastic
Log4j     → Θ   8  → Residual (predicted CVE-2021-44228)
Express   → Θ ~0   → Residual
```

→ See `/examples`

---

## 📂 Repo Structure

* `/tools` → scanner + GitHub action
* `/examples` → real-world case studies
* `/docs/math` → axioms + equations
* `/docs/pitch` → engineering + CTO explanations
* `/demo` → runnable examples

---

## 📄 The Theory

* SSRN 6434119 — full DST framework
* SSRN 6434258 — financial system application
* DST Compass — interactive diagnostic

---

## 🧠 Origin

DST started from a macro anomaly:

> Systems that appeared stable while their real capacity declined.

It turned out to apply to:

* codebases
* companies
* AI systems
* biological systems

→ See `MEMO.md`

---

## ⚡ What Happens Next

Run it on your repo.

If it’s wrong → you’ll ignore it.
If it’s right → you won’t be able to unsee it.

---

## Contributing

Found a missed pattern? Improved detection? Better math?

→ CONTRIBUTING.md

---

## License

No license. The framework is published and timestamped.

Use it. Break it. Improve it.

---

ρ heals · κ hides · σ kills
