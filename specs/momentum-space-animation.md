# Spec: Momentum-space animation |φ(k,t)|²

## What this adds

A collapsible "Momentum-space |φ(k,t)|²" plot to `TimeEvolutionExplorer`, defaulting closed.
Mirrors the existing stationary-states `MomentumPlot` but animated — the distribution shifts
and reshapes as the coefficients accumulate phase.

---

## Physics

### ISW superposition

The time-evolved momentum amplitude is:

```
φ(k,t) = Σₙ cₙ e^{−iEₙt} φₙ(k)
```

where φₙ(k) is the exact Fourier transform of ψₙ(x):

```
φₙ(k) = 1/√(πL) · (1 − (−1)ⁿ e^{−ikL}) · nπ/L / ((nπ/L)² − k²)
```

(for k ≠ ±nπ/L; at the poles the resolved limit is `φₙ(kₙ) = −i(−1)ⁿ√(L/π)/2`)

|φ(k,t)|² = |Σₙ cₙ e^{−iEₙt} φₙ(k)|²

This is computed by summing complex amplitudes at each k then squaring the magnitude.
The existing `iswMomentumDist` only gives |φₙ(k)|² for a single eigenstate; this spec
adds the complex amplitude `iswMomentumAmplitude(n, L, k)` → `{re, im}`.

For a single eigenstate (one cₙ = 1): |φ(k,t)|² = |φₙ(k)|² (time-independent) — good
test case.

For a superposition, the distribution evolves: the beat between levels causes the
momentum peaks to interfere constructively and destructively in time.

### HO coherent state

The coherent state is also Gaussian in momentum space:

```
|φ_α(k,t)|² = (1/√(πω)) · exp(−(k − ⟨p(t)⟩)² / ω)
```

where `⟨p(t)⟩ = −|α|√(2ω) sin(ωt + φ_α)` (already in `hoCoherentExpectP`).

Width is constant: Δk = √(ω/2) = Δp (dual of Δx = 1/√(2ω)).
Peak slides at the same frequency as position, but in quadrature.

---

## New functions

### `src/physics/momentumSpace.ts` — additions

```ts
/**
 * Complex FT amplitude φₙ(k) for ISW eigenstate n.
 * Returns {re, im} such that |re² + im²| = iswMomentumDist(n, L, k).
 */
export function iswMomentumAmplitude(n: number, L: number, k: number): { re: number; im: number }

/**
 * |φ(k,t)|² for ISW superposition — time-evolved momentum distribution.
 * coeffs[i] = cᵢ₊₁ (1-indexed), real, assumed normalised.
 */
export function iswMomentumProbTE(
  k: number, t: number, coeffs: number[], L: number
): number

/**
 * |φ_α(k,t)|² for HO coherent state — exact Gaussian.
 */
export function hoCoherentMomentumProb(
  k: number, t: number, alpha: number, phiAlpha: number, omega: number
): number
```

---

## UI change

In `TimeEvolutionExplorer.tsx` — add one collapsible section at the bottom:

```tsx
<details style={detailsStyle}>
  <summary style={summaryStyle}>
    Momentum-space |φ(k,t)|²
    <HelpButton onClick={() => setShowHelpMomentum(true)} />
  </summary>
  <MomentumTEPlot subMode={subMode} t={t} normCoeffs={normCoeffs}
                  L={L} alpha={alpha} phiAlpha={phiAlpha} omega={omega} />
</details>
```

`MomentumTEPlot` is a new sub-component (can live inside `TimeEvolutionExplorer.tsx`).
It builds the k-grid and recomputes each animation frame via `useMemo([t, ...params])`.

---

## Tests

**`src/test/momentumSpaceTE.test.ts`**

```
iswMomentumAmplitude
  ✓ |amplitude|² matches iswMomentumDist for n=1,2,3 at several k values
  ✓ amplitude is real (no imaginary part) when k = nπ/(2L) and n odd   [symmetry check]

iswMomentumProbTE
  ✓ single eigenstate (c₁=1): iswMomentumProbTE(k,t,…) == iswMomentumDist(1,L,k) for all t
  ✓ norm: ∫ |φ(k,t)|² dk ≈ 1 for equal 1+2 mix at t=0 and t=T_rev/4
  ✓ symmetry: |φ(k,t)|² = |φ(−k,t)|² for real coefficients

hoCoherentMomentumProb
  ✓ at t=0: peak at k=0 when φ_α=0 (zero initial momentum)
  ✓ at t=π/(2ω): peak at k=−|α|√(2ω) (maximum negative momentum)
  ✓ integrates to 1
```

---

## Help modal content

- ISW: φ(k,t) = Σ cₙ(t) φₙ(k); time-dependent interference; Bragg peaks at k=±nπ/L
- HO: Gaussian dual of position; width = Δp = √(ω/2); peak tracks ⟨p(t)⟩ = −|α|√(2ω)sin(ωt+φ)
- Both: Heisenberg: Δx·Δp ≥ ħ/2; position peak and momentum peak are always in quadrature

---

## Implementation order

1. Add `iswMomentumAmplitude`, `iswMomentumProbTE`, `hoCoherentMomentumProb` to `momentumSpace.ts`
2. Tests (failing first)
3. Implement functions → tests pass
4. Add `MomentumTEPlot` sub-component + `showHelpMomentum` state to `TimeEvolutionExplorer.tsx`
5. Add `TimeEvolutionInfoPanel` branch for `topic='momentum'`
6. CHANGELOG + TODO
