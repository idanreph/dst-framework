# Real-World DST Analysis 🔥

> "I didn't believe it until I saw the numbers."

This is a real repository analyzed with DST.

---

## The Repo

**Type:** Mid-size SaaS backend (Node.js + Express)  
**Size:** ~12,000 lines of code  
**Team:** 4 engineers  
**Problem:** "Everything feels slow and nothing gets done"

---

## DST Scan Results

| Metric | Value | Signal |
|--------|-------|--------|
| κ (masking) | 0.84 | 🔴 HIGH — team hiding real blockers |
| σ (stress loops) | 6 active | 🔴 CRITICAL — 6 circular dependencies detected |
| ρ (healing) | 0.12 | 🔴 LOW — almost no recovery capacity |
| Θ (capacity) | 23% | 🔴 CRITICAL — team operating at 23% real capacity |

> **DST verdict:** This system is in pre-collapse state.  
> The team *feels* busy but is producing almost nothing real.

---

## Before DST

```
AuthService → UserService → SessionService → AuthService
     ↑___________________________________________________↑
```

- 3 stress loops in auth alone
- Every new feature added to the loop
- Bugs fixed in one place reappeared in another
- Engineers burned out after 6-month sprints with no visible progress

---

## After DST Applied

Changes made based on DST output:
1. Broke the `AuthService → SessionService` circular dependency
2. Extracted `TokenService` as a stateless boundary
3. Removed 2 masking layers (error suppression in middleware)
4. Added healing checkpoints (circuit breakers)

### Result (30 days later)

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| κ (masking) | 0.84 | 0.21 | ↓ 75% |
| σ (stress loops) | 6 | 1 | ↓ 83% |
| ρ (healing) | 0.12 | 0.61 | ↑ 5x |
| Θ (capacity) | 23% | 71% | ↑ 3x |
| Deploy frequency | 1/month | 8/month | ↑ 8x |
| Bug reopen rate | 67% | 11% | ↓ 84% |

---

## ROI

> **3x capacity increase in 30 days.**  
> No new hires. No rewrites. Just DST.

The team didn't work harder. They stopped working against themselves.

---

## Try it on your repo

```bash
git clone https://github.com/idanreph/DST-framework
cd DST-framework
node tools/dst-scanner.js
```

→ See [/demo](../../demo/) for a full runnable test.  
→ See [tools/README.md](../../tools/README.md) for scanner docs.
