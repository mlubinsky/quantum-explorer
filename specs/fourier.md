# Fourier Explorer — Spec

## Goal

A dedicated module that makes the position ↔ momentum Fourier pair tactile:
move a slider, watch the momentum distribution respond instantly. Demonstrates
the uncertainty principle, the effect of chirp on bandwidth, and how ISW
eigenstates decompose into plane waves.

## Modes

### Gaussian

ψ(x) = (2πσ²)^(−1/4) exp(−(x−x₀)²/(4σ²)) exp(ik₀x)

|φ(k)|² = (1/σ_k√(2π)) exp(−(k−k₀)²/(2σ_k²)),  σ_k = 1/(2σ)

Δx = σ,  Δk = 1/(2σ),  Δx·Δk = ½  (minimum-uncertainty state, exact)

Sliders: x₀ (−10 to 10), k₀ (−5 to 5), σ (0.2 to 4)

### Chirped Gaussian

ψ_β(x) = (2πσ²)^(−1/4) exp(−(x−x₀)²/(4σ²)) exp(i[k₀x + β(x−x₀)²/2])

Local wave-vector: k_local(x) = k₀ + β(x−x₀)  — linearly swept frequency

|ψ_β|² identical to Gaussian (chirp is phase only), but FT is broader:

σ_k = √(1/(4σ²) + β²σ²)       — exact Fourier uncertainty

|φ_β(k)|² = (1/σ_k√(2π)) exp(−(k−k₀)²/(2σ_k²))   — still Gaussian

Δx·Δk = σ · σ_k ≥ ½  (= ½ iff β = 0)

Sliders: x₀, k₀, σ, β (−2 to 2)

### ISW eigenstate

ψₙ(x) = √(2/L) sin(nπx/L),  x ∈ [0, L]

|φₙ(k)|² exact — reuses `iswMomentumDist` from momentumSpace.ts

Δx = iswSigmaX(n, L) from isw.ts
Δk = nπ/L  (since ⟨k²⟩ = 2Eₙ = (nπ/L)², ⟨k⟩ = 0)

Sliders: n (1–8), L (2–20)

## New physics — `src/physics/fourier.ts`

Reuses existing: `fpProb`, `fpMomentumDist`, `fpRePsi`, `fpImPsi`
(freeParticle.ts), `iswMomentumDist` (momentumSpace.ts), `iswSigmaX`
(isw.ts). Only new logic:

| Function | Formula |
|---|---|
| `chirpedRePsi(x,x0,σ,k0,β)` | envelope × cos(k₀x + β(x−x₀)²/2) |
| `chirpedImPsi(x,x0,σ,k0,β)` | envelope × sin(k₀x + β(x−x₀)²/2) |
| `chirpedDeltaK(σ,β)` | √(1/(4σ²) + β²σ²) |
| `chirpedFTMag2(k,σ,k0,β)` | Normalized Gaussian with width σ_k |
| `gaussianDeltaX(σ)` | σ |
| `gaussianDeltaK(σ)` | 1/(2σ) |
| `iswDeltaK(n,L)` | nπ/L |

## UI — `src/components/FourierExplorer.tsx`

Layout: controls panel (left) + two stacked plots (right).

**Controls** — mode toggle (Gaussian / Chirped / ISW) + mode-specific sliders.

**Position plot** — |ψ(x)|² as filled area; Re(ψ) / Im(ψ) overlay toggle;
Δx bracket annotation.

**Momentum plot** — |φ(k)|²; Δk bracket annotation; peak markers at ±nπ/L
for ISW mode.

**Uncertainty readout** — table: Δx | Δk | Δx·Δk | ≥ ½? (green ✓).

## App.tsx wiring

- Module id: `'fourier'`
- Group: Single Particle — 1D (after Wigner Function)
- Label: `'Fourier Explorer'`
- Strip equation: `\hat\psi(k)=\tfrac{1}{\sqrt{2\pi}}\int\psi(x)\,e^{-ikx}\,dx`
- Strip BC:
  `\Delta x\,\Delta k\geq\tfrac{1}{2};\;\sigma_k=\sqrt{\tfrac{1}{4\sigma^2}+\beta^2\sigma^2};\;|\hat\psi_n(k)|^2\text{ two peaks at }k=\pm n\pi/L`

## URL state

- Gaussian mode: `mode`, `x0`, `k0`, `sigma`
- Chirped mode: `mode`, `x0`, `k0`, `sigma`, `beta`
- ISW mode: `mode`, `n`, `L`
