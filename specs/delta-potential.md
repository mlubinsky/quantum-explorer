# Spec: Delta Function Potential (Scattering module — third sub-tab)

## Overview

Add a **Delta** sub-tab to the existing Scattering module alongside Barrier and Step:

```
Scattering
  ├── Barrier   (existing)
  ├── Step      (existing)
  └── Delta     (new)
```

All results are exact closed-form. No numerics.

---

## Physics

### Potential

```
V(x) = g·δ(x)

g = +α   (repulsive, α > 0) — no bound state
g = −α   (attractive, α > 0) — one bound state at E_b = −α²/2
```

The delta function is the zero-range limit of a rectangular barrier/well of width L
and height V₀ with α = V₀·L held fixed as L → 0.

### Scattering (E > 0)

Wave vector k = √(2E). Boundary conditions at x = 0:

```
ψ continuous:         1 + r = t
ψ' discontinuous:     ψ'(0⁺) − ψ'(0⁻) = 2g·ψ(0)
```

Solving gives the transmission amplitude:

```
t = ik / (ik − g)
r = g  / (ik − g)
```

Transmission and reflection coefficients:

```
T = |t|² = k² / (k² + α²) = 2E / (2E + α²)
R = |r|² = α² / (k² + α²)
T + R = 1   exactly
```

**Key result:** T depends only on α² — the same for attractive and repulsive delta
with equal |g|. Both are perfect reflectors (T → 0) in the strong-coupling limit.

**Half-transmission:** T = ½ when k² = α², i.e. E = α²/2 = |E_b| (for attractive).

### Reflection amplitude components

```
rRe = −α² / (k² + α²)   (same for both signs)
rIm = −sign · αk / (k² + α²)   where sign = +1 (repulsive) or −1 (attractive)
```

### Scattering wavefunction |ψ(x)|²

```
x < 0:  |ψ|² = 1 + R + 2(rRe·cos(2kx) + rIm·sin(2kx))
               oscillates between (1 − √R)² and (1 + √R)²

x ≥ 0:  |ψ|² = T   (flat — no standing wave on the transmitted side)
```

Continuity at x = 0 is exact: the left formula evaluates to T at x = 0.

### Bound state (attractive only, g = −α < 0)

Unique bound state for any α > 0:

```
E_b = −α²/2

ψ_b(x) = √α · e^{−α|x|}

|ψ_b(x)|² = α · e^{−2α|x|}   (peaks at x = 0 with value α)

∫ |ψ_b|² dx = 1   exactly (normalised)
```

Penetration depth = 1/α (contrast: step evanescent depth = 1/√(2(V₀−E))).

Unlike the finite square well, the attractive delta binds exactly one state
for *any* α > 0, however small — no minimum-depth condition.

---

## Files

### `src/physics/delta.ts`

```ts
/** T = k²/(k²+α²) = 2E/(2E+α²),  k = √(2E) */
export function deltaT(E: number, alpha: number): number

/** R = 1 − T */
export function deltaR(E: number, alpha: number): number

/** Bound-state energy E_b = −α²/2 (attractive delta only) */
export function deltaBoundEnergy(alpha: number): number

/** |ψ_b(x)|² = α·exp(−2α|x|),  normalised to 1 */
export function deltaBoundPsiSq(x: number, alpha: number): number

/**
 * |ψ(x)|² for V = g·δ(x).
 * sign = +1 → repulsive (g = +α), sign = −1 → attractive (g = −α)
 */
export function deltaPsiSq(x: number, E: number, alpha: number, sign: 1 | -1): number
```

### `src/test/delta.test.ts`

Tests to write *before* implementing the physics:

