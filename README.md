

````markdown
# DST Framework — Declining Stress Threshold

**Live site:** https://idanreph.github.io/dst-framework/  
**Live demo:** https://idanreph.github.io/dst-framework/demo.html

> **Your system isn’t failing because you’re a bad engineer.**  
> **It’s failing because the structure allows damage to hide.**

DST is a **structural diagnostics framework + CI tool** for software systems.

It measures:

- **Θ (theta)** — real remaining capacity
- **κ (kappa)** — masking / hidden structural burden
- **σ (sigma)** — stress amplification loops
- **ρ (rho)** — real structural healing

---

## What DST Actually Does

Add DST to your repo and every pull request can be evaluated for **structural impact**, not just style or correctness.

You do not just get “code quality.”

You get a structural read of the system:

```text
Θ = 42/100  → Plastic

Apparent = 71  → Gap = 29 ⚠️

💰 Cost of masking: $2.1M/year
⚠️ Stability is being maintained artificially (κ)
📉 dΘ/dt = -2.3 per PR → Declining

🟥 Structural replacement may become necessary soon
````

> This is not a linter.
> This is a **capacity measurement system for software**.

---

## Install (60 seconds)

```bash
cp tools/dst-scanner.js ./
cp tools/dst-action.js ./

mkdir -p .github/workflows
cp .github/workflows/dst-diagnostic.yml .github/workflows/

git add . && git commit -m "Add DST diagnostic" && git push
```

Next PR → DST runs structural analysis.

---

## The Model

```text
dΘ/dt = ρ − (σ − κ)
```

Where:

* **σ (stress)** → amplifiers that make failure scale faster
* **ρ (healing)** → real structural improvement
* **κ (masking)** → stabilizers that hide damage without removing it
* **Θ (capacity)** → how much change the system can still absorb

### Key insight

> A system can look stable while actually collapsing.

This is the **observability gap**:

```text
Apparent ≠ Real
```

DST is built to measure that gap.

---

## The Four Regimes

| Θ Range | Regime          | Reality                                               |
| ------: | --------------- | ----------------------------------------------------- |
|  75–100 | 🟢 Elastic      | Structure dominates. Fast, safe change.               |
|   50–74 | 🟡 Plastic      | System still works, but balance is fragile.           |
|   25–49 | 🟠 Late Plastic | Costs rise fast. Breakage becomes likely.             |
|    0–24 | 🔴 Residual     | Masking dominates. Structural replacement approaches. |

---

## What DST Detects

### κ — masking (hidden debt)

* Silent error handling
* Retry logic that hides failure
* TODO / HACK accumulation
* Implicit state mutation
* “It works for now” code paths

### σ — stress amplification

* Circular dependencies
* N+1 patterns
* Unbounded growth
* Hidden fan-out
* Failure multiplication loops

### ρ — healing structure

* Pure functions
* Explicit boundaries
* Immutable state
* Observable failure surfaces
* Bounded, reversible behavior

---

## Why This Matters

Most teams feel this long before they can explain it:

* features slow down every sprint
* bugs multiply
* onboarding gets harder
* “quick fixes” make future work worse
* stability starts to feel expensive

DST turns that into:

> **measurable capacity, trajectory, and cost**

---

## Real-World Results

DST v4.5-final has been applied to major systems:

```text
React         → Θ ~100 → Elastic
Next.js       → Θ ~65  → Plastic
Log4Shell     → Θ ~8   → Residual
Express       → Θ ~0   → Residual
web-llm-chat  → Θ ~0   → Residual
```

See: `docs/examples`

---

## v4.5-final Adds

DST v4.5-final keeps the same structural math while adding stronger enforcement and measurement:

1. **κ_i expiration contracts**
   Transitional complexity can be annotated with:

   ```text
   @dst-kappa-i: expires YYYY-MM-DD
   ```

   and tracked through CI.

2. **σ environment scaling**
   `DST_DATA_SCALE` changes amplifier weight by deployment context:

   ```text
   small x0.5 · medium x1.0 · large x2.0 · hyperscale x4.0
   ```

3. **AST-assisted engine**
   AST-powered N+1 and silent-catch detection run alongside regex where supported.

4. **ΔΘ gate logic**
   PRs can be evaluated not only by score, but by **trajectory**.

---

## DST Compass

DST Compass is the interactive diagnostic layer for the framework.

It translates the model into guided structural diagnosis for humans:

* regime detection
* contradictions / gaps
* confidence analysis
* challenge synthesis
* report generation
* hashable diagnostic output

Compass is the human-facing side of the same framework:
**scanner for code, Compass for systems thinking.**

---

## Repo Structure

* `tools/` → scanner + GitHub Action
* `.github/workflows/` → CI workflow
* `docs/examples/` → real-world case studies and rescans
* `docs/math/` → axioms, equations, proof spine
* `docs/pitch/` → engineering / CTO explanations
* `docs/research/` → theory and related papers
* `docs/index.html` → live site entry
* `docs/demo.html` → live demo / runnable page

---

## The Theory

DST is not just a code tool. It is a general law for constrained dynamic systems.

Related theory work:

* **SSRN 6434119** — core DST framework
* **SSRN 6434258** — financial system application

The software scanner is one application of the wider theory.

---

## Origin

DST started from a macro observation:

> systems that appeared stable while their real capacity was declining.

That logic turned out to apply far beyond finance:

* codebases
* AI systems
* organizations
* biological systems
* engineered systems under hidden load

See the theory site and research docs for the formal model.

---

## What Happens Next

Run it on your repo.

If it’s wrong, you’ll ignore it.
If it’s right, you won’t be able to unsee it.

---

## Contributing

Found a missed pattern?
Improved a detector?
Want to refine the math or CI behavior?

Open an issue or contribute directly.

---

## License

No license yet.

The framework is published and timestamped.

Use it. Break it. Improve it.

---

**ρ heals · κ hides · σ kills**

```



