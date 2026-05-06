# Spec: Rectangular Barrier Tunnelling

## Overview

A new top-level module **"Tunnelling"** added to the module nav alongside Stationary States,
Time Evolution, Free Particle, and Spin-½.

Shows exact transmission T and reflection R for a plane wave of energy E scattering off a
rectangular potential barrier or well. All formulas are exact closed-form — no numerics.

---

## Physics

### Setup

Rectangular barrier of height V₀ and width L centred at x = 0:

```
V(x) = V₀   for  −L/2 ≤ x ≤ L/2
V(x) = 0    otherwise
```

Particle of energy E > 0 (atomic units ħ = m = 1) incident from the left.

### Wave vectors

```
k  = √(2E)             (outside barrier, both regions)
κ  = √(2(E − V₀))     (inside: real if E > V₀, imaginary if E < V₀)
```

For E < V₀ write κ = iκ̃ where κ̃ = √(2(V₀ − E)) > 0 (evanescent wave).

### Transmission and reflection coefficients

**Case E > V₀ (above barrier):**

```
T = 1 / [1 + (V₀²·sin²(κL)) / (4E(E−V₀))]

R = 1 − T
```

**Case E < V₀ (tunnelling):**

```
T = 1 / [1 + (V₀²·sinh²(κ̃L)) / (4E(V₀−E))]

R = 1 − T
```

**Case E = V₀ (exact resonance at barrier top):** T = 1/(1 + V₀²L²/8E) ← limiting form

**Perfect transmission resonances (E > V₀):** T = 1 exactly when κL = nπ (n = 1, 2, …),
i.e. when the barrier width equals an integer number of half-wavelengths inside.

### Potential well (V₀ < 0)

Setting V₀ < 0 gives a rectangular well. The formula for T is the same as the above-barrier
case (κ is always real when V₀ < 0 and E > 0). Perfect transmission resonances also occur.

### WKB tunnelling approximation (for comparison, E < V₀)

```
T_WKB = exp(−2κ̃L)
```

Valid when κ̃L ≫ 1. Shown as a dashed curve in the T-vs-E plot.

### Norm conservation

```
T + R = 1   (exact, for all E ≠ 0)
```

---

## UI: `src/components/TunnellingExplorer.tsx`

### Layout: single-column

**Header**: "Rectangular Barrier Tunnelling" + ? help button

**Parameter controls:**

| Slider | Range | Default | Description |
|--------|-------|---------|-------------|
| V₀ (barrier height) | −5 to 10 a.u. | 5 | Negative = well |
| L (barrier width)   | 0.5 to 10 a.u. | 2 | |
| E (particle energy) | 0.05 to 15 a.u. | 1 | Current operating point |

---

**Section 1 — T and R vs Energy** (main plot, always visible)

- x-axis: E from 0.01 to 15 a.u.
- Transmission T(E): blue solid
- Reflection R(E) = 1−T: red solid
- WKB approximation T_WKB(E): orange dashed (only in tunnelling region E < V₀; hidden otherwise)
- Vertical dashed line at current E slider value
- Horizontal grey dashed line at T = 1
- Vertical dashed lines at resonance energies E_n = V₀ + n²π²/(2L²)  for n = 1,2,3
  (labelled "n=1", "n=2", etc.)
- ? help → TunnellingInfoPanel topic='tvsE'

**Readout row** (between slider and plot):

```
E = 1.00 a.u.   T = 0.1023   R = 0.8977   T+R = 1.0000
```

---

**Section 2 — Wavefunction |ψ(x)|²** (collapsible, default open)

- x range: −L/2 − 4/k to L/2 + 4/k (enough room to see the packet)
- Shows the **stationary scattering wavefunction** amplitude squared |ψ(x)|²:

  Left region (x < −L/2):
  ```
  ψ_L(x) = e^{ikx} + r·e^{−ikx}        (incident + reflected)
  |ψ_L|² = 1 + |r|² + 2·Re(r)·cos(2kx) + 2·Im(r)·sin(2kx)
  ```

  Inside barrier (|x| < L/2):
  - E > V₀: oscillatory  ψ_B(x) = A·e^{iκx} + B·e^{−iκx}
  - E < V₀: evanescent   ψ_B(x) = A·e^{κ̃x} + B·e^{−κ̃x}

  Right region (x > L/2):
  ```
  ψ_R(x) = t·e^{ikx}                    (transmitted wave only)
  |ψ_R|² = T  (constant = transmission coefficient)
  ```

