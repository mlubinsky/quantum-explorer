# Spec: Bell Inequality Demo

## Overview

A third sub-tab **"Bell"** added to the Spin-½ / Bloch Sphere page alongside
Precession and Measurement. Shows that the singlet state violates the CHSH
inequality — the clearest proof that quantum mechanics cannot be explained by
local hidden variables.

All results are exact closed-form. N-shot simulation is pure JavaScript.

---

## Physics

### Singlet state

```
|ψ⁻⟩ = (|↑↓⟩ − |↓↑⟩) / √2
```

Alice measures spin along â, Bob along b̂. The two-spin correlation is:

```
E(â, b̂) = ⟨ψ⁻| (â·σ) ⊗ (b̂·σ) |ψ⁻⟩ = −â·b̂ = −cos θ
```

where θ is the angle between the two detector axes.

### CHSH inequality

Four detector settings: a, a' (Alice) and b, b' (Bob).

```
S = |E(a,b) − E(a,b') + E(a',b) + E(a',b')|

Classical (local hidden variables):  S ≤ 2
Quantum maximum (Tsirelson bound):   S ≤ 2√2 ≈ 2.828
```

**Optimal CHSH angles** (achieve S = 2√2 exactly):

| Setting | Angle |
|---------|-------|
| a       | 0°    |
| a'      | 90°   |
| b       | 45°   |
| b'      | 135°  |

```
E(0°,45°)  = −cos 45° = −1/√2
E(0°,135°) = −cos 135° = +1/√2
E(90°,45°) = −cos 45° = −1/√2
E(90°,135°)= −cos 45° = −1/√2
S = |−1/√2 − 1/√2 − 1/√2 − 1/√2| = 4/√2 = 2√2  ✓
```

### Classical (LHV) bound on E(θ)

Any local hidden variable model requires the correlation function to be
**linear** between the extreme values −1 and +1. The tightest classical bound is:

```
|E_lhv(θ)| ≤ 1 − 2θ/π   for 0 ≤ θ ≤ π/2
```

The quantum curve E(θ) = −cos θ dips **below** this bound for 0 < θ < 90°,
making the violation visible in a single plot.

### N-shot simulation

For each pair:
1. Draw Alice outcome a ∈ {+1, −1} uniformly.
2. Given a and angle θ between detectors:
   - P(Bob same as Alice) = (1 − cos θ) / 2
   - P(Bob opposite Alice) = (1 + cos θ) / 2
3. Product ab contributes to the estimated correlation.

---

## UI: `src/components/BellDemo.tsx`

### Layout: single-column (no Bloch sphere on this tab)

**Section 1 — Correlation curve** (main plot, always visible)

- x-axis: angle θ between detector axes, 0°–180°
- Quantum curve: E(θ) = −cos θ (blue)
- Classical LHV bound: E_lhv = ±(1 − 2θ/π) (orange dashed, for 0–90°)
- Shaded region between quantum and classical curves (subtle fill, showing violation zone)
- Vertical dashed line at current θ slider value
- Annotation on the plot: "Quantum violates classical bound for 0° < θ < 90°"
- ? help button → BellInfoPanel topic='correlation'

**Section 2 — CHSH panel**

Four angle sliders: a (0°–180°), a' (0°–180°), b (0°–180°), b' (0°–180°).

Preset button: **Optimal (2√2)** → sets a=0°, a'=90°, b=45°, b'=135°.

Live readout table:

| Pair     | θ    | E(θ)   |
|----------|------|--------|
| E(a, b)  | 45°  | −0.707 |
| E(a, b') | 135° | +0.707 |
| E(a',b)  | 45°  | −0.707 |
| E(a',b') | 45°  | −0.707 |

S value display:
```
S = 2.828   [████████████░░░]   Tsirelson bound 2√2
                    ↑
            Classical bound 2
```
Colour: green when S > 2 (quantum violation), grey otherwise.

? help button → BellInfoPanel topic='chsh'

**Section 3 — N-shot simulation**

- N slider or input (10–5000, default 500)
- θ slider (uses same θ as correlation plot)
- **Run simulation** button
- Result: estimated E_sim vs exact E = −cos θ
- Simple bar: "+1 pairs: N++ (same), −1 pairs: N+− (opposite)"
- "Convergence: |E_sim − E_exact| = 0.023 (3σ = 0.045)"

? help button → BellInfoPanel topic='simulation'

---

## New file: `src/components/BellInfoPanel.tsx`

Topics: `'correlation' | 'chsh' | 'simulation'`

### correlation
- Singlet state formula
- E(θ) = −cos θ derivation sketch
- What the classical bound means: any LHV strategy gives |E(θ)| ≤ 1 − 2θ/π
- Why the quantum curve violates it for 0 < θ < 90°

### chsh
- CHSH formula S = |E(a,b) − E(a,b') + E(a',b) + E(a',b')|
- Classical: S ≤ 2 (proved for all LHV theories)
- Quantum: S ≤ 2√2 (Tsirelson 1980)
- Optimal angles and why they maximise S
- Experimental status: Aspect 1982, loophole-free Bell tests 2015

### simulation
- How pairs are sampled from the singlet (conditional probabilities)
- Convergence: std dev ≈ 1/√N
- Why repeating the experiment always gives the same average — quantum randomness
  is reproducible statistically, individual outcomes are irreducibly random

---

## New file: `src/physics/bell.ts`

```ts
/** E(θ) = −cos θ — two-spin singlet correlation */
export function bellCorrelation(theta: number): number

/** CHSH value S for four detector angles (radians) */
export function chshS(a: number, aPrime: number, b: number, bPrime: number): number

/** Simulate N pairs; returns { samePairs, oppositePairs, eEstimate } */
export function simulatePairs(
  theta: number,
  n: number,
): { samePairs: number; oppositePairs: number; eEstimate: number }
```

---

## Tests: `src/test/bell.test.ts`

```
bellCorrelation
  ✓ E(0) = −1  (perfectly anti-correlated)
  ✓ E(π/2) = 0  (uncorrelated)
  ✓ E(π) = 1   (perfectly correlated)
  ✓ E(π/4) = −1/√2

chshS
  ✓ optimal angles (0, π/2, π/4, 3π/4) → S = 2√2
  ✓ all-zero angles → S = 0
  ✓ S ≤ 2√2 for random angles (verified for several cases)

simulatePairs
  ✓ n=0 → samePairs=0, oppositePairs=0
  ✓ θ=π/2 → long-run eEstimate ≈ 0 (within 3σ)
  ✓ θ=0 → all pairs opposite (eEstimate ≈ −1)
  ✓ θ=π → all pairs same (eEstimate ≈ 1)
```

---

## Changes to `SpinExplorer.tsx`

- Add `'bell'` to `SpinTab` type
- Add "Bell" button to tab strip
- When switching to Bell: clear trajectory, stop animation (same as Measurement)
- Render `<BellDemo />` when `activeTab === 'bell'`
- No Bloch sphere interaction needed for Bell tab (sphere stays but is static)

---

## Implementation order

1. `src/physics/bell.ts` + failing tests
2. Physics passes
3. `BellDemo.tsx` — correlation plot
4. CHSH panel
5. N-shot simulation
6. `BellInfoPanel.tsx` — all three topics
7. Tab wiring in `SpinExplorer.tsx`
8. CHANGELOG + TODO update
