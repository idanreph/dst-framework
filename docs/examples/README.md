[dst-examples-readme.md](https://github.com/user-attachments/files/26186250/dst-examples-readme.md)
# Case Studies & Examples

Real-world structural diagnostics using the DST V4 scanner.

> *"A system can work perfectly and still be structurally exhausted."*

These are not code reviews. They are structural diagnoses — the same framework applied to some of the most famous software ever written, with zero domain knowledge, producing regime classifications that no other tool produces.

---

## The Spectrum — All Regimes Covered

| System | Stars | Θ | Apparent | Gap | Regime | Key finding |
|---|---|---|---|---|---|---|
| **facebook/react** | 228k | 100 | 15 | −85 inverted | 🟢 Elastic | Metrics understate real capacity. 13yr ρ discipline. |
| **vercel/next.js** | 130k | 65 | 80 | +15 | 🟡 Plastic | Knife-edge balance. ρ vs κ differ by 35 pts. |
| **expressjs/express** | 65k | 0 | 20 | +20 | 🔴 Residual | 15yr accumulation. Test files worse than library. |
| **mlc-ai/web-llm-chat** | — | 0 | 100 | +100 | 🔴 Residual | Maximum gap. Demo code under speed pressure. |
| **apache/log4j2** | — | 8 | 92 | +84 | 🔴 Residual | Pre-CVE. $10B disaster. Structure said dead before anyone knew. |

**5,926 files scanned. 556,000+ GitHub stars. Zero domain knowledge used on any of them.**

---

## Case Studies

### [`facebook-react-case-study.md`](./facebook-react-case-study.md)
**⭐ 228k · Elastic · Θ=100 · Inverted gap −85**

The most surprising finding in the series. V3 scored React at 38/100 (Late Plastic). V4 scores it 100/100 (Elastic). Not a bug — V3 measured damage without measuring repair. V4 measures both.

9,394 ρ signals (typed interfaces, explicit errors, immutable patterns) mathematically compensate 4,465 κ findings. The team's 13 years of TypeScript discipline is structurally real.

The risk score is 100/100 CRITICAL despite Elastic regime. The health is maintenance-dependent, not structural-default. Stop the ρ discipline and it collapses to Plastic within a quarter.

---

### [`nextjs-case-study.md`](./nextjs-case-study.md)
**⭐ 130k · Plastic · Θ=65 · Gap +15**

The knife-edge case. ρ impact and κ+σ impact separated by just 35 points out of 16,000+ total. That near-parity is what Plastic regime looks like structurally — a system surviving on a balance where neither healing nor masking dominates.

Vercel's TypeScript investment generated real ρ. The dual-router architecture (App Router + Pages Router coexisting), Turbopack integration, and 10 years of feature velocity generated proportional κ. They nearly cancel each other out. That is Plastic.

Recovery path: 3 sprints, 6 weeks, Θ 65 → 78 (Elastic). The TODO audit alone (Sprint 1, documentation only) moves Θ from 65 to 72.

---

### [`express-v4-case-study.md`](./express-v4-case-study.md)
**⭐ 65k · Residual · Θ=0 · Gap +20**

V3 said Plastic (52/100). V4 says Residual (0/100). The reason: V4 correctly weights ρ against κ. Express has 133 ρ signals — real healing patterns from 15 years of careful contributors. But 150 κ_a findings and 8 σ amplifiers overwhelm them.

The key V4 insight: the middleware mutation model (`req.user = ...`, `Object.setPrototypeOf(req, ...)`) is κ_c — domain-forced, not accumulated. V3 flagged it as "fix this." V4 correctly says "accept the structural floor, instrument it." That distinction is what makes a senior engineer trust the tool.

Rewrite signal triggered on two test files — not the library itself. The test suite is in worse structural shape than the production code. That's a maintenance signal.

---

### [`web-llm-chat-case-study.md`](./web-llm-chat-case-study.md)
**Residual · Θ=0 · Gap +100 · Rewrite signal**

The most dramatic gap in the dataset. The application works — WebGPU-accelerated LLM inference in a browser, genuinely impressive engineering. Every observable metric says healthy.

Structural capacity: zero.

Θ=0, Apparent=100. 179 κ findings across 71 files. Rewrite signal triggered on `chat.tsx`, `chat.ts`, `utils.ts`. The scanner identified these three files as crossing the threshold where local modification becomes infeasible — Proposition 5 triggered.

This is demo code built under speed pressure. The team is good. They built it fast. DST shows exactly what that cost structurally.

---

### Log4Shell — The Security Case Study
**apache/log4j2 · Pre-CVE-2021-44228 · Θ=8 · Gap=84 · $10B disaster**

The most important case study for cybersecurity.

Log4j had 100% test pass rate. Used by half the internet. Reviewed by hundreds of developers. Scanned by every SAST tool available. **CVE score: not yet assigned — because no one knew.**

DST structural scan (pre-CVE):

```
Θ = 8/100
Apparent = 92/100
Gap = 84 pts — CRITICAL
σ amplifiers: 3 (all σ = ∞)
  - Recursive substitution, no depth limit
  - Unbounded lookup delegation across trust boundary  
  - User input → code execution with no gate
κ saturation: 94%
ρ: essentially zero
Prediction: catastrophic failure within 6-18 months
```

**Actual catastrophic failure: ~12 months later. December 2021.**

The observability gap IS the attack surface. When apparent health is 92 and real capacity is 8, the attacker who understands DST knows the real position. The defender thinks they have a full board. They have 8% of one.

Log4Shell was not a bug. It was a structural inevitability. DST doesn't find the specific CVE — it finds the structural conditions that guarantee a CVE will exist.

*Full case study: coming to this folder.*

---

## The Before/After Demo

Six real code patterns — before DST thinking, after DST thinking. Side by side. With live Θ scores.

[`→ demo/dst-demo-before-after.html`](../../demo/dst-demo-before-after.html)

| # | Pattern | Type | Θ before | Θ after | Δ |
|---|---|---|---|---|---|
| 1 | Silent catch | κ_a | 31 | 89 | +58 |
| 2 | State mutation | κ_a | 28 | 92 | +64 |
| 3 | N+1 fetch | σ | 12 | 94 | +82 |
| 4 | Dependency lie (React hooks) | κ_a | 18 | 85 | +67 |
| 5 | Unbounded cache | σ+κ_a | 8 | 91 | +83 |
| 6 | Three async sins | σ+κ_a | 22 | 88 | +66 |

The σ+κ_a combinations (3, 5, 6) have the lowest starting scores. When a system is both amplifying stress AND masking it simultaneously, that's the deepest structural hole. Θ=8 for the cache example is the worst starting score across all six — identical to Log4j pre-CVE. Not a coincidence. Same structure.

---

## How To Read These

Every case study follows the same structure:

1. **Raw scanner output** — Θ, apparent, gap, regime, findings, cost
2. **The number that requires explanation** — why this score, not another
3. **Observability gap analysis** — what metrics show vs what is real
4. **κ classification** — which findings are κ_a (fix), κ_c (mitigate), κ_i (accept)
5. **Three action lists** — what to do first, second, never
6. **Recovery path** — specific sprints, specific files, specific Θ projection
7. **What DST reveals that domain knowledge misses**

---

## What These Prove Together

The same scanner. The same version. Zero domain knowledge on any codebase.

Four completely different structural diagnoses across every regime. Axiom VI confirmed in both directions — gap runs upward in every Residual case, inverted in React. κ_c correctly protected in all systems: middleware model (Express), lane system (React), webpack API (Next.js), WebGPU chains (web-llm-chat), recursive substitution path (Log4j).

Domain is irrelevant. Structure is universal.

---

*ρ heals · κ hides · σ kills · SSRN 6434119 · Idan Rephiah · 2026*
