# DST v4.5 Final Rescan — facebook/react

**DST V4.5 Diagnostic — Live Scan Results**  
*Scanned March 2026 · DST Framework v4.5-final · SSRN 6434119*  
*Repository: react main · Commit ed69815 · 4,202 source files*

---

> *"The stability you see is not real — it is borrowed."*  
> *(Elastic regime. React is genuinely healthy — the numbers explain why.)*

---

## Overview

This is the DST v4.5-final rescan of facebook/react. The V4 scan ran on react v19.3.0 (1,864 files) and placed the repository at **100/100 (Elastic)**. An earlier v4.5 pass (`react-v45-rescan.md`) was recorded against the same commit using a pre-final scanner build — that file is preserved as a historical record. This document is the v4.5-final scan: same commit (`ed69815`, main branch, 4,202 JS/TS source files), same structural math, final scanner output.

DST v4.5 adds three capabilities on top of v4:
1. **κ_i expiration contracts** — `@dst-kappa-i: expires YYYY-MM-DD` annotations tracked and enforced by CI
2. **σ environment scaling** — `DST_DATA_SCALE` scales σ amplifier weight: `small ×0.5 · medium ×1.0 · large ×2.0 · hyperscale ×4.0`
3. **AST parallel engine** — Babel-powered N+1 and silent-catch detection runs alongside regex when `@babel/parser` is available

The V4 scan established the structural baseline: Θ=100, Elastic, inverted observability gap of −85 (metrics understate capacity). V4.5-final runs the same codebase through the new capabilities to confirm what changes, what doesn't, and what the three new features mean for a codebase firmly in the Elastic regime.

---

## Run 1 — Standard (DST_DATA_SCALE=medium, default)

```
DST_SCAN_DIR=/tmp/react-scan node tools/dst-action.js
```

*(Internally: `DST_DATA_SCALE=medium` — σ scale ×1.0, default)*

```
══════════════════════════════════════════════════
  DST DIAGNOSTIC — v4.5-final
══════════════════════════════════════════════════

  Θ (real capacity):  100/100
  Apparent health:    15/100
  Observability gap:  ⚠️  −85 pts — Metrics UNDERSTATE real capacity (inverted gap)
  Regime:             Elastic
  dΘ/dt:              first scan
  Risk:               100/100 [CRITICAL]
  κ saturation:       100%
  σ_eff:              4.8 (19.2 stress units hidden by κ)
  Findings:           κ:5728 σ:24 ρ:13483 🔒:15

  🟢 ELASTIC REGIME — STRUCTURE DOMINATES
    • ρ signals (13,483) outnumber κ findings (5,728) by 2.4:1
    • σ_eff absorbed completely by ρ healing — no regime pressure
    • Inverted gap: observable metrics undercount real capacity by 85 pts
  → MAINTAIN ρ discipline. 13yr typing, immutability, and error-handling investment
    is the structural asset. Guard it.

  🔴 RESOLVE FIRST — σ amplifiers:
     1. unbounded growth (22x)
     2. n plus one (2x)

  🔴 FIX — κ_a accumulated (9 total):
     1. implicit state (3098x · -27882 pts)
     2. god function (539x · -5390 pts)
     3. deep nesting (702x · -4212 pts)
     4. todo comment (821x · -2463 pts)
     5. large file (353x · -2118 pts)

  ρ heals · κ hides · σ kills
  SSRN 6434119 · Idan Rephiah · 2026
══════════════════════════════════════════════════
```

---

## Run 2 — Hyperscale (DST_DATA_SCALE=hyperscale, σ × 4.0)

```
DST_DATA_SCALE=hyperscale DST_SCAN_DIR=/tmp/react-scan node tools/dst-action.js
```

*(Internally: `DST_DATA_SCALE=hyperscale` — σ scale ×4.0)*

```
══════════════════════════════════════════════════
  DST DIAGNOSTIC — v4.5-final
══════════════════════════════════════════════════

  Θ (real capacity):  100/100
  Apparent health:    15/100
  Observability gap:  ⚠️  −85 pts — Metrics UNDERSTATE real capacity (inverted gap)
  Regime:             Elastic
  dΘ/dt:              first scan
  Risk:               100/100 [CRITICAL]
  κ saturation:       100%
  σ_eff:              4.8 (19.2 stress units hidden by κ)
  Findings:           κ:5728 σ:24 ρ:13483 🔒:15

  🟢 ELASTIC REGIME — STRUCTURE DOMINATES
    • ρ signals (13,483) outnumber κ findings (5,728) by 2.4:1
    • σ_eff absorbed completely by ρ healing — no regime pressure
    • Inverted gap: observable metrics undercount real capacity by 85 pts
  → MAINTAIN ρ discipline. 13yr typing, immutability, and error-handling investment
    is the structural asset. Guard it.

  🔴 RESOLVE FIRST — σ amplifiers:
     1. unbounded growth (22x)
     2. n plus one (2x)

  🔴 FIX — κ_a accumulated (9 total):
     1. implicit state (3098x · -27882 pts)
     2. god function (539x · -5390 pts)
     3. deep nesting (702x · -4212 pts)
     4. todo comment (821x · -2463 pts)
     5. large file (353x · -2118 pts)

  ρ heals · κ hides · σ kills
  SSRN 6434119 · Idan Rephiah · 2026
══════════════════════════════════════════════════
```

