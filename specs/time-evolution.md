# Spec: Time Evolution Module

## Scope

Two sub-modes under a new "Time Evolution" tab, both **exact analytical** (no Crank-Nicolson):

1. **ISW superposition** — general time-evolving state Σ cₙ ψₙ(x) e^{−iEₙt}
2. **HO coherent state** — displaced ground state |α⟩ oscillating without spreading

---

## Physics

### ISW superposition

```
ψ(x,t) = Σ_{n=1}^{8} cₙ ψₙ(x) e^{−iEₙt}
```

- cₙ are complex coefficients set by the user; normalised automatically: Σ|cₙ|² = 1
- ψₙ(x) = √(2/L) sin(nπx/L), Eₙ = n²π²/(2L²)
- Re(ψ), Im(ψ), |ψ|² all exact at every t
- Quantum revival at T_rev = 4ML²/π (in a.u., M=1: T_rev = 4L²/π)
- ⟨x(t)⟩ = Σ_{m,n} cₘ* cₙ X_{mn} e^{i(Eₘ−Eₙ)t}  (X_{mn} matrix elements, exact)
- ⟨p(t)⟩ = Σ_{m,n} cₘ* cₙ P_{mn} e^{i(Eₘ−Eₙ)t}  (P_{mn} matrix elements, exact)
- Δx(t)², Δp(t)² from ⟨x²⟩, ⟨x⟩², ⟨p²⟩, ⟨p⟩² — all via matrix elements
- Norm = Σ|cₙ|² = 1 exactly at all t (no drift)

### HO coherent state

```
ψ_α(x,t) = exp(−|α|²/2) Σ_{n=0}^{∞} (α^n / √n!) ψₙ(x) e^{−iEₙt}
```

Truncated to N=24 terms (|α|≤4, error < 10⁻¹⁰).

Closed-form Gaussian solution:
```
ψ_α(x,t) = (ω/π)^{1/4} exp(−ω(x−⟨x⟩)²/2 + i⟨p⟩(x−⟨x⟩) − iωt/2)
⟨x(t)⟩ = |α|√(2/ω) cos(ωt + φ_α)
⟨p(t)⟩ = −|α|√(2ω) sin(ωt + φ_α)
Δx = 1/√(2ω),  Δp = √(ω/2)  — constant (no spreading)
```

where φ_α = arg(α).

---

## New Files

### Physics

**`src/physics/timeEvolution.ts`**
```ts
// ISW
export function iswPsi(x: number, t: number, coeffs: number[], L: number): { re: number; im: number }
export function iswProb(x: number, t: number, coeffs: number[], L: number): number
export function iswExpectX(t: number, coeffs: number[], L: number): number
export function iswExpectP(t: number, coeffs: number[], L: number): number
export function iswExpectX2(t: number, coeffs: number[], L: number): number
export function iswExpectP2(t: number, coeffs: number[], L: number): number
export function iswRevivalPeriod(L: number): number  // 4L²/π

// HO coherent state
export function hoCoherentProb(x: number, t: number, alpha: number, phiAlpha: number, omega: number): number
export function hoCoherentExpectX(t: number, alpha: number, phiAlpha: number, omega: number): number
export function hoCoherentExpectP(t: number, alpha: number, phiAlpha: number, omega: number): number
```

All functions return scalars; callers build grids. No frame arrays stored in physics layer.

---

## UI Structure

New top-level tab: **"Time Evolution"** added to `App.tsx` alongside Spin-½ and Stationary States.

### `TimeEvolutionExplorer.tsx`

Sub-mode selector: **ISW Superposition** | **HO Coherent State**

#### ISW sub-mode controls (left panel, 260px)
- Well width L slider (2–20 a.u.)
- **Coefficient editor**: 8 rows, each showing n, |cₙ|, arg(cₙ) in degrees
  - Default: c₁=1, rest 0 (ground state)
  - Preset buttons: "Equal mix 1+2", "Gaussian envelope", "Revival demo" (c₁=c₂=1/√2)
  - Σ|cₙ|² live readout; auto-normalise button
- Revival period T_rev readout (exact, in a.u.)
- Animation controls: Play/Pause/Reset, speed (0.25×/0.5×/1×/2×/5×), loop toggle
- Time display: current t (a.u.), t/T_rev ratio

#### HO sub-mode controls (left panel, 260px)
- Frequency ω slider (0.2–3.0 a.u.)
- Displacement |α| slider (0–4)
- Phase φ_α slider (0°–360°)
- ⟨x(t)⟩, ⟨p(t)⟩ exact readout
- Animation controls (same as ISW)

#### Right panel — plots (stacked, all collapsible except main)

1. **Main: |ψ(x,t)|²** (always visible, ~300px tall)
   - Plotly line plot; x-axis = position, y-axis = probability density
   - Toggle: |ψ|² / Re(ψ) / Im(ψ)
   - ⟨x(t)⟩ marker: vertical dashed line at ⟨x⟩ position
   - For HO: overlay classical trajectory (x_cl = ⟨x(t)⟩ shown as moving dot)
   - Time cursor: thin vertical line at current t on the expectation values plot below
   - `?` help modal: superposition formula, Ehrenfest theorem, revival period

