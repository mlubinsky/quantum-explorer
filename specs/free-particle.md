# Spec: Free Particle Gaussian Wavepacket

## Overview

A new top-level tab **"Free Particle"** added alongside Stationary States, Time Evolution,
and Spin-½. Shows a minimum-uncertainty Gaussian wavepacket evolving under V = 0 — the
simplest exact time-dependent solution in quantum mechanics.

All results are exact closed-form. No numerics, no grid solver.

---

## Physics

### Initial state

```
ψ(x, 0) = (2πσ₀²)^{−1/4} · exp(−(x−x₀)²/(4σ₀²) + ik₀(x−x₀))
```

Parameters:
- `x₀` — initial centre of the packet
- `k₀` — initial wave vector (= ⟨p⟩/ħ = ⟨p⟩ in a.u.)
- `σ₀` — initial position width (Δx at t=0)

At t=0: Δx = σ₀, Δp = 1/(2σ₀), Δx·Δp = ħ/2 = 0.5 (minimum uncertainty).

### Time evolution (exact)

Free-particle Hamiltonian H = p²/2. The probability density evolves as:

```
|ψ(x,t)|² = (1/(σ(t)√(2π))) · exp(−(x − ⟨x(t)⟩)² / (2σ(t)²))

σ(t) = σ₀ · √(1 + (t/t₀)²)          — spreading width
t₀   = 2σ₀²                           — spreading time (a.u.)
⟨x(t)⟩ = x₀ + k₀ t                   — moves at group velocity v_g = k₀
⟨p(t)⟩ = k₀                           — constant (free particle)
Δx(t)   = σ(t)                        — grows
Δp       = 1/(2σ₀)                    — constant
Δx(t)·Δp = (1/2)√(1+(t/t₀)²)        — grows from ħ/2 at t=0
```

### Momentum distribution (time-independent)

```
|φ(k)|² = (1/(σ_p√(2π))) · exp(−(k−k₀)² / (2σ_p²))   where σ_p = 1/(2σ₀) = Δp
```

This is **static** — measuring momentum at any time gives the same distribution.
The contrast with |ψ(x,t)|² spreading is the main pedagogical point.

### Key relations to display

- Spreading time: t₀ = 2σ₀² — wide packet spreads slowly, narrow packet spreads fast
- Group velocity: v_g = k₀ (packet centre moves at k₀)
- Phase velocity: v_ph = k₀/2 (each plane-wave component e^{ikx−ik²t/2} moves at k/2)
- Uncertainty grows: Δx·Δp = ħ/2 at t=0 only; increases thereafter
- σ(t₀) = σ₀√2 — width doubles in one spreading time

---

## New file: `src/physics/freeParticle.ts`

```ts
/** Free particle Gaussian wavepacket — atomic units ħ = m = 1. */

/** σ(t) = σ₀√(1+(t/t₀)²),  t₀ = 2σ₀² */
export function fpSigma(t: number, sigma0: number): number

/** Spreading time t₀ = 2σ₀² */
export function fpSpreadingTime(sigma0: number): number

/** |ψ(x,t)|² — exact Gaussian */
export function fpProb(x: number, t: number, x0: number, k0: number, sigma0: number): number

/** ⟨x(t)⟩ = x₀ + k₀t */
export function fpExpectX(t: number, x0: number, k0: number): number

/** ⟨p⟩ = k₀ (constant) */
export function fpExpectP(k0: number): number

/** Δx(t) = σ(t) */
export function fpDeltaX(t: number, sigma0: number): number

/** Δp = 1/(2σ₀) (constant) */
export function fpDeltaP(sigma0: number): number

/** |φ(k)|² — time-independent Gaussian in momentum space */
export function fpMomentumDist(k: number, k0: number, sigma0: number): number
```

---

## UI: `src/components/FreeParticleExplorer.tsx`

New tab added to `App.tsx` between "Time Evolution" and "Spin-½".

### Controls (left panel, 260px)

Sliders:
| Slider | Range | Default | Hint |
|--------|-------|---------|------|
| Initial position x₀ | −10…10 | 0 | Initial centre of packet |
| Wave vector k₀ | −5…5 | 1.0 | Group velocity = k₀ |
| Initial width σ₀ | 0.3…4 | 1.0 | Spreading time t₀ = 2σ₀² |

Readout table (updates live):
- t₀ = 2σ₀² (spreading time)
- v_g = k₀ (group velocity)
- v_ph = k₀/2 (phase velocity)
- σ(t) — current width
- Δx·Δp — current uncertainty product (green at t=0, yellow growing)

Animation controls: Play/Pause/Reset, speeds 0.25×–5×, loop toggle.

Time display: t = X.XX a.u. (t/t₀ = Y.YY)