### Why the two runs produce identical output

The output is identical because React's Θ is pinned at 100 by ρ-dominance regardless of σ scaling.

`DST_DATA_SCALE` scales the **score impact** of each individual σ finding:

| Scale | σ impact per finding | 24 σ findings total |
|-------|---------------------|---------------------|
| medium (×1.0) | −15 pts | −360 pts |
| hyperscale (×4.0) | −60 pts | −1,440 pts |

React's ρ healing offsets that penalty completely. At 13,483 ρ signals (~+4 pts each ≈ +53,932 pts) versus 5,728 κ findings (~−9 pts avg ≈ −51,552 pts), the net score before clamping is well above 100 in both cases. `Math.min(100, score)` clamps the result to 100.

`σ_eff` is computed from raw counts and is not affected by `DST_DATA_SCALE` — hence `4.8` is unchanged between runs.

**Where hyperscale matters:** codebases sitting between Θ 30–80, where σ findings could push the score across a regime boundary. For React, the scale flag is a correctness lever for future checks — not a current differentiator.

---

## V4 vs V4.5-final Comparison Table

| Metric | V4 (March 2026, v19.3.0) | V4.5-final (March 2026, main ed69815) | Change |
|--------|--------------------------|---------------------------------------|--------|
| Files scanned | 1,864 | 4,202 | +2,338 (+125%) — scanner now reaches more of monorepo |
| Θ (real capacity) | 100/100 | 100/100 | Unchanged |
| Regime | Elastic | Elastic | Unchanged |
| κ findings | 4,465 | 5,728 | +1,263 (+28%) |
| σ findings | 8 | 24 | +16 (+200%) — wider scan surface exposed more amplifiers |
| ρ findings | 9,394 | 13,483 | +4,089 (+44%) |
| Security findings | 7 | 15 | +8 (+114%) |
| Risk score | 100/100 CRITICAL | 100/100 CRITICAL | Unchanged |
| κ saturation | 100% | 100% | Unchanged |
| σ_eff | 1.6 (6.4 hidden) | 4.8 (19.2 hidden) | +3.2 — 3× more stress, κ masking grew proportionally |
| Annual cost of κ | $11.4M | not shown (Θ=100) | Θ floor not crossed — cost section suppressed |
| κ_i annotations | n/a (v4 feature) | 0 found | New capability — none present in React |
| AST engine | not available | not available | `@babel/parser` not installed in scan env |
| σ scale (medium) | n/a | ×1.0 | New explicit scale parameter |
| σ scale (hyperscale) | n/a | ×4.0 | No Θ change due to ρ dominance |

**Key v4.5-final findings:**
- Unbounded growth jumped from 7× to 22× as more source files were reached
- N+1 findings went from 1× to 2×
- `implicit_state` grew from 2,565 to 3,098 occurrences
- `todo_comment` grew from 702 to 821
- `god_function` grew from 359 to 539

The regime and Θ are structurally identical between v4 and v4.5-final. React is Elastic in both. The larger σ_eff (4.8 vs 1.6) reflects the wider scan surface, not a deterioration of the codebase.

---

## @dst-kappa-i Annotations

**Result: zero annotations found.**

```
$ grep -r "@dst-kappa-i" /tmp/react-scan/
(no output)
```

There are no `@dst-kappa-i: expires YYYY-MM-DD` annotations anywhere in the React monorepo. This is expected — the React team does not use DST Framework annotations. The κ_i expiration contract feature is a DST Framework convention; it requires teams to explicitly annotate accepted technical debt with expiration dates.

In the v4.5-final action output, this means:
- `actionLists.expiredKappaICount` = 0 (no expired annotations)
- No κ_i findings appear in the "Accept" action list
- No warnings are emitted about expired contracts

**For an Elastic-regime codebase:** The absence of κ_i annotations is less structurally significant here than in Residual systems. React's 5,728 κ findings are already dominated by 13,483 ρ signals. The κ_i feature adds the most value at regime boundaries (Plastic → Late Plastic) where distinguishing intentional from accumulated debt changes the structural verdict. React is well clear of that boundary.

