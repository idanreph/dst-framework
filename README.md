# DST Framework — Declining Stress Threshold

**Your system isn’t failing because you’re bad at your job.**
**It’s failing because the structure allows damage to hide.**

DST is a framework + tool that detects:

* Hidden technical debt (κ)
* Stress amplification loops (σ)
* Real system capacity (Θ)
* The difference between healing (ρ) and masking (κ)

---

## ⚡ What This Actually Does

Install DST in your repo → every pull request gets analyzed.

You see:

```
DST Score: 42/100 [Plastic]

💰 Cost of masking: $2.1M/year  
🔒 Security risk: HIGH  
⏱️ Uptime impact: -0.8%  

⚠️ Stability is being maintained artificially (κ).
```

This is not a lint tool.
This is a **structural diagnosis of your system.**

---

## 🚀 Install (60 seconds)

```bash
cp tools/dst-scanner.js ./
cp tools/dst-action.js ./

mkdir -p .github/workflows
cp .github/workflows/dst-diagnostic.yml .github/workflows/

git add . && git commit -m "Add DST diagnostic" && git push
```

Next PR → full analysis.

---

## 🧠 The Model

```
dΘ/dt = ρ − σ_eff
```

* **σ (sigma)** — stress loops that amplify problems
* **ρ (rho)** — real healing (always limited)
* **κ (kappa)** — masking (hides damage, does not fix it)
* **Θ (theta)** — real remaining capacity

**Key insight:**

> A system can look stable while actually collapsing.

This is the **observability gap**.

---

## 🔥 The Four Regimes

| Score  | Regime          | Reality                           |
| ------ | --------------- | --------------------------------- |
| 75–100 | 🟢 Elastic      | Real health. Fast development.    |
| 50–74  | 🟡 Plastic      | Works via masking. Hidden decay.  |
| 25–49  | 🟠 Late Plastic | Cost rising fast. Fragility high. |
| 0–24   | 🔴 Residual     | Collapse delayed, not avoided.    |

---

## 🔍 What DST Detects

### κ — masking patterns

* Retry loops hiding instability
* Silent error swallowing
* God functions
* TODO/HACK accumulation
* Implicit state mutation

### σ — stress loops

* N+1 queries
* Unbounded memory growth

### ρ — real health

* Pure functions
* Immutable state
* Explicit error handling

---

## 💰 Why This Matters

Most teams feel this but cannot quantify it:

* Features take longer every sprint
* Bugs multiply
* Onboarding slows down
* “Quick fixes” make things worse

DST shows:

> **exactly how much this costs you — in dollars and time**

---

## 📂 Repo Structure

* `/tools` → scanner + GitHub action
* `/docs/pitch` → explanations for engineers / CTOs
* `/docs/math` → axioms + equations
* `/docs/research` → macro + system analysis
* `/demo` → runnable examples

---

## 📄 The Theory

* SSRN 6434119 — full framework
* SSRN 6434258 — financial system application
* DST Compass — interactive diagnostic

---

## 🧠 The Discovery

DST started from a macro anomaly:

> Systems that appeared stable while their real capacity declined.

What began in financial markets turned out to apply to:

* codebases
* companies
* AI systems
* biological systems

→ Read: MEMO.md

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

**ρ heals · κ hides · σ kills**
