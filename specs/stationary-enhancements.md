# Spec: Stationary States — three display enhancements

## Scope

Three additions to the existing `StationaryExplorer` / `WavefunctionPlot` module.
No new physics — all quantities are already derivable from the ISW and HO exact solutions
already in `src/physics/isw.ts` and `src/physics/harmonic.ts`.

---

## 1. Node count in wavefunction legend

### What
The wavefunction Plotly chart currently has `showlegend: false`.
Switch the selected state's trace to `showlegend: true` and label it
`ψₙ (k nodes)` (e.g. `ψ₃ (2 nodes)`).

For ISW: `ψₙ` has `n − 1` nodes.
For HO: `ψₙ` has exactly `n` nodes.

Both are analytic — no counting needed — but we should also verify by
actually counting sign changes in the computed wavefunction array
(same approach as QM's `countNodes`, margin = 5 points from each end
to avoid boundary noise).

### Files changed
- `src/components/WavefunctionPlot.tsx` — add `countNodes()` helper,
  enable `showlegend` on the selected-state trace, set `name` field.

### Test
`src/test/countNodes.test.ts`
- ISW ψ₁: 0 sign changes (confirmed by formula n−1)
- ISW ψ₃: 2 sign changes
- ISW ψ₅: 4 sign changes
- HO ψ₀: 0 sign changes
- HO ψ₂: 2 sign changes
- HO ψ₄: 4 sign changes

---

## 2. Energy levels table

### What
A compact table beneath (or alongside) the wavefunction plot listing all
computed energy levels at the current L / ω.  One row per level, columns:

| n | Eₙ (a.u.) | ΔEₙ = Eₙ − Eₙ₋₁ | Eₙ / E₁ |
|---|-----------|-----------------|---------|

For ISW `ΔEₙ = (2n−1)π²/2L²` grows with n (spacing is not uniform).
For HO every `ΔEₙ = ω` (uniform), so the ratio column is most interesting.

The currently selected row is highlighted in the accent colour.

### Files changed
- `src/components/EnergyLevelsTable.tsx` — new component; pure function of
  `potential`, `n`, `L`, `omega`, `nLevels`.
- `src/components/StationaryExplorer.tsx` — render `<EnergyLevelsTable>` below
  the plot.

### Test
`src/test/energyLevelsTable.test.ts`
- ISW L=10: E₁ = π²/200 ≈ 0.04935, E₂ = 4·E₁, E₃ = 9·E₁
- HO ω=1: E₀ = 0.5, E₁ = 1.5, E₂ = 2.5; all ΔE = 1.0

---

## 3. Matrix representation panel (Heisenberg picture)

### What
A new collapsible section in `StationaryExplorer` showing the matrix
representation of H, X, P in the energy eigenbasis.

#### 3a. Static view (t = 0)
Colour heatmap of the N×N matrix.  Row/column labels `ψ₁…ψ₈` (ISW) or
`ψ₀…ψ₇` (HO).

- **H**: diagonal by definition; white-to-red sequential scale.
- **X**: real, symmetric; blue–white–red diverging scale; zero entries
  reveal selection rules (ISW: same parity ↔ ⟨ψₘ|x|ψₙ⟩ = 0).
- **P**: stores Im[Pₘₙ]; purely imaginary → we show the imaginary part;
  antisymmetric; blue–white–red.

#### 3b. Animated view (Heisenberg picture)
Play/Pause/Reset controls + speed selector (0.25×, 0.5×, 1×, 2×, 5×).
Shows `Re[Oₘₙ(t)] = Oₘₙ(0) · cos((Eₘ − Eₙ)·t)`.
`t` displayed in a.u.
Diagonal entries are static (ωₙₙ = 0).

#### 3c. Bohr frequency table
`<details>` / `<summary>` collapsible below the heatmap.
N×N table of `ωₘₙ = Eₘ − Eₙ`.  Diagonal is zero.

### Physics utilities already available
`src/utils/matrixElements.ts` already exports `buildH`, `buildX`,
`buildP`, `heisenbergRe` — these can be used directly.
The wavefunction grids come from `iswEigenstate` / `hoEigenstate`.

### Files changed
- `src/components/MatrixHeatmap.tsx` — port from QM; adapt colour scheme
  to match dark theme.
- `src/components/MatrixPanel.tsx` — port from QM; remove
  `EigensolveResponse` API type dependency (pass `energies` + `wavefunctions`
  + `dx` directly as props).
- `src/components/StationaryExplorer.tsx` — add "Matrix" tab / collapsible
  section.
- `src/components/StationaryInfoPanel.tsx` — add matrix representation section
  to help modal.

### Test
`src/test/matrixElements.test.ts` (may already exist — extend if so)
- ISW n=1,2 on L=10 grid: `buildH` diagonal = [E₁, E₂]; off-diagonal = 0.
- ISW: `buildX` is symmetric: X[0][1] ≈ X[1][0].
- ISW: selection rules — X[0][0] ≈ L/2 (⟨x⟩ = L/2 for any ISW state).
- ISW: P diagonal = 0 (antisymmetry).
- `heisenbergRe` at t=0 returns matrix unchanged.
- `heisenbergRe` diagonal invariant: `Re[Hₙₙ(t)] = Hₙₙ(0)` for all t.

---

## UI layout

All three enhancements fit within the existing two-panel layout
(controls left, plot right):

```
[controls]   [wavefunction plot — now with legend for selected state]
             [energy levels table]
             [Matrix ▼ (collapsible)]
               [H | X | P buttons]  [Structure | Time-evolution buttons]
               [heatmap]
               [▶ Bohr frequencies (collapsible)]
```

## Help modal
Add a "Matrix representation" section to `StationaryInfoPanel`:
- Definition of matrix element ⟨ψₘ|Ô|ψₙ⟩
- Why H is diagonal
- Selection rule for X (parity)
- Why P is purely imaginary + antisymmetric
- Heisenberg time-evolution formula

## What is NOT in scope
- New potentials
- Time-evolution of superpositions (separate future feature)
- Momentum-space plots
- 2D or 3D visualizations