---

## AST Engine: Detected vs Regex

**Result: AST engine unavailable in this scan environment — all detections are regex.**

```
$ node -e "require('@babel/parser')"
Error: Cannot find module '@babel/parser'
```

`@babel/parser` and `@babel/traverse` are not installed in the scan environment. The v4.5-final scanner detects this at startup and falls back to regex-only mode — zero regression risk, all existing patterns still fire.

| Detection rule | Engine used | Notes |
|---------------|-------------|-------|
| N+1 (await inside loop) | **regex** | `loopHead` + `dbCall` pattern combo |
| Silent catch (empty CatchClause) | **regex** | `catchOpen` + `realHandler` absence |
| All other κ, σ, ρ patterns | **regex** | Unchanged from v4 |

When `@babel/parser` is available (e.g. after the "Install AST engine" step in the CI workflow), the AST engine runs two proof-of-concept rules in parallel:
- **Rule 1 σ:** N+1 — `await` inside a loop body (AST-accurate, eliminates false positives from commented-out code or string literals)
- **Rule 2 κ_a:** Silent catch — `CatchClause` with no `throw` (AST-accurate, eliminates false positives from legitimate logging-only catches)

AST results carry `astDetected: true` in the finding object. Regex results carry no such flag. To enable AST mode, install the optional dependencies before running:

```bash
npm install --no-save @babel/parser @babel/traverse
DST_SCAN_DIR=/tmp/react-scan node tools/dst-action.js
```

---

## ΔΘ Gate Status

**React would NOT trigger the ΔΘ gate.**

The ΔΘ gate logic (from `tools/dst-action.js`):

```js
// Gate 1: ΔΘ gate — cannot merge negative impact into Residual
const prDelta = result.dThetaDt?.rate ?? 0;
if (result.regime.name === 'Residual' && prDelta < 0) {
  // block the PR
  process.exit(1);
}
```

Two conditions must both be true to trigger:
1. `regime.name === 'Residual'` — Θ must be below 25
2. `prDelta < 0` — the PR must have a negative thermodynamic impact

React's current state:

| Gate condition | React's value | Gate triggered? |
|---------------|---------------|-----------------|
| Regime is Residual? | No — regime is **Elastic** (Θ = 100) | ❌ No |
| dΘ/dt < 0? | No — first scan, rate = 0 | ❌ No |
| **ΔΘ gate triggered?** | **No** | ✅ **Clear** |

React is in the Elastic regime with Θ = 100. A PR contributing to facebook/react would pass the ΔΘ gate regardless of its individual impact, unless React's Θ were to collapse to below 25 — which the current ρ:κ ratio makes structurally implausible without a deliberate wholesale removal of typing, error handling, and immutability patterns.

The ΔΘ gate is designed for **Residual-regime codebases** where every additional PR risks permanent structural collapse. React is the opposite case: a heavily healed codebase where κ is present but vastly outnumbered by ρ.

**The structural contrast with Express:**

| | React | Express |
|---|---|---|
| Regime | Elastic (Θ=100) | Residual (Θ=0) |
| ΔΘ gate condition 1 | Never met | Always met |
| ΔΘ gate behavior | Never triggers | Triggers on any PR with negative Θ |
| Structural implication | Any PR is safe to merge | Every PR must improve or hold Θ |

---

## Summary

React v4.5-final scan confirms the v4 conclusion: **Θ = 100, Elastic, structurally sound**. The expanded file surface (+125% files) revealed more κ and σ instances, but ρ grew proportionally faster, keeping the regime stable. The three new v4.5-final capabilities found nothing of alarm:

- **κ_i contracts:** none present (expected — React team doesn't use DST annotations)
- **AST engine:** unavailable in this environment (regex fallback, no regression)
- **σ hyperscale:** score unchanged (ρ dominance absorbs 4× σ penalty without regime shift)
- **ΔΘ gate:** clear (React is Elastic, not Residual)

The finding worth watching is σ_eff rising from 1.6 → 4.8: three times as many stress amplifiers are now masked by κ. The 22 unbounded growth patterns and 2 N+1 patterns are real structural risks that the React team's κ discipline is currently containing. If κ were to be removed without addressing those σ findings first, the effective stress would become visible immediately.

**The inverted observability gap (−85 pts) remains the defining feature of this codebase.** Observable metrics show 15/100 because 5,728 κ findings dominate the surface view. Real structural capacity is 100/100 because 13,483 ρ signals — 13 years of typed interfaces, explicit error flows, and immutable declarations — have built structural mass that no surface metric captures. The scanner sees through the masking in both directions.

> *ρ heals · κ hides · σ kills*  
> DST Framework · SSRN 6434119 · Idan Rephiah · 2026
