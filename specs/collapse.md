# Wavefunction Collapse — Spec

## Goal

Add a **Quantum Measurement** section to the Free Particle Explorer.  
The user clicks "Measure x̂" or "Measure p̂" while the Gaussian wavepacket
evolves; the wavefunction collapses (Born-rule sample), resets to a new
Gaussian, and immediately re-spreads.  The cycle makes measurement backaction
and the position–momentum trade-off viscerally concrete.

## Physics — `src/physics/collapse.ts`

All functions are pure.

### Sampling

```
sampleGaussian(mean, sigma) → number
```
Uses the Box-Muller transform to draw one sample from N(mean, sigma²).
No `Math.random` calls inside tests — tests pass a seeded PRNG instead via an
optional `rand` argument.

```
sampleGaussian(mean, sigma, rand? = Math.random) → number
```

### Born-rule density at a point

```
bornProbDensityX(xMeas, meanX, sigmaX) → number
  = (1/(sigmaX √2π)) exp(−(xMeas−meanX)²/(2 sigmaX²))
  — value of the PDF (not integrated probability)

bornProbDensityK(kMeas, k0, sigmaK) → number
  = (1/(sigmaK √2π)) exp(−(kMeas−k0)²/(2 sigmaK²))
```

### Post-collapse state — position measurement

The detector resolves position to within σ_det.  Post-collapse wavepacket:

```
collapsePosition(xMeas, k0, sigmaDet) → { x0, k0, sigma0 }
  x0    = xMeas
  k0    = k0          (momentum expectation preserved; no recoil in 1D ideal measurement)
  sigma0 = sigmaDet
```

### Post-collapse state — momentum measurement

The detector resolves momentum to within σ_k (= 1/(2 σ_x_new) by HUP minimum).
Post-collapse wavepacket:

```
collapseMomentum(xAtMeas, kMeas, sigmaK) → { x0, k0, sigma0 }
  x0    = xAtMeas
  k0    = kMeas
  sigma0 = 1 / (2 * sigmaK)     // HUP: σ_x_new = 1/(2 σ_k)
```

### Measurement record

```typescript
export interface MeasurementEvent {
  type:    'position' | 'momentum'
  value:   number    // measured x or k
  tAt:     number    // simulation time of measurement
  prob:    number    // Born-rule PDF density at the sampled point
}
```

## UI — added to `FreeParticleExplorer.tsx`

A new collapsible **"Quantum Measurement"** section (below the existing norm
section):

### Controls

- **Detector width** slider, `σ_det` ∈ [0.1, 2.0], default 0.3 a₀
  - Label: "Detector width σ_det"
  - Applies to position measurements; for momentum measurements the implied
    momentum resolution is `σ_k = 1/(2 σ_det)` and displayed below slider.
- **[Measure x̂]** button — samples x_meas from |ψ(x,t)|², collapses,
  resets wavepacket, pauses animation, appends MeasurementEvent.
- **[Measure p̂]** button — samples k_meas from |φ(k)|², collapses,
  resets wavepacket, pauses animation, appends MeasurementEvent.
- **[Clear log]** button.

### Measurement log

Horizontal scrolling strip (max 8 events), most-recent right.  Each chip shows:

```
x̂  t=1.23  x=−0.41  p(x)=0.391
p̂  t=3.10  k=+0.87  p(k)=0.623
```

### Plot overlay

After a measurement the main position plot draws a vertical dashed line at the
measured x value (or, for momentum, at ⟨x⟩ at time of measurement) in a
distinct colour (red for x-measurement, purple for p-measurement).  The line
persists until the next measurement or a manual reset.

## How collapse resets the wavepacket

After either measurement:
1. Compute the new `{ x0, k0, sigma0 }` from the collapse function.
2. Call the existing `setX0`, `setK0`, `setSigma0` setters with the new values.
   (This triggers the existing `useEffect` that resets `t = 0` and `histRef`.)
3. Store the measurement event.
4. Do NOT reset t manually — the parameter-change effect already does so.

## Tests — `src/test/collapse.test.ts`

- `sampleGaussian` with `rand = () => 0.5` (Box-Muller edge case)
- Mean/variance check over N=10 000 samples (statistical)
- `bornProbDensityX` at mean equals 1/(σ√2π)
- `bornProbDensityX` is symmetric around mean
- `bornProbDensityK` analogously
- `collapsePosition` output fields
- `collapseMomentum` output fields and σ₀ = 1/(2 σ_k) relation
- HUP: collapsed σ₀·σ_k ≥ 0.5 for all σ_det values