```
deltaT / deltaR
  ✓ T + R = 1 for various E and alpha
  ✓ T = 0 at E = 0
  ✓ T = 1 when alpha = 0 (free particle)
  ✓ T → 1 for large E
  ✓ T decreases monotonically as alpha increases
  ✓ T increases monotonically with E
  ✓ T = ½ when E = α²/2 (half-transmission at |E_b|)
  ✓ T is symmetric in α — same for attractive and repulsive

deltaBoundEnergy
  ✓ E_b = −α²/2 for several alpha values
  ✓ E_b is always negative
  ✓ T(|E_b|, alpha) = ½ (consistency with scattering)

deltaBoundPsiSq
  ✓ peak value = alpha at x = 0
  ✓ symmetric in x
  ✓ normalises to 1 (trapezoidal quadrature)

deltaPsiSq
  ✓ continuous at x = 0: |ψ(0⁻)| = |ψ(0⁺)| = T
  ✓ flat at T for all x ≥ 0 (both signs)
  ✓ oscillates within [(1−√R)², (1+√R)²] for x < 0
  ✓ attractive and repulsive give different patterns on left (sin term flips)
  ✓ returns 0 for E ≤ 0
```

### `src/components/DeltaExplorer.tsx`

**Controls:**

| Control | Range | Default |
|---------|-------|---------|
| Type toggle | Attractive / Repulsive | Attractive |
| α (strength) | 0.1 – 5 | 2.0 |
| E (energy) | 0.05 – 12 a.u. | 1.0 |

**Readout bar:** E, T, R, T+R, E_b (attractive only), E vs |E_b| comparison

**Section 1 — T(E) and R(E)** (always visible)
- T: blue solid; R: red solid
- Vertical dashed line at current E; green dot at operating point
- For attractive: vertical dashed purple line at |E_b| with "T=½" annotation
- ? help → `deltaTvsE`

**Section 2 — Scattering |ψ(x)|²** (collapsible, default open)
- x range: ≈ 3 wavelengths left, 1.5 right (or 4/α if wider)
- Vertical dashed line at x = 0 to show delta location
- Green dotted reference line at y = T on the right side
- Annotation "T = x.xxx" on right; "incident + reflected" on left
- ? help → `deltaWavefunction`

**Section 3 — Bound state |ψ_b|²** (collapsible, attractive only)
- Filled area plot: purple, α·exp(−2α|x|)
- Annotations: peak value α, decay length 1/α
- ? help → `deltaWavefunction`

**Section 4 — Potential diagram** (collapsible, default open)
- Vertical orange spike at x=0 pointing up (repulsive) or down (attractive)
- Horizontal dashed line at current E (blue)
- Horizontal dotted line at E_b (purple, attractive only)
- Label "−αδ(x)" or "+αδ(x)" with arrow annotation
- ? help → `deltaPotential`

### `src/components/ScatteringInfoPanel.tsx` additions

Extend `ScatteringInfoTopic` with:
```ts
| 'deltaTvsE' | 'deltaWavefunction' | 'deltaPotential'
```

**deltaTvsE:** T formula; half-transmission at |E_b|; comparison table (Barrier/Step/Delta)

**deltaWavefunction:** scattering t and r amplitudes; flat T for x > 0; bound-state formula and normalisation; standing-wave amplitude bounds

**deltaPotential:** physical meaning of δ(x); same T for ±α explained; unique bound state for any α > 0

### `src/components/ScatteringExplorer.tsx`

Add `'delta'` to `ScatteringTab` type and render `<DeltaExplorer />`.

---

## Implementation order

1. `src/test/delta.test.ts` — write all tests first (they will fail)
2. `src/physics/delta.ts` — implement until all tests pass
3. `src/components/ScatteringInfoPanel.tsx` — add three delta topics
4. `src/components/DeltaExplorer.tsx` — build UI
5. `src/components/ScatteringExplorer.tsx` — wire in the new tab
6. CHANGELOG + README + TODO update

---

## Physics notes / edge cases

- **α = 0:** free particle, T = 1, no bound state — handle with early return
- **E → 0:** T → 0 (smooth, no threshold unlike step)
- **E → ∞:** T → 1 (classical limit: particle barely deflected by infinitely short potential)
- **Large α:** both T → 0 (strong scatterer regardless of sign); E_b → −∞ (deep well) or just strong barrier
- **Wavefunction at x = 0:** exactly T by construction; verify this in tests
- **rIm sign:** opposite for attractive vs repulsive — shifts the phase of the standing wave;
  |r|² = R is the same for both (only the interference pattern phase differs)
