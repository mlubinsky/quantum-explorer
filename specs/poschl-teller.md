# Spec: Pöschl-Teller Potential (Scattering module — fourth sub-tab)

## Overview

Add a **Pöschl-Teller** sub-tab to the existing Scattering module:

```
Scattering
  ├── Barrier          (existing)
  ├── Step             (existing)
  ├── Delta            (existing)
  └── Pöschl-Teller   (new)
```

All results are **exact closed-form**. No numerics for eigenvalues or T.
Bound-state wavefunctions use associated Legendre polynomials (Rodrigues formula).
Wavefunction normalization uses a single trapezoidal integration per state.

---

## Physics

### Potential

```
V(x) = −V₀ · sech²(αx)

V₀ = N(N+1)α²/2   (derived from N and α, not a free parameter)
```

- α = 1/a is the reciprocal width; the well has half-width ≈ 1/α
- N = 1, 2, 3, 4, 5 (positive integer) — the "depth" parameter
- V₀ is the well depth (positive number — the well is attractive)
- V(0) = −V₀ (bottom of well), V(x) → 0 as |x| → ∞

### Why this parameterisation?

The potential V(x) = −λ(λ+1)α²/2 · sech²(αx) is exactly solvable for any λ.
For **integer** λ = N, the potential is reflectionless — T = 1 for all E > 0.
Setting V₀ = N(N+1)α²/2 makes N the only control needed for the depth.

### Transmission — the key result

**For integer N:**
```
T(E) = 1   for all E > 0
R(E) = 0   for all E > 0
```

This is the defining property of the reflectionless Pöschl-Teller potential.
A particle incident from any energy passes through without reflection — even when
E is far below the "classical" threshold where T would be 0.

**Classical comparison:**
```
T_classical(E) = 0   for E < V₀   (particle bounces back classically)
T_classical(E) = 1   for E ≥ V₀   (particle passes classically)
```

The quantum T = 1 always, regardless of E. The potential is a perfect absorber
of the reflected wave through quantum interference — similar to an AR coating.

### Bound states

There are exactly N bound states, labelled j = 0, 1, ..., N−1:

**Energies (exact, closed-form):**
```
E_j = −α²(N−j)²/2   for j = 0, 1, ..., N−1

j=0 (ground state):    E_0 = −α²N²/2     (deepest)
j=1:                   E_1 = −α²(N−1)²/2
...
j=N−1 (top state):     E_{N−1} = −α²/2   (shallowest)
```

All bound states satisfy: −V₀ < E_j < 0.

Proof: E_j > −V₀ iff (N−j)² < N(N+1), i.e. N−j < √(N(N+1)) < N+1. ✓

**Node counts:** j-th state has exactly j nodes. ✓

**Bound-state wavefunctions:**

The unnormalised wavefunction is:

```
ψ_j(x) ∝ P_N^m(tanh(αx)),   m = N − j ∈ {1, ..., N}
```

where P_N^m(u) = (1−u²)^{m/2} · d^m P_N/du^m  is the associated Legendre function
(Rodrigues form without Condon-Shortley phase) and P_N is the Legendre polynomial.

Since u = tanh(αx) satisfies 1−u² = sech²(αx):

```
ψ_j(x) ∝ sech^m(αx) · [d^m P_N/du^m](tanh(αx))
```

d^m P_N/du^m is a polynomial of degree N−m = j in u, so ψ_j has exactly j
real roots ⟺ exactly j nodes. ✓

Explicit unnormalised forms:

| j | m=N−j | ψ_j(x) ∝ |
|---|--------|-----------|
| 0 | N | sech^N(αx) |
| 1 | N−1 | sech^{N−1}(αx) · tanh(αx) |
| 2 | N−2 | sech^{N−2}(αx) · [(2N−1)tanh²(αx) − 1] |
| 3 | N−3 | sech^{N−3}(αx) · tanh(αx) · [(2N−3)tanh²(αx) − 1]·factor |
| 4 | N−4 | sech^{N−4}(αx) · [21tanh⁴ − 14tanh² + 1]·factor (N=5 only) |

(factors depend on N via the Legendre polynomial coefficients)

**Normalisation:** computed numerically via trapezoidal rule over a dense grid.
The physics module exposes `ptBoundPsiSqArray(xArr, N, j, alpha)` which computes
the unnorm wavefunction at each x, integrates ||ψ_unnorm||² once over xArr, and
returns the fully normalised |ψ|².

---

## Files

### `src/physics/poschlTeller.ts`

```ts
/** V₀ = N(N+1)α²/2 */
export function ptV0(N: number, alpha: number): number

/** V(x) = −V₀ sech²(αx) */
export function ptPotential(x: number, N: number, alpha: number): number

/**
 * Bound-state energy: E_j = −α²(N−j)²/2  for j = 0..N−1.
 * j=0 is the ground state (deepest).
 */
export function ptBoundEnergy(N: number, j: number, alpha: number): number

/**
 * Normalised |ψ_j(x)|² evaluated at each point in xArr.
 * Uses Rodrigues formula via Legendre recurrence + polynomial differentiation.
 * Normalisation (∫|ψ|²dx = 1) computed by trapezoidal rule over xArr.
 * xArr must span at least ±5/alpha for accurate normalisation.
 */
export function ptBoundPsiSqArray(
  xArr: number[], N: number, j: number, alpha: number
): number[]
```

**Internal helpers (not exported):**

```ts
function legendreCoeffs(N: number): number[]
  // Coefficients [c0..cN] of P_N(u) = Σ ci u^i  via recurrence

function differentiateCoeffs(coeffs: number[], times: number): number[]
  // Returns coefficients of d^times/du^times of the polynomial

function evalPoly(coeffs: number[], u: number): number
  // Horner evaluation

function ptPsiUnnorm(x: number, N: number, j: number, alpha: number): number
  // sech^m(αx) · (d^m P_N/du^m)(tanh(αx))  where m = N−j
```

