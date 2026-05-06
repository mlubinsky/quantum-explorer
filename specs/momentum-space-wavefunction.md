# Spec: Momentum-space wavefunction |φₙ(k)|²

## Physics background

Every quantum state has both a position-space representation ψₙ(x) and a
momentum-space representation φₙ(k), related by the Fourier transform:

    φₙ(k) = (1/√2π) ∫ ψₙ(x) e^{−ikx} dx

The momentum distribution |φₙ(k)|² gives the probability density of
measuring momentum ℏk.  Both ISW and HO have **exact closed-form**
momentum distributions, making this a natural fit for this project.

---

## Analytical formulas

### Infinite square well

Starting from ψₙ(x) = √(2/L) sin(nπx/L) on [0, L]:

    |φₙ(k)|² = (4n²π / L³) · sin²(kL/2 − nπ/2)
               ────────────────────────────────────
                       ((nπ/L)² − k²)²

The expression is 0/0 at k = ±nπ/L; the resolved limit is L/(4π).

**Key features:**
- Two symmetric peaks at k = ±nπ/L (the de Broglie wavenumber nπ/L = p/ℏ
  for a particle with energy Eₙ = n²π²/2L²).
- Higher n → peaks move outward to larger |k|; momentum grows.
- Width of each peak ∝ 1/L — wider well → narrower momentum peaks
  (Heisenberg uncertainty).

### Harmonic oscillator — self-duality

For V(x) = ½ω²x², the eigenfunctions transform under the Fourier transform
with eigenvalue (−i)ⁿ.  The momentum distribution equals the **position
distribution evaluated with the reciprocal frequency 1/ω**:

    |φₙ(k; ω)|² = |ψₙ(k; 1/ω)|² = hoWavefunction(n, k, 1/ω)²

This means:
- **ω = 1**: |φₙ(k)|² = |ψₙ(k)|² exactly — position and momentum
  distributions are identical in shape.
- **ω > 1**: position wavefunction is compressed (tighter well),
  momentum wavefunction is spread out — Heisenberg uncertainty is visible.
- **ω < 1**: opposite — wider in x, narrower in k.

For both potentials the uncertainty product satisfies:

| Potential | σ_x | σ_p | σ_x · σ_p |
|---|---|---|---|
| ISW, n=1 | L√(1/12 − 1/2π²) | π/L | ≥ 1/2 |
| HO | √((n+½)/ω) | √(ω(n+½)) | n + ½ ≥ ½ |

---

## New physics file: `src/physics/momentumSpace.ts`

### `iswMomentumDist(n, L, k): number`
Returns |φₙ(k)|² using the closed-form formula above.
Handles the pole at k = ±nπ/L by returning the limit L/(4π).

```ts
function iswMomentumDist(n: number, L: number, k: number): number
```

### `hoMomentumDist(n, omega, k): number`
Returns |φₙ(k)|² = hoWavefunction(n, k, 1/omega)².

```ts
function hoMomentumDist(n: number, omega: number, k: number): number
```

### `iswMomentumGrid(n, L, nPoints): { k: number[], phi2: number[] }`
Returns a k-grid and |φₙ(k)|² values ready for plotting.
k range: [−kMax, kMax] where kMax = max(4·nπ/L, 10/L).

### `hoMomentumGrid(n, omega, nPoints): { k: number[], phi2: number[] }`
Returns a k-grid and |φₙ(k)|² values ready for plotting.
k range symmetric around 0; width chosen to contain 99.9% of the distribution
(same criterion used for the position-space grid in `hoEigenstate`).

---

## New component: `src/components/MomentumPlot.tsx`