2. **Energy decomposition |cₙ|²** (collapsible, default open)
   - Bar chart: n on x-axis, |cₙ|² on y-axis
   - Time-independent (coefficients fixed); bars colour-coded by n
   - For HO: shows Poisson distribution |⟨n|α⟩|² = e^{−|α|²}|α|^{2n}/n!
   - `?` help modal: energy decomposition formula, Poisson statistics for coherent state

3. **Expectation values ⟨x(t)⟩ and ⟨p(t)⟩** (collapsible, default open)
   - Two-row subplot (mirrors QM's ExpectationValuesPlot)
   - Top: ⟨x(t)⟩ (blue) and ⟨p(t)⟩ (orange) vs t
   - Bottom: Δx(t) (blue), Δp(t) (orange), Δx·Δp (green) with ħ/2 = 0.5 horizontal bound (dashed red)
   - Moving time cursor line synced to animation
   - `?` help modal: Ehrenfest theorem, Heisenberg bound

4. **Norm history** (collapsible, default closed)
   - Line plot: ||ψ(t)||² = 1.0 (flat line) vs t — confirms exact normalisation
   - Purely a verification plot; label: "Norm = 1.000 (exact)"
   - `?` help modal: why norm is conserved exactly in the analytical approach

5. **Momentum-space |φ(k,t)|²** (collapsible, default closed)
   - At each t, cₙ(t) = cₙ e^{−iEₙt}; then φ(k,t) = Σ cₙ(t) φₙ(k)
   - |φ(k,t)|² = |Σ cₙ(t) φₙ(k)|² computed from exact φₙ(k) for ISW/HO
   - Plotly line; x = k, y = |φ(k,t)|²
   - `?` help modal: time-evolved momentum distribution formula

---

## Animation Loop

```ts
// In TimeEvolutionExplorer.tsx
const rafRef = useRef<number>()
const tRef = useRef(0)
const lastTimestampRef = useRef<number>()

function tick(timestamp: number) {
  const dt = (timestamp - (lastTimestampRef.current ?? timestamp)) / 1000  // ms → s
  lastTimestampRef.current = timestamp
  tRef.current += dt * speed
  if (loop && tRef.current > tMax) tRef.current %= tMax
  setT(tRef.current)
  rafRef.current = requestAnimationFrame(tick)
}
```

- `tMax` = 2 × T_rev for ISW, 4π/ω for HO (two full classical periods)
- Default speed = 1× means t advances at 0.1 a.u./s (so revival is visible in ~40s at 1×, ~8s at 5×)
- Grid: N_POINTS = 400 points; recomputed each frame via `useMemo`

---

## Tests

**`src/test/timeEvolution.test.ts`**

```
ISW superposition
  ✓ single eigenstate: |ψₙ(x,t)|² = |ψₙ(x)|² (time-independent)
  ✓ equal 1+2 mix: ⟨x⟩ oscillates between 0 and L at beat frequency ΔE₂₁
  ✓ norm = 1 at t=0, t=T_rev/4, t=T_rev
  ✓ revival: ψ(x, T_rev) = ψ(x, 0)  (within 1e-10)
  ✓ iswRevivalPeriod(L=10) = 4*100/π ≈ 127.32

HO coherent state
  ✓ hoCoherentProb is Gaussian: peak at ⟨x(t)⟩, width = 1/√(2ω)
  ✓ ⟨x(t)⟩ = |α|√(2/ω)cos(ωt + φ) at t=0, π/(2ω), π/ω
  ✓ ⟨p(t)⟩ = −|α|√(2ω)sin(ωt + φ) at t=0, π/(2ω)
  ✓ α=0 (ground state): ⟨x⟩=0, Δx=1/√(2ω) for all t
```

---

## Help Modals — Physics Content

### Main plot modal
- ISW: superposition formula, Ehrenfest: ⟨x⟩ oscillates classically, revival T_rev = 4ML²/π
- HO: coherent state definition, Gaussian packet, no spreading because coherent state is eigenstate of lowering operator

### Energy decomposition modal
- |cₙ|² = probability of measuring Eₙ
- For coherent state: Poisson distribution with mean n̄ = |α|²

### Expectation values modal
- Ehrenfest theorem: d⟨x⟩/dt = ⟨p⟩/M, d⟨p⟩/dt = −⟨V'(x)⟩
- Heisenberg: Δx·Δp ≥ ħ/2 = 0.5 a.u.

---

## Excluded from this spec

- Squeezed state (separate spec when coherent state is complete)
- Momentum-space animation for HO coherent state (HO φ(k,t) needs separate derivation)
- Current density J(x,t) = Im(ψ* ∂ψ/∂x)/M (can be added later; not in TODO)

---

## Implementation order

1. `src/physics/timeEvolution.ts` + tests (failing first)
2. `TimeEvolutionExplorer.tsx` — ISW sub-mode only: controls + main plot + animation
3. Energy decomposition bar chart
4. Expectation values plot
5. HO coherent state sub-mode
6. Norm history + momentum-space plots (both collapsible)
7. All `?` help modals
8. CHANGELOG + TODO update