### `src/test/poschlTeller.test.ts`

Write **before** implementing physics:

```
ptV0
  ✓ ptV0(1,1) = 1,  ptV0(2,1) = 3,  ptV0(3,1) = 6  [N(N+1)/2]
  ✓ ptV0(1,2) = 2,  ptV0(2,2) = 6                    [scales as α²]
  ✓ ptV0(N,α) > 0 always

ptPotential
  ✓ V(0,N,α) = −V₀ (bottom of well)
  ✓ V(x,N,α) < 0 for all finite x (attractive everywhere)
  ✓ V(x,N,α) → 0 as |x| → large
  ✓ Symmetric: V(−x,N,α) = V(x,N,α)

ptBoundEnergy
  ✓ E_j = −α²(N−j)²/2 for several (N,j,α) combinations
  ✓ Energies are strictly increasing with j (ground state deepest)
  ✓ All energies are negative
  ✓ All bound states are within the well: E_j > −V₀
  ✓ Top bound state (j=N−1): E = −α²/2 regardless of N

ptBoundPsiSqArray
  ✓ Integral ≈ 1 (normalised) for all (N, j, α)
  ✓ All values ≥ 0 (probability density)
  ✓ j=0 (ground state): single peak at x=0 (symmetric, no nodes)
  ✓ j=1: two lobes (one node at x=0, antisymmetric for α=1)
  ✓ j=2: three lobes (two nodes, symmetric)
  ✓ Node count: j-th state has exactly j zeros
```

### `src/components/PoschlTellerExplorer.tsx`

**Controls:**

| Control | Range | Default | Notes |
|---------|-------|---------|-------|
| N (depth, # bound states) | 1..5 (integer) | 3 | determines # bound state lines |
| α (reciprocal width) | 0.5..3, step 0.1 | 1.0 | |

Derived readout: V₀, all E_j values.

**Section 1 — T(E) = 1 (always visible)**
- Blue flat line at T = 1 ("Quantum: T = 1 reflectionless")
- Orange dashed step function at V₀: classical T_classical = Θ(E − V₀)
- x-axis E from 0 to ~12 a.u.
- Grey dashed vertical at E = V₀; annotation "V₀ = {V₀.toFixed(2)}"
- Annotation at bottom: "Classical T = 0 for E < V₀"
- ? help → `ptTvsE`

**Section 2 — Potential well and bound-state levels (always visible)**
- Plot V(x) = −V₀ sech²(αx) as a filled orange curve
- Horizontal dashed lines at each E_j
- Labelled: "E₀ = {E₀.toFixed(3)}", etc.
- y-axis range: [−V₀·1.15, max(E, V₀/4)]
- x-axis range: [−5/α, 5/α]
- ? help → `ptPotential`

**Section 3 — Bound-state wavefunctions (collapsible, default open)**
- All N states on one plot, each a different colour
- Legend: "ψ₀ (E = {E₀.toFixed(3)})", etc.
- x-axis: [−5/α, 5/α]
- y-axis: |ψ|², labelled with max value
- ? help → `ptWavefunction`

**Readout bar:** N, α, V₀, E₀..E_{N−1}

### `src/components/ScatteringInfoPanel.tsx` additions

Extend type with:
```ts
| 'ptTvsE' | 'ptWavefunction' | 'ptPotential'
```

**ptTvsE:** reflectionless property; comparison with classical; T = 1 for all E; the quantum
result is the opposite of classical intuition (classical has T=0 below V₀, quantum T=1 always).

**ptWavefunction:** Rodrigues formula; bound-state energies; node theorem (j nodes for j-th state);
N(N+1)α²/2 normalization of depth; comparison with particle-in-a-box.

**ptPotential:** Physical meaning of sech² well; how N controls both depth and number of states;
relation to reflectionless potentials (inverse scattering theory); "reflectionless coating" analogy.

### `src/components/ScatteringExplorer.tsx`

Add `'poschl-teller'` to `ScatteringTab` type with label `'Pöschl-Teller'`.
Render `<PoschlTellerExplorer />` for this tab.

---

## Implementation order

1. `specs/poschl-teller.md` — this file ✓
2. `src/test/poschlTeller.test.ts` — failing tests
3. `src/physics/poschlTeller.ts` — implement until tests pass
4. `src/components/ScatteringInfoPanel.tsx` — add 3 PT topics
5. `src/components/PoschlTellerExplorer.tsx` — build UI
6. `src/components/ScatteringExplorer.tsx` — wire fourth tab
7. CHANGELOG + README + TODO update

---

## Physics notes / edge cases

- **α² scaling:** all energies scale as α². Doubling α quadruples binding energies.
- **N=1:** single bound state at E_0 = −α²/2; well depth V₀ = α².
  Minimal reflectionless case — T=1 with one trapped state.
- **N=5:** five bound states; V₀ = 15α²/2 — a deep, moderately wide well.
- **j=0 wavefunction:** always sech^N(αx) — pure even function, no nodes.
- **j odd:** wavefunction is antisymmetric (odd) — peaks at ±x₀, zero at x=0.
- **Normalisation grid:** use xArr spanning [−8/α, 8/α] with ~600 points for 
  <0.1% normalisation error for all N ≤ 5.
- **T = 1 is exact for integer N** — not an approximation. For non-integer λ, 
  T < 1 and the exact formula requires the Gamma function (out of scope).
- **Bound state energies are within the well:** E_j > −V₀ always, since
  (N−j)² < N(N+1) for j ≥ 1, and 0 < N² < N(N+1) for j=0. ✓
