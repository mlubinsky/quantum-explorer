# Hydrogen Atom — spec

## Scope

New top-level module **Hydrogen** in `App.tsx` (tab label "Hydrogen Atom").  
Exact analytical solutions only — no numerical radial solver, no Python backend.  
Units: atomic units (a₀ = 1, ħ = 1, mₑ = 1).

## Physics

### Energy levels
E_n = −Z²/(2n²)  (Hartree)

### Radial wavefunctions
R_nl(r) = −sqrt((2Z/n)³ · (n−l−1)! / (2n·(n+l)!³)) · exp(−Zr/n) · (2Zr/n)^l · L_{n−l−1}^{2l+1}(2Zr/n)

Associated Laguerre polynomials computed via explicit three-term recurrence:
  L_0^α(x) = 1
  L_1^α(x) = 1 + α − x
  L_{k+1}^α(x) = ((2k+1+α−x)·L_k^α(x) − (k+α)·L_{k−1}^α(x)) / (k+1)

Radial probability density: P(r) = r² |R_nl(r)|²

Expectation value (exact):
  ⟨r⟩_nl = (a₀/2Z) · (3n² − l(l+1))

Radial nodes: n − l − 1

### Spherical harmonics (real, normalised, |Y_l^m|² averaged over φ)
For the 2D xz-plane cross-section:
  |ψ_nlm(r,θ)|² ∝ |R_nl(r)|² · |Θ_lm(θ)|²
where the θ-only factor comes from the real form of Y_l^m.

Real spherical harmonic angular factors |Θ_lm(θ)|² (normalised):
  Y_00:  1/(4π)
  Y_10:  (3/4π)cos²θ
  Y_1±1: (3/8π)sin²θ
  Y_20:  (5/16π)(3cos²θ−1)²
  Y_2±1: (15/8π)sin²θcos²θ
  Y_2±2: (15/32π)sin⁴θ
  ... and so on via exact Legendre polynomial formula

For plotting use the full 2D grid (r,θ) → (x=r sinθ, z=r cosθ).

## Parameters

| Parameter | Range | Default |
|-----------|-------|---------|
| n (principal) | 1–5 | 1 |
| l (angular) | 0..n−1 | 0 |
| m (magnetic) | −l..l | 0 |
| Z (nuclear charge) | 1–10 | 1 |

## Sections / Plots

### 1. Quantum number controls
- Dropdowns: n (1–5), l (0..n−1, constrained), m (−l..l, constrained)
- Slider: Z (1–10, integer steps)
- Live readout: n, l, m, E_n, ⟨r⟩, radial nodes, angular nodes

### 2. Radial density P(r)
- x-axis: r from 0 to r_max = (n² * (n+3)) / Z * 2 (covers 99%+ of density)
- y-axis: P(r) = r² |R_nl(r)|²
- Annotation: ⟨r⟩ vertical dashed line; label radial node count
- Dark theme (matches existing plots)
- ? help modal

### 3. Radial wavefunction R_nl(r)
- Same x-range as P(r); separate collapsible section
- y-axis: R_nl(r)
- Sign convention: outermost lobe positive
- ? help modal (shared with P(r) section)

### 4. 2D orbital cross-section (xz-plane)
- Heatmap of |ψ_nlm(r,θ)|² in xz-plane
- Grid: 200×200, r from 0 to r_max, θ from 0 to 2π
- Colour scale: Viridis
- x and z axes in a₀
- ? help modal

### 5. Energy level diagram (Grotrian)
- Levels: n = 1..5, grouped by l
- Columns: l = 0 (s), 1 (p), 2 (d), 3 (f), 4 (g)
- Horizontal lines at E_n = −Z²/(2n²)
- Transition arrows between levels obeying Δl = ±1
- Arrows coloured by photon wavelength series:
  - Lyman (→n=1): UV, violet (#7b2fff)
  - Balmer (→n=2): visible, blue→red by wavelength
  - Paschen (→n=3): IR, orange (#ff8c00)
  - Brackett+ (→n≥4): IR, red (#cc4444)
- Hover tooltip: transition, ΔE (a.u.), λ (nm) [using Rydberg constant 91.18 nm × n²/(n²−n_f²)]
- Currently selected state (n,l) highlighted
- ? help modal

## Files to create

- `specs/hydrogen.md` (this file)
- `src/physics/hydrogen.ts` — pure functions: `assocLaguerre`, `radialWavefunction`, `radialDensity`, `orbitalDensity2D`, `hydrogenEnergy`, `meanRadius`, `bohrRadius`
- `src/test/hydrogen.test.ts` — unit tests
- `src/components/HydrogenExplorer.tsx` — main UI
- `src/components/HydrogenInfoPanel.tsx` — KaTeX help content

## Tests to write (before implementation)

1. E_1 = −Z²/2 (ground state energy)
2. E_n scaling: E_2 = E_1/4
3. ⟨r⟩_10 = 3/(2Z) (1s mean radius)
4. ⟨r⟩_21 = 5/Z (2p mean radius: (3·4−1·2)/(2Z) = 10/(2Z) = 5/Z)
5. R_10(0) = 2Z^{3/2} (1s at origin)
6. Norm: ∫₀^∞ P(r) dr = 1 (numerical, tol 1e-4) for (1,0), (2,1), (3,2), (4,3), (5,4)
7. Radial nodes: n−l−1 zero crossings of R_nl(r) on (0, r_max)
8. assocLaguerre(0, 0, x) = 1
9. assocLaguerre(1, 0, x) = 1 − x
10. assocLaguerre(2, 0, x) = 1 − 2x + x²/2 (check at x=0 and x=1)
11. P(r) ≥ 0 everywhere
12. 2D density integrates to ~1 (rough 2D trapezoidal check)

## CHANGELOG / TODO

- Add to Done: Hydrogen atom — radial density, Grotrian diagram, 2D cross-section
- Remove from TODO: the Hydrogen phase-2 items: energy level diagram, radial probability, emission spectra
