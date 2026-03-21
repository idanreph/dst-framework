[equations (3).md](https://github.com/user-attachments/files/26158894/equations.3.md)
# DST Equations — Level 2

*Seventeen equations. Read top to bottom — each follows from the previous.*

---

> **Core Identity:**
> Failure is not an event.
> It is the integral of unresolved stress under finite displacement capacity.

---

## Level 2 Upgrade Summary

```
Level 1:  κ scalar,  σ_eff = σ − κ
Level 2:  κ = κ_a + κ_c + κ_i,  σ_eff = σ − (κ_a + κ_c + κ_i)
          κ_obs decomposed: accumulated distorts most, intentional least
          Discrete-time form added for computational systems
```

---

## Core State Equations

**Eq. 1 — Tolerance as finite capacity**
```
Θ(t) = Θ₀ − D(t)
```
Real remaining tolerance equals initial capacity minus accumulated irreversible damage. Θ₀ is fixed. D(t) only increases. Θ(t) only decreases without active ρ.

**Eq. 2 — Damage evolution**
```
dD/dt = max(0, σ − ρ − (κ_a + κ_c + κ_i))
```
Damage accumulates when stress exceeds combined restoration and displacement capacity. Even when dD/dt = 0, Θ can decline if κ is compensating for inadequate ρ.

**Eq. 3 — Tolerance dynamics (operational core)**
```
dΘ/dt = −σ + ρ + κ_a + κ_c + κ_i
```
The rate of change of real capacity. This is the equation that governs all intervention decisions.

**Execution rule:**
```
If dΘ/dt < 0 while y(t) appears stable:
the system is in an observability gap.
Failure is being delayed, not avoided.
```

**Eq. 4 — Effective stress**
```
σ_eff(t) = σ(t) − κ_a(t) − κ_c(t) − κ_i(t)
```
What the system actually experiences after displacement.

---

## Discrete-Time Form (Code Systems)

For computational systems — codebases, software architectures, AI training pipelines — discrete-time form is more natural than continuous derivatives. Engineers think in sprints, commits, and releases.

**Eq. 3d — Discrete tolerance dynamics**
```
Θ_{t+1} = Θ_t + ρ_t − (σ_t − κ_t)
```

**Eq. 2d — Discrete damage accumulation**
```
D_{t+1} = D_t + max(0, σ_t − ρ_t − κ_t)
```

**Reading the discrete form:**
- Each sprint (t → t+1) either increases or decreases Θ
- A sprint that ships features (σ↑) without structural work (ρ low) decreases Θ
- A sprint that refactors (ρ↑) without adding complexity increases Θ
- Θ_{t+1} > Θ_t requires: ρ_t > σ_t − κ_t

**The PR-level question:**
Before merging, ask: does this change make Θ_{t+1} > Θ_t, equal, or less?
- Greater: genuine healing
- Equal: neutral (acceptable with documented κ_i)
- Less: structural debt being added — requires explicit justification

---

## Feasibility Conditions

**Eq. 5 — Survival vs health**
```
σ(t) ≤ ρ(t) + κ_a + κ_c + κ_i    [functional — surviving]
⟨σ⟩ ≤ ⟨ρ⟩                          [healthy — sustainable]
```
A system can be functional without being healthy. Most systems in Plastic and Late Plastic regime are functional but not healthy — surviving via displacement. The gap between these two conditions is the entire diagnostic space of DST.

**Eq. 6 — Intervention cost**
```
ΔΘ_future < 0  for any κ-dominant stabilization
```
Every κ-based stabilization borrows from future Θ.

---

## The κ-Decomposition (Level 2 Core — Equations 7–9)

**Eq. 7 — κ structure**
```
κ(t) = κ_a(t) + κ_c(t) + κ_i(t)

κ_a: accumulated displacement (reducible, convex cost)
κ_c: conscripted displacement (bounded below by κ_c_floor > 0)
κ_i: intentional displacement (optimal level, not minimized)
```

**Code-level κ mapping:**

| κ type | Code pattern | Rule |
|---|---|---|
| κ_a | Silent catches, TODOs, retries, implicit state mutations, `any` without reason | Eliminate |
| κ_c | WebGPU async chains, incomplete upstream types, external API constraints | Bound and instrument |
| κ_i | Documented shortcuts with expiration date and ticket | Document and expire |

**Eq. 8 — Component dynamics**
```
dκ_a/dt > 0  without intervention (grows with neglect)
dκ_a/dt < 0  with active refactoring

dκ_c/dt ≈ 0  (changes only if domain constraint changes)
κ_c ≥ κ_c_floor > 0

dκ_i/dt = chosen  (explicitly managed)
```

**Eq. 9 — Reducibility spectrum**
```
κ_a: fully reducible to 0
κ_c: reducible to κ_c_floor, not below
κ_i: optimized, not minimized
```

---

## κ-Closure (Equations 10–12)

**Eq. 10 — Total displacement bound**
```
0 ≤ κ_a + κ_c + κ_i ≤ κ_max    where κ_max < ∞
```
Total displacement is finite. Approaching κ_max via κ_c (structural constraint failing) is different from approaching it via κ_a (accumulated neglect). Same bound. Different intervention. Different urgency.

**Eq. 11 — Cumulative displacement budget and time-to-failure**
```
K(t) = ∫₀ᵗ κ(s) ds ≤ K_max

Time-to-failure integral:
∫₀^t_collapse [σ(τ) − ρ(τ)] dτ = κ_max
```
The system fails at the exact moment the accumulated area of unhealed stress equals the maximum displacement capacity. This allows prediction of failure while y(t) is still flat. The observable looks stable. The integral is filling.

**Eq. 12 — Feasible set contraction**
```
A(t) := {x ∈ X : s(x,t) ≤ Θ(t)}
Θ̇(t) ≤ 0  ⟹  A(t₂) ⊆ A(t₁) for t₂ ≥ t₁
```
As displacement accumulates, the set of states from which recovery is possible shrinks monotonically. Never grows spontaneously. Recovery requires active ρ.

**Code interpretation:**
As Θ → 0, the set of files that can be modified without cascading breakage shrinks. Eventually, no local modification is safe. Only global replacement remains. This is the rewrite crisis (see Proposition 5 in proofs.md).

---

## The Observability Gap (Equations 13–15)

**Eq. 13 — Observable output with structured corruption**
```
y(t) = h(Θ(t)) + κ_obs(t) + ε(t)

κ_obs(t) = α·κ_a(t) + β·κ_c(t) + γ·κ_i(t)   where α > β > γ ≥ 0
```
The observable is structurally corrupted. Not randomly noisy — systematically biased toward apparent stability.
- Accumulated displacement (κ_a) distorts observables most — surface presentation optimized over time
- Conscripted displacement (κ_c) distorts less — constraint is visible if you look
- Intentional displacement (κ_i) distorts least — documented and known

**Code interpretation:**
y(t) = your dashboard. Test pass rate, uptime, story points, velocity. These look fine. Θ(t) = actual structural capacity. These diverge when κ is active.

**Eq. 14 — Observability gap**
```
Gap(t) = y(t) − Θ(t)

ẏ(t) ≤ 0  while  Θ̇(t) < 0  simultaneously — theorem, not measurement error
```

**Eq. 15 — Observability cliff**
```
o*(t): point where ∂σ/∂o changes sign

Below o*: revealing truth reduces σ
Above o*: revealing truth increases σ
```
There exists a threshold above which revealing the true state triggers cascade rather than recovery. Falls as Θ falls.

---

## Terminal Conditions (Equations 16–17)

**Eq. 16 — Terminal inevitability**
```
lim sup (ρ + κ_a + κ_c + κ_i) < lim inf σ  ⟹  Θ(t) → 0
```
When combined restoration and displacement permanently falls below stress floor: failure is mathematically inevitable.

**Eq. 17 — Nonlinear transition near κ_max**
```
d²Θ/dt² < 0  when κ → κ_max and σ_eff → σ
```
When displacement is exhausted and stress is amplifying — the decline accelerates. This is why "sudden" collapses that were "years in the making" always feel disproportionate to the immediate trigger. The trigger didn't cause the collapse. It released what was already accumulated.

---

## Reading the Full Chain

```
Eq. 1–4:    What changes (Θ, D, σ_eff, tolerance dynamics)
Eq. 3d:     Discrete-time form for code systems
Eq. 5–6:    Survival vs health, intervention cost
Eq. 7–9:    κ decomposition — Level 2 core
Eq. 10–12:  Why displacement runs out
Eq. 13–15:  Why it looked fine (observability gap structure)
Eq. 16–17:  When and how it fails
```

**The five equations you need in practice:**
- **Eq. 3 / 3d**: Is dΘ/dt (or ΔΘ) positive or negative right now?
- **Eq. 5**: Is this system surviving or genuinely healthy?
- **Eq. 7**: What type of κ is this — fix, mitigate, or accept?
- **Eq. 14**: Why did it look stable while capacity was declining?
- **Eq. 17**: Why did the failure arrive faster than expected?

---

## Domain Mappings — Level 2

| Variable | Finance (2026) | Code | Biology | AGI |
|---|---|---|---|---|
| Θ | Settlement capacity | Architectural modifiability | Immune capacity | Alignment depth |
| D | Balance sheet fatigue | Technical debt | Cellular damage | Hallucination accumulation |
| σ | Funding stress | Feature pressure, N+1, scale | Tumor growth | Capability scaling |
| ρ | Real restructuring | Root cause refactoring | Tissue repair | Structural alignment |
| κ_a | Accumulated leverage | Silent catches, retries, TODOs | Aging damage | RLHF drift |
| κ_c | Repo plumbing (conscripted) | WebGPU constraints, upstream gaps | Tumor immune conscription | Evaluator bandwidth limit |
| κ_i | QE, rate policy | Documented shortcuts | Deliberate inflammation | Guardrails (chosen) |
| y(t) | VIX, yield curve | Tests green, velocity fine | Labs stable | Benchmark scores |
| Gap | 2y-3m held 3 years | 0/100 DST on working app | Tumor growing, patient fine | Looks aligned, structurally isn't |

---

## Computational Interpretation

| DST variable | Code system mapping |
|---|---|
| Θ | System modifiability — architectural capacity |
| D | Technical debt accumulation |
| σ | Feature pressure, scale, complexity |
| ρ | Refactoring, structural improvements |
| κ | Shortcuts, masking mechanisms |
| y(t) | Test pass rate, velocity, story points |

**Key identity:**
```
dΘ/dt = ρ − (σ − κ)
Θ_{t+1} = Θ_t + ρ_t − (σ_t − κ_t)  [discrete]
```

---

→ [proofs.md](proofs.md) — formal propositions
→ [physics-connections.md](physics-connections.md) — existing science connections
→ [SSRN 6434119](https://ssrn.com/abstract=6434119) — full derivations

---

*DST Framework · Idan Rephiah · 2026*
*ρ heals · κ hides · σ kills*
