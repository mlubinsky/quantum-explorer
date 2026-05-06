# Spec: HO Squeezed State

## What this adds

A third sub-mode "HO Squeezed" in `TimeEvolutionExplorer`, alongside "ISW Superposition"
and "HO Coherent". Shows a Gaussian wavepacket whose width breathes at 2ω while the
centre oscillates at ω — the most dramatic demonstration of the Heisenberg uncertainty
trade-off.

---

## Physics

### State and time evolution

A squeezed coherent state S(r)|α⟩ evolved under HO (V = ½ω²x², ħ = m = 1).
Under HO evolution the squeezing angle rotates at 2ω in phase space, producing a
"breathing" Gaussian.

**Probability density** (exact closed form):

```
|ψ_sq(x,t)|² = (1/(√π · σ(t))) · exp(−(x − ⟨x(t)⟩)² / σ²(t))

σ(t) = √[(1/ω) · (cosh(2r) − sinh(2r)·cos(2ωt))]
```

- At t = 0: σ = e^{−r}/√ω  (narrowest, squeezed along x)
- At t = π/(2ω): σ = √(cosh(2r)/ω)  (intermediate)
- At t = π/ω: σ = e^r/√ω  (widest, anti-squeezed)
- Period of breathing = π/ω (half the classical orbit period)

**Centre of mass** (same as coherent state):

```
⟨x(t)⟩ = |α|√(2/ω) · cos(ωt + φ_α)
```

**Uncertainties**:

```
Δx(t) = σ(t)/√2 = √[(1/(2ω)) · (cosh(2r) − sinh(2r)·cos(2ωt))]
Δp(t) = √[(ω/2) · (cosh(2r) + sinh(2r)·cos(2ωt))]
Δx(t)·Δp(t) = (1/2)·√[cosh²(2r) − sinh²(2r)·cos²(2ωt)]
```

- Minimum Δx·Δp = 1/2 achieved at t = 0, π/ω, 2π/ω, … (squeeze axis aligned with x)
- Maximum Δx·Δp = cosh(2r)/2 at t = π/(2ω), 3π/(2ω), … (squeeze axis at 45°)
- For r = 0: reduces to coherent state with constant Δx·Δp = 1/2

**Momentum-space** (also exact Gaussian, dual breathing):

```
|φ_sq(k,t)|² = (1/(√π · σ_p(t))) · exp(−(k − ⟨p(t)⟩)² / σ_p²(t))

σ_p(t) = √[ω · (cosh(2r) + sinh(2r)·cos(2ωt))]  (= √2 · Δp(t))
⟨p(t)⟩ = −|α|√(2ω) · sin(ωt + φ_α)
```

When x is squeezed (small σ), momentum is anti-squeezed (large σ_p), and vice versa.

---

## New functions

### `src/physics/timeEvolution.ts` — additions

```ts
/**
 * |ψ_sq(x,t)|² for HO squeezed coherent state.
 * r: squeeze parameter (r=0 → coherent state)
 */
export function hoSqueezedProb(
  x: number, t: number, alpha: number, phiAlpha: number,
  omega: number, r: number
): number

/** Δx(t) = σ(t)/√2 */
export function hoSqueezedDeltaX(t: number, omega: number, r: number): number

/** Δp(t) = σ_p(t)/√2 */
export function hoSqueezedDeltaP(t: number, omega: number, r: number): number

/** σ(t) — position Gaussian width */
export function hoSqueezedSigmaX(t: number, omega: number, r: number): number

/** σ_p(t) — momentum Gaussian width */
export function hoSqueezedSigmaP(t: number, omega: number, r: number): number
```

Reuse `hoCoherentExpectX` and `hoCoherentExpectP` for the centre trajectory.

### `src/physics/momentumSpace.ts` — addition

```ts
/**
 * |φ_sq(k,t)|² for HO squeezed coherent state — exact Gaussian.
 */
export function hoSqueezedMomentumProb(
  k: number, t: number, alpha: number, phiAlpha: number,
  omega: number, r: number
): number
```

---

## UI change

**`TimeEvolutionExplorer.tsx`**

Sub-mode selector gains a third button: `'ho-sq'`

Controls (left panel):
- Reuse ω, |α|, φ_α sliders from HO coherent
- Add: **Squeeze r** slider, range 0–2, step 0.05
  - Hint: "r=0 → coherent; r=1 → Δx shrinks by e⁻¹"
- Readout table: ⟨x(t)⟩, ⟨p(t)⟩, Δx(t), Δp(t), Δx·Δp (green when = 0.500, yellow otherwise)
- Breathing period T_sq = π/ω readout

Plots: same 4 panels as HO coherent (main, decomp, expectation values, norm history),
plus the momentum-space plot from feature 1.

Energy decomposition: squeezed vacuum has Fock-state expansion:
```
⟨n|S(r)D(α)|0⟩ → weights |cₙ|² (sub-Poissonian for r>0 when |α|=0)
```
Use existing Poisson bar chart as approximation; note in help that the exact
squeezed-state Fock expansion requires Hermite polynomials and is displayed approximately.

---

## Tests

**`src/test/hoSqueezedState.test.ts`**

```
hoSqueezedProb
  ✓ r=0 matches hoCoherentProb exactly
  ✓ peak at ⟨x(t=0)⟩ = |α|√(2/ω)
  ✓ integrates to 1 at t=0 and t=π/(4ω)
  ✓ width at t=0: σ(0) = e^{−r}/√ω  (squeezed)
  ✓ width at t=π/ω: σ = e^r/√ω  (anti-squeezed)

hoSqueezedDeltaX / DeltaP
  ✓ Δx(0) = e^{−r}/√(2ω)
  ✓ Δp(0) = e^r·√(ω/2)
  ✓ Δx(π/ω) = e^r/√(2ω)  (anti-squeezed)
  ✓ Δx(t)·Δp(t) = 0.5 at t=0 (minimum uncertainty)
  ✓ Δx(t)·Δp(t) = cosh(2r)/2 at t=π/(2ω) (maximum)
  ✓ r=0: Δx·Δp = 0.5 for all t
```

---

## Help modal content

- Squeezed state definition: S(r) = exp(r(a²−a†²)/2)
- Under HO evolution: squeezing angle rotates at 2ω → "breathing"
- σ(t) formula + what happens at t=0 (narrowest), t=π/ω (widest)
- Δx·Δp oscillates between 1/2 and cosh(2r)/2 — minimum uncertainty twice per breath
- Physical interpretation: like squeezing a balloon — push x, momentum inflates

---

## Implementation order

1. Add physics functions to `timeEvolution.ts` and `momentumSpace.ts`
2. Tests (failing first)
3. Implement functions → tests pass
4. Add `'ho-sq'` sub-mode to `TimeEvolutionExplorer.tsx`
5. Help modal content
6. CHANGELOG + TODO