tMax = 4·t₀ (resets automatically when σ₀ changes).

### Right panel — plots

**1. Main: |ψ(x,t)|²** (always visible, ~280px tall)
- Animated Gaussian — watch it spread and move
- Orange dashed line at ⟨x(t)⟩ (moves at k₀)
- Fixed x-axis range computed once from params to keep packet in view:
  `[x₀ − 4σ₀, x₀ + max(|k₀|·tMax, 1) + 4·σ(tMax)]`
- Toggle: |ψ|² / Re(ψ) / Im(ψ)  (Re/Im show the carrier wave riding the envelope)
- ? help modal: wavepacket formula, spreading width, group vs. phase velocity

**2. Momentum distribution |φ(k)|²** (collapsible, default open)
- Static Gaussian centred at k₀, width σ_p = 1/(2σ₀)
- Label: "Time-independent — does not change during animation"
- Grey annotation line at k = k₀
- ? help modal: FT formula, time-independence, Heisenberg uncertainty

**3. Expectation values** (collapsible, default open)
- Top subplot: ⟨x(t)⟩ (linear, slope = k₀) and ⟨p(t)⟩ (flat line at k₀)
- Bottom subplot: Δx(t) (growing hyperbola), Δp (flat), Δx·Δp with ħ/2 bound
  - ⟨x⟩ line is straight — classical free particle
  - Δx·Δp starts at 0.5 and grows — uncertainty never decreases after t=0
- ? help modal: Ehrenfest, spreading, Heisenberg bound

**4. Norm history** (collapsible, default closed)
- Flat line at 1.000 — exact normalisation

---

## Tests: `src/test/freeParticle.test.ts`

```
fpSigma / fpSpreadingTime
  ✓ fpSigma(0, σ₀) = σ₀
  ✓ fpSigma(t₀, σ₀) = σ₀√2  (width doubles at spreading time)
  ✓ fpSpreadingTime(σ₀) = 2σ₀²

fpProb
  ✓ integrates to 1 at t=0
  ✓ integrates to 1 at t=t₀
  ✓ peak at x₀ when t=0 and k₀=0
  ✓ peak at x₀+k₀t at time t (for several t, k₀ values)
  ✓ width (half-max) consistent with σ(t) at t=0 and t=t₀

fpExpectX / fpExpectP
  ✓ fpExpectX(0, x₀, k₀) = x₀
  ✓ fpExpectX(t, x₀, k₀) = x₀ + k₀t
  ✓ fpExpectP(k₀) = k₀  (trivially true, but documents intent)

fpDeltaX / fpDeltaP / uncertainty
  ✓ fpDeltaX(0, σ₀) = σ₀
  ✓ fpDeltaX(t₀, σ₀) = σ₀√2
  ✓ fpDeltaP(σ₀) = 1/(2σ₀)
  ✓ fpDeltaX(0)·fpDeltaP = 0.5  (minimum uncertainty at t=0)
  ✓ fpDeltaX(t₀)·fpDeltaP = √2/2 > 0.5  (grows after t=0)

fpMomentumDist
  ✓ integrates to 1
  ✓ peak at k₀
  ✓ width: value at k₀+σ_p is e^{−1/2} × peak  (σ_p = 1/(2σ₀))
  ✓ time-independent: same value at all t (φ has no t parameter — documents intent)
```

---

## Help modal content

### Main plot modal
- Initial Gaussian formula; time-evolved |ψ|² = Gaussian with σ(t) = σ₀√(1+(t/t₀)²)
- Group velocity v_g = k₀ vs. phase velocity v_ph = k₀/2
- Spreading time t₀ = 2σ₀² — use σ₀ slider to see effect

### Momentum modal
- FT of initial Gaussian: |φ(k)|² = Gaussian centred at k₀, width Δp = 1/(2σ₀)
- Time-independent: free-particle energy eigenstates e^{ikx} are stationary
- Heisenberg: narrow packet (small σ₀) → wide momentum distribution (large Δp)

### Expectation values modal
- Ehrenfest: d⟨x⟩/dt = ⟨p⟩ = k₀ (straight line)
- Spreading: Δx(t) = σ₀√(1+(t/t₀)²); once spread, cannot unsqueeze (no confinement)
- Heisenberg: Δx·Δp = ħ/2 only at t=0; any evolution increases it

---

## Implementation order

1. `src/physics/freeParticle.ts` + failing tests
2. Physics implementation → all tests pass
3. `FreeParticleExplorer.tsx` — controls + main animated plot
4. Momentum distribution plot (static)
5. Expectation values plot (history-based, same pattern as Time Evolution)
6. Norm history plot
7. All ? help modals
8. Add "Free Particle" tab to `App.tsx`
9. CHANGELOG + TODO + README update
