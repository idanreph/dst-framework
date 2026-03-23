# Examples

Real-world applications of **DST (Declining Stress Threshold)** across major codebases.

These are not demos.

> These are **structural diagnostics of real systems**.

Each case study applies the same model — measuring **Θ (capacity), κ (masking), σ (stress), and ρ (healing)** — to determine whether a system is:

* 🟢 **Elastic** — structure dominates (high capacity)
* 🟡 **Plastic** — balance is fragile (knife-edge)
* 🔴 **Residual** — masking dominates (system exhausted)

---

## 📊 System Spectrum

The same model, applied to real-world repositories:

```text
React     → Θ ~100 → Elastic
Next.js   → Θ ~65  → Plastic
Log4j     → Θ   8  → Residual (84 pt gap — CVE-2021-44228)
Express   → Θ ~0   → Residual
```

> DST does not give the same answer to every system.
> It reveals where each system actually stands.

---

## 📁 Case Studies

| File                           | Summary                                                                                                             |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `facebook-react-case-study.md` | ⭐ 228k stars · **Elastic regime (Θ ~100)** · structure dominates · inverted observability gap · strong ρ discipline |
| `nextjs-case-study.md`         | ⭐ 130k stars · **Plastic regime (Θ 65)** · 15 pt gap · dual-router κ · corporate scale balance (ρ vs κ)             |
| `express-v4-case-study.md`     | ⭐ 65k stars · **Residual regime (Θ ~0)** · masking dominates · rewrite signal · structural exhaustion               |
| `web-llm-chat-case-study.md`   | AI demo system · **Residual (Θ 0)** · 100 pt gap · extreme masking under demo pressure                              |
| `log4shell-case-study.md`      | 🔥 Apache Log4j · **Residual (Θ 8)** · 84 pt gap · CVE-2021-44228 · $10B+ security disaster predicted by structure |
| `real-world.md`                | 🔥 Minimal example · before/after DST application · fastest way to understand the model                             |
| `express-codebase.md`          | Short summary + entry point into full Express analysis                                                              |

---

## 🧠 How to read these

Each case study follows the same structure:

1. **System overview** — what the codebase does
2. **DST scan** — Θ, κ, σ, ρ measured
3. **Observability gap** — what appears vs what is real
4. **Regime classification** — Elastic / Plastic / Residual
5. **Structural analysis** — where stress and masking exist
6. **Action path** — fix / mitigate / accept
7. **ROI** — cost of κ and recovery potential

---

## ⚠️ Important

These analyses are:

* **Structural**, not stylistic
* **Predictive**, not just descriptive
* **Not statements about runtime correctness**

> A system can work perfectly and still be structurally exhausted.

---

## 🚀 Where to start

👉 Start with [`real-world.md`](./real-world.md)

Then compare:

* React → Elastic
* Next.js → Plastic
* Express → Residual
* Log4j → Residual (security failure predicted)

That contrast is the model.

---

ρ heals · κ hides · σ kills
