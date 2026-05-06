# Spec: Step Potential (Scattering module refactor)

## Overview

Rename the **"Tunnelling"** top-level tab to **"Scattering"** and turn it into a
two-sub-tab module:

```
Scattering
  ├── Barrier   (existing TunnellingExplorer content, unchanged)
  └── Step      (new StepExplorer component)
```

All results are exact closed-form. No numerics.

---

## Physics — Step Potential

### Setup

Semi-infinite step at x = 0:

```
V(x) = 0    for x < 0  (Region I)
V(x) = V₀   for x ≥ 0  (Region II)
```

Particle of energy E > 0 incident from the left (k₁ = √(2E)).

### Wave vectors

```
k₁ = √(2E)            (Region I: always real)
k₂ = √(2(E − V₀))     (Region II: real if E > V₀, imaginary if E < V₀)
```

For E < V₀ write k₂ = iκ where κ = √(2(V₀ − E)).

### Reflection and transmission amplitudes

**Case E > V₀ (above step):**

```
r = (k₁ − k₂) / (k₁ + k₂)       t = 2k₁ / (k₁ + k₂)

R = |r|² = ((k₁ − k₂)/(k₁ + k₂))²

T = (k₂/k₁)|t|² = 4k₁k₂ / (k₁ + k₂)²
```

Note: T uses the *current density* ratio (factor k₂/k₁), not |t|².

**Case E < V₀ (total reflection / tunnelling into evanescent wave):**

```
R = 1    (total internal reflection — exact, no approximation needed)
T = 0
```

The particle is 100% reflected. There is still a non-zero evanescent wave
penetrating into the step region, but it carries no net current.

**Case E = V₀ (step top):**

```
T = 0   (k₂ = 0, denominator finite, T = 4k₁·0/(k₁)² = 0)
R = 1
```

### Norm conservation

```
T + R = 1  (exact for all E > 0)

Verify: T + R = 4k₁k₂/(k₁+k₂)² + (k₁-k₂)²/(k₁+k₂)²
             = [4k₁k₂ + k₁² - 2k₁k₂ + k₂²] / (k₁+k₂)²
             = (k₁+k₂)²/(k₁+k₂)² = 1  ✓
```

### Wavefunction |ψ(x)|²

**Region I (x < 0):** incident + reflected plane waves
```
ψ_I(x) = e^{ik₁x} + r·e^{−ik₁x}
|ψ_I|² = 1 + R + 2√R·cos(2k₁x + φ_r)
```
Standing-wave pattern with period π/k₁. Fringe visibility = 2√R/(1+R).

For E < V₀: r = −1 (pure −1 reflection), so |ψ_I|² = 4sin²(k₁x) — perfect standing wave.

**Region II (x ≥ 0):** above step
```
ψ_II(x) = t·e^{ik₂x}       |ψ_II|² = |t|² = T·(k₁/k₂)  (constant)
```

Below step (evanescent):
```
ψ_II(x) = t·e^{−κx}        |ψ_II|² = |t|²·e^{−2κx}    (decaying)
```
where |t|² = 4 for E → V₀ from below (penetration depth δ = 1/κ).

---

## New file: `src/physics/step.ts`

```ts
/** Transmission coefficient T(E, V0) — exact, uses current-density ratio */
export function stepT(E: number, V0: number): number

/** Reflection coefficient R = 1 − T */
export function stepR(E: number, V0: number): number

/** Reflection amplitude r (real for real k₂, complex phase for evanescent) */
export function stepR_amplitude(E: number, V0: number): { re: number; im: number }

/** |ψ(x)|² for the exact stationary scattering state */
export function stepPsiSq(x: number, E: number, V0: number): number

/** Penetration depth δ = 1/κ for E < V0 (evanescent decay length) */
export function stepPenetrationDepth(E: number, V0: number): number
```

---

## Tests: `src/test/step.test.ts`

```
stepT
  ✓ V0=0: T = 1 for all E (free particle, no step)
  ✓ E < V0: T = 0 (total reflection)
  ✓ E = V0: T = 0 (limiting case)
  ✓ T + R = 1 for E > V0 (several cases)
  ✓ T → 1 as E → ∞ (step becomes negligible)
  ✓ T = 4k₁k₂/(k₁+k₂)² directly for specific values
  ✓ Negative V0 (downward step): T ≤ 1, T + R = 1

stepR
  ✓ R = 1 for E < V0
  ✓ R = 1 − T for E > V0

stepPsiSq
  ✓ Right of step (above): |ψ|² = T·(k₁/k₂) (constant)
  ✓ V0=0: |ψ|² = 1 everywhere
  ✓ E < V0: right of step shows exponential decay
  ✓ At x=0: continuity — left and right values match

stepPenetrationDepth
  ✓ δ = 1/√(2(V0-E))
  ✓ δ → ∞ as E → V0 from below
```

---

## New file: `src/components/StepExplorer.tsx`

### Layout: single-column (matches BarrierExplorer style)

**Header**: "Step Potential" (no separate ? button — section buttons cover it)

**Controls:**