A Plotly chart for the selected eigenstate showing:
- **|φₙ(k)|²** curve in the accent colour (#4361ee).
- **Vertical dashed lines** at k = ±nπ/L for ISW (labeled "k = ±nπ/L").
- For HO with ω ≠ 1: a second overlaid curve showing |ψₙ(x)|² (scaled so
  its peak matches) to make the shape comparison visible.  For ω = 1 a text
  annotation "Same shape as |ψ|² (self-dual)" appears instead.
- x-axis: "k (a.u.⁻¹)".
- y-axis: "|φₙ(k)|²".
- σ_p annotation: "σ_p = X.XXXX a.u." computed from ∫ k² |φₙ(k)|² dk
  (numerical integral over the grid).
- Heisenberg product σ_x · σ_p shown in the corner.
- Dark theme matching the rest of the app.
- Height: 320 px.

---

## UI placement

A `<details>` / `<summary>` collapsible below `EnergyLevelsTable`, above
`Energy levels diagram`.

```
[WavefunctionPlot]
[EnergyLevelsTable]
▶ Momentum distribution |φₙ(k)|²   ← new, collapsed by default
▶ Energy levels diagram
▶ Matrix representation
```

---

## Files

| File | Action |
|---|---|
| `src/physics/momentumSpace.ts` | New — analytical formulas |
| `src/components/MomentumPlot.tsx` | New — Plotly chart |
| `src/components/StationaryExplorer.tsx` | Add `<details>` wrapper + import |
| `src/components/StationaryInfoPanel.tsx` | Add "Momentum space" section to help modal |

---

## Tests

**File:** `src/test/momentumSpace.test.ts`

### ISW tests

```
iswMomentumDist(1, 10, 0) — should equal 0 (node at k=0 for n odd)
iswMomentumDist(2, 10, 0) — should be > 0 (n even has k=0 non-zero)
iswMomentumDist(1, 10, Math.PI/10) — should equal L/(4π) = 10/(4π) (pole limit)
symmetry: iswMomentumDist(n, L, k) ≈ iswMomentumDist(n, L, -k) for all n, k
normalization: ∫ iswMomentumDist(1, L, k) dk ≈ 1  (numerical, dk=0.01, k in [-30/L, 30/L])
peak location: argmax(|φ₁(k)|²) ≈ π/L  for n=1
```

### HO tests

```
hoMomentumDist(n, 1, k) ≈ hoWavefunction(n, k, 1)²  for all n, k (self-duality at ω=1)
hoMomentumDist(0, 1, 0) > hoMomentumDist(0, 1, 1)  (ground state peaks at k=0)
normalization: ∫ hoMomentumDist(0, 1, k) dk ≈ 1  (numerical)
symmetry: hoMomentumDist(n, omega, k) ≈ hoMomentumDist(n, omega, -k)
```

### Heisenberg uncertainty (both potentials)

```
σ_p²(ISW, n=1, L=10) ≈ π²/L² = (π/10)²   (⟨p²⟩ = 2E₁)
σ_p²(HO,  n=0, ω=1) ≈ 0.5                 (⟨p²⟩ = ω/2)
σ_x · σ_p(ISW, n=1, L=10) ≥ 0.5
σ_x · σ_p(HO,  n=0, ω=1)  ≈ 0.5  (ground state saturates the bound)
```

---

## Help modal — inline `?` button on the component

`MomentumPlot` has its own `?` button in its header row (using the existing
`HelpButton` / `HelpModal` pattern).  Clicking it opens a modal with a new
`MomentumInfoPanel` component containing KaTeX formulas.

### `MomentumInfoPanel` content

**Sections (KaTeX formulas via `BlockMath` / `InlineMath` from `KatexMath.tsx`):**

1. **Fourier transform definition**
   ```
   \varphi_n(k) = \frac{1}{\sqrt{2\pi}} \int_{-\infty}^{\infty} \psi_n(x)\, e^{-ikx}\, dx
   ```
   |φₙ(k)|² is the probability density of measuring momentum ℏk.

2. **ISW momentum distribution**
   ```
   |\varphi_n(k)|^2 = \frac{4n^2\pi}{L^3}
     \cdot \frac{\sin^2\!\bigl(\tfrac{kL}{2} - \tfrac{n\pi}{2}\bigr)}
               {(n\pi/L)^2 - k^2)^2}
   ```
   Peaks at k = ±nπ/L — the de Broglie wavenumber for energy Eₙ.

3. **HO self-duality**
   ```
   |\varphi_n(k;\,\omega)|^2 = |\psi_n(k;\,1/\omega)|^2
   ```
   For ω = 1: position and momentum distributions are **identical**.
   For ω > 1: tighter in x, wider in k.
   For ω < 1: opposite.

4. **Heisenberg uncertainty**
   ```
   \sigma_x \cdot \sigma_p \geq \tfrac{\hbar}{2} = \tfrac{1}{2}
   ```
   HO ground state saturates the bound: σ_x · σ_p = ½.

5. **What to explore**
   - ISW: increase n and watch the peaks move to larger |k|.
   - ISW: increase L and watch the peaks narrow (wider well → better-defined
     momentum).
   - HO: set ω = 1 and confirm the momentum distribution is the same curve as
     the position distribution.
   - HO: increase ω above 1 and observe the momentum distribution widen while
     the position distribution narrows.