- Barrier region shaded grey (V(x)/V_max scale)
- Vertical dashed lines at barrier edges −L/2, +L/2
- Labels: "incident+reflected" left, "transmitted T={T:.3f}" right
- ? help → TunnellingInfoPanel topic='wavefunction'

---

**Section 3 — Barrier potential diagram** (collapsible, default open)

- Plots V(x): rectangular step ±L/2, height V₀ (can be negative for well)
- Horizontal line at current E (particle energy)
- Label: "E = {E} a.u." on the energy line
- Horizontal line at 0 (always shown)
- Fills below V₀ in grey (barrier) or below 0 in green (well)
- ? help → TunnellingInfoPanel topic='potential'

---

## New file: `src/components/TunnellingInfoPanel.tsx`

Topics: `'tvsE' | 'wavefunction' | 'potential'`

### tvsE
- Transfer matrix derivation sketch
- T formula for both cases (E > V₀ and E < V₀)
- WKB approximation T_WKB = exp(−2κ̃L) and when it's valid
- Resonance condition κL = nπ → T = 1
- Physical meaning: thick barrier → T → 0; thin barrier with resonance → T = 1

### wavefunction
- Piecewise plane wave construction
- Reflection amplitude r and transmission amplitude t
- Standing-wave pattern on left: cos(2kx) oscillations with amplitude proportional to R
- Constant amplitude on right equal to √T

### potential
- What V₀ < 0 means (attractive well vs repulsive barrier)
- Classical vs quantum: classically T = 0 for E < V₀; quantum T > 0 always
- Resonances and the analogy with a Fabry-Pérot cavity

---

## New file: `src/physics/tunnelling.ts`

```ts
/** Transmission coefficient T(E, V0, L) — exact for all E > 0 */
export function transmissionT(E: number, V0: number, L: number): number

/** Reflection coefficient R = 1 − T */
export function reflectionR(E: number, V0: number, L: number): number

/** WKB approximation exp(−2κ̃L) — only defined for E < V0 */
export function wkbT(E: number, V0: number, L: number): number

/** Resonance energies where T = 1 exactly (E > V0 case): E_n = V0 + n²π²/(2L²) */
export function resonanceEnergies(V0: number, L: number, nMax: number): number[]

/**
 * Scattering wavefunction |ψ(x)|² at a given x.
 * Returns the exact stationary-state probability density.
 */
export function scatteringPsiSq(x: number, E: number, V0: number, L: number): number
```

---

## Tests: `src/test/tunnelling.test.ts`

```
transmissionT
  ✓ V0=0: T = 1 for all E (free particle, no barrier)
  ✓ E → ∞: T → 1 (high energy, barrier becomes transparent)
  ✓ T + R = 1 for various E, V0, L (norm conservation)
  ✓ Resonance: T = 1 when κL = π (n=1 resonance above barrier)
  ✓ Tunnelling: T < 1 for E < V0
  ✓ Deep tunnelling: T ≈ wkbT for large κ̃L
  ✓ Negative V0 (well): T ≤ 1, resonances exist
  ✓ E = V0 (limit): T is finite and continuous

reflectionR
  ✓ R = 1 − T for several cases

wkbT
  ✓ wkbT = exp(−2√(2(V0−E))·L) directly
  ✓ wkbT < T always (WKB underestimates T)

resonanceEnergies
  ✓ First resonance energy = V0 + π²/(2L²)
  ✓ Returns empty array if first resonance > Emax

scatteringPsiSq
  ✓ Right of barrier: |ψ|² = T (constant)
  ✓ Norm on right segment ≈ T · segment_length (plane wave)
  ✓ V0=0: |ψ|² = 1 everywhere (free particle, no reflection)
```

---

## Changes to `App.tsx`

- Add `'tunnelling'` to `Module` type
- Add `{ id: 'tunnelling', label: 'Tunnelling' }` to MODULES array
- Import `TunnellingExplorer` and render when `active === 'tunnelling'`

---

## Implementation order

1. `src/physics/tunnelling.ts` + failing tests
2. Physics passes all tests
3. `TunnellingExplorer.tsx` — T/R vs E plot + controls + readout
4. Add wavefunction section
5. Add potential diagram section
6. `TunnellingInfoPanel.tsx` — all three topics
7. Wire into `App.tsx`
8. CHANGELOG + TODO update