| Slider | Range | Default | Description |
|--------|-------|---------|-------------|
| V₀ (step height) | −5 to 10 a.u. | 3 | Negative = downward step |
| E (particle energy) | 0.05 to 15 a.u. | 1 | Current operating point |

No L slider (step is semi-infinite).

**Readout row:**
```
E = 1.00 a.u.   T = 0.0000   R = 1.0000   T+R = 1.0000   [total reflection]
```
or above step:
```
E = 5.00 a.u.   T = 0.8165   R = 0.1835   T+R = 1.0000   δ = N/A
```

**Section 1 — T and R vs Energy** (always visible)
- x-axis: E from 0.01 to 15 a.u.
- T(E): blue solid
- R(E): red solid
- Sharp transition at E = V₀ (T jumps from 0 to start climbing)
- Vertical dashed line at current E; V₀ marker on x-axis
- Annotation: "Total reflection for E < V₀"
- ? help → ScatteringInfoPanel topic='stepTvsE'

**Section 2 — Wavefunction |ψ(x)|²** (collapsible, default open)
- x range: −8/k₁ to +8/k₁ (or penetration depth × 4 for evanescent region)
- Left of step: standing-wave pattern (fringe visibility shows R)
- Right of step: constant |t|²·(k₁/k₂) if E > V₀; decaying exponential if E < V₀
- Step region shaded (grey for barrier, green for well)
- Vertical dashed line at x = 0
- ? help → ScatteringInfoPanel topic='stepWavefunction'

**Section 3 — Potential diagram** (collapsible, default open)
- V(x): step at x = 0
- Energy line at E
- Penetration depth annotation (δ = 1/κ) when E < V₀
- ? help → ScatteringInfoPanel topic='stepPotential'

---

## New file: `src/components/ScatteringInfoPanel.tsx`

Replaces `TunnellingInfoPanel.tsx` (which moves to sub-panel of Barrier tab).

Topics exported:
```ts
export type ScatteringInfoTopic =
  | 'tvsE' | 'wavefunction' | 'potential'          // Barrier topics (unchanged)
  | 'stepTvsE' | 'stepWavefunction' | 'stepPotential'  // Step topics
```

### stepTvsE
- Derivation: boundary conditions at x=0 give r=(k₁−k₂)/(k₁+k₂)
- Why T uses k₂/k₁ prefactor (probability current, not amplitude)
- Total reflection for E < V₀: r = e^{iφ}, |r|² = 1
- Contrast with classical: classically partial transmission for E > V₀ too, same formula!
  Quantum and classical T are *identical* for the step — the quantum surprise is in the
  wavefunction interference pattern, not the transmission coefficient

### stepWavefunction
- Standing wave formula: 1 + R + 2√R·cos(2k₁x + φ_r)
- Fringe visibility V = 2√R/(1+R): equals 1 (perfect fringes) when R=1
- Evanescent penetration: ψ = t·e^{−κx}, penetration depth δ = 1/κ = 1/√(2(V₀−E))
- At E = V₀: δ → ∞ — the wave penetrates infinitely far (T = 0 still, no net current)

### stepPotential
- Abrupt step vs. smooth potential: Wentzel-Kramers-Brillouin (WKB) applies when
  the potential varies slowly on the scale of λ. The step is the opposite limit —
  the sharpest possible change — so reflection is maximised for given ΔV.
- Downward step (V₀ < 0): wave speeds up in region II (k₂ > k₁), partial reflection
  from an accelerating potential. Analogous to light going from dense to rare medium.
- Upward step (V₀ > 0) and E > V₀: analogous to light going from rare to dense
  medium — partial reflection even though the particle can pass.

---

## Refactoring `App.tsx` and `TunnellingExplorer.tsx`

### App.tsx changes
- Tab label: `'Tunnelling'` → `'Scattering'`
- Component: `TunnellingExplorer` → `ScatteringExplorer`

### Rename `TunnellingExplorer.tsx` → `ScatteringExplorer.tsx`
- Wraps existing barrier content in a `BarrierPanel` sub-component
- Adds sub-tab strip: **Barrier** | **Step**
- Renders `<BarrierPanel>` or `<StepExplorer>` based on active sub-tab
- Shared `DARK` constants and `darkLayout`/`axis` helpers moved to a shared file
  or kept inline in each sub-component

### `TunnellingInfoPanel.tsx`
- Rename to keep existing export for backward compat, OR inline into `ScatteringInfoPanel.tsx`
- Cleanest: merge all topics into `ScatteringInfoPanel.tsx`, delete `TunnellingInfoPanel.tsx`

---

## Implementation order

1. `src/physics/step.ts` + failing tests in `src/test/step.test.ts`
2. Physics passes all tests
3. `ScatteringInfoPanel.tsx` — all six topics (barrier 3 + step 3)
4. `StepExplorer.tsx` — T/R vs E, wavefunction, potential diagram
5. Refactor `TunnellingExplorer.tsx` → `ScatteringExplorer.tsx` with sub-tabs
6. Update `App.tsx` — rename tab, swap component
7. Delete `TunnellingInfoPanel.tsx` (merged into ScatteringInfoPanel)
8. CHANGELOG + TODO update
