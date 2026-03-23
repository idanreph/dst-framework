[dst-math-readme.md](https://github.com/user-attachments/files/26186164/dst-math-readme.md)
# Math & Formal Theory

The mathematical foundation of the Declining Stress Threshold framework.

> *"Failure is not an event. It is the integral of unresolved stress under finite displacement capacity."*

---

## The Core Equation

```
dΘ/dt = ρ − σ_eff
σ_eff = σ − (κ_a + κ_c + κ_i)
```

Three variables determine every system's trajectory:

| Variable | Name | Role |
|---|---|---|
| **σ** | Stress amplifier | Grows damage · scales with load |
| **ρ** | Restoration | Heals real capacity · always bounded |
| **κ** | Displacement | Hides damage · finite budget |
| **Θ** | Real capacity | What remains after net effect |

**Key insight:** κ is not healing. It is borrowing. Every unit of κ consumed is capacity that cannot be recovered — only the damage it was hiding becomes visible when κ runs out.

---

## The Four Documents

### [`axioms.md`](./axioms.md)
Six foundational axioms. The logical bedrock of DST.

- **Axiom I** — Stress accumulation is monotonic
- **Axiom II** — Restoration is always bounded (ρ < ρ_max)
- **Axiom III** — Displacement is finite (κ < κ_max)
- **Axiom IV** — Feasible set contracts under persistent stress
- **Axiom V** — Observable stability does not imply structural health
- **Axiom VI** — Observability corruption is structured, not random *(first-class)*

Axiom VI is the one that changes everything. It says the gap between what you measure and what is real is not noise — it is mechanically produced by κ. Your metrics are not wrong by accident. They are wrong by structure.

---

### [`equations.md`](./equations.md)
17 equations. From the core identity through Level 2 κ decomposition.

Key equations:

```
Eq. 3:  dΘ/dt = −σ + ρ + κ        (core trajectory)
Eq. 4:  σ_eff = σ − κ_obs          (effective stress after masking)
Eq. 9:  κ = κ_a + κ_c + κ_i       (Level 2 decomposition)
Eq. 14: Gap = Θ_apparent − Θ_real  (observability gap)
```

The Level 2 decomposition (Eq. 9) is the upgrade from V3 to V4. It separates displacement into three types — each with a different intervention:

| Type | Name | Intervention |
|---|---|---|
| **κ_a** | Accumulated | FIX — fully reducible |
| **κ_c** | Conscripted | MITIGATE — domain forces it |
| **κ_i** | Intentional | ACCEPT — document and expire |

---

### [`proofs.md`](./proofs.md)
Five propositions. Formally proved from the axioms.

- **Proposition 1** — Feasible Set Contraction
- **Proposition 2** — Observability Gap Is Mechanical *(confirmed March 2026)*
- **Proposition 3** — Conservation of Masked Stress (First Law connection)
- **Proposition 4** — AGI Deceptive Alignment as DST Theorem
- **Proposition 5** — Rewrite Inevitability *(the one the V4 scanner triggers)*

Proposition 5 is what the scanner uses when it says "local modification is becoming infeasible." It is not a heuristic. It is a proved theorem: when Θ → 0, the admissible set of safe local modifications collapses. Structural replacement is the only mathematically indicated intervention.

---

### [`physics-connections.md`](./physics-connections.md)
DST as a universal law across domains.

Eleven sections mapping DST to established science:

1. Newton as memoryless special case — F = Θ(t) · a(t)
2. Thermodynamics — Second Law for managed systems
3. Dynamical systems — moving feasible manifold
4. Information theory — active structured corruption
5. Complexity science — κ-exhaustion drives criticality
6. Control theory — stabilization consumes authority
7. Ecology — stability-resilience bridge
8. Darwin / Evolution — natural selection as DST system
9. Software — best DST proof domain (observable, controllable, fast)
10. Universal domain matrix
11. Clay Millennium problems — reframed through finite-κ lens

**Two physical lab tests validated:**

*Heat exchanger:* Phase change is κ_c — domain-forced thermal displacement. When latent heat exhausts, temperature spikes nonlinearly. The cliff is not gradual. Same equation as codebase failure.

*Spring-damper:* Damper is κ — absorbs load σ while spring fatigue accumulates. When damper saturates, displacement collapses suddenly. Looked fine until it didn't.

---

## The Observability Gap — Why It Matters

The gap between apparent health and real capacity is the central measurement:

```
Apparent = 100 + σ_impacts only (κ excluded — κ IS the masking)
Real (Θ) = 100 + all impacts including κ
Gap      = max(0, Apparent − Θ)
```

**Three confirmed directions from real scans:**

| System | Θ | Apparent | Gap | Direction |
|---|---|---|---|---|
| web-llm-chat | 0 | 100 | +100 | Metrics lie upward — extreme |
| Log4j pre-CVE | 8 | 92 | +84 | Metrics lie upward — $10B disaster |
| Express | 0 | 20 | +20 | Metrics lie upward — 15yr accumulation |
| Next.js | 65 | 80 | +15 | Metrics lie upward — Plastic balance |
| React | 100 | 15 | −85 | Metrics lie downward — inverted |

The React case is the rarest finding: inverted gap. 9,394 ρ signals compensate 4,465 κ findings so completely that the surface metrics look worse than the structural reality. Axiom VI confirmed in both directions.

---

## The Dempster-Shafer Connection

Dempster-Shafer theory (also abbreviated DST) is a mathematical framework for reasoning under uncertainty — combining evidence from different sources to arrive at a degree of belief when observable signals are incomplete or conflicting.

They built mathematics for handling the gap between what you observe and what is real.

They never found the mechanism that creates the gap.

That mechanism is κ.

Their initials spelled the framework that would have explained what they were building. They got 5% of the picture. The other 95% is Axiom VI.

---

## Published Papers

- **SSRN 6434119** — DST Framework (general law) · [ssrn.com/abstract=6434119](https://ssrn.com/abstract=6434119)
- **SSRN 6434258** — Financial systems diagnosis · [ssrn.com/abstract=6434258](https://ssrn.com/abstract=6434258)

Both timestamped March 17, 2026. Both anchored to XRPL blockchain.

Macro confirmation: 2y-3m yield spread crossed zero March 20, 2026 — three days after publication.

---

*ρ heals · κ hides · σ kills*
