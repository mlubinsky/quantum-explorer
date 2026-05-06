# Spec: Energy Levels Diagram

## What it is

A dedicated Plotly chart showing the potential V(x) as a filled shape with
horizontal energy lines at each Eₙ.  Unlike `WavefunctionPlot` (which also
draws energy lines, but as a backdrop for the wavefunctions), this chart is a
pure energy visualisation: no wavefunctions, just V(x) and the levels.

The label on each line shows the energy in **both atomic units and eV** —
e.g. `E₁ = 0.0049 a.u. / 0.134 eV`.  The selected level is highlighted.

This is the same information as `SecondaryPlot` (stationary mode) in the
parent QM project, adapted to the dark theme and exact-solution context.

---

## Potentials

### Infinite square well
- V(x) = 0 inside [0, L]; displayed as two tall filled rectangles (walls)
  flanking the well region.
- Horizontal energy lines drawn across the full well width [0, L].
- Labels positioned at the right wall, right-aligned.

### Harmonic oscillator
- V(x) = ½ω²x² drawn as a filled parabola (same style as `WavefunctionPlot`).
- Horizontal energy lines drawn between the classical turning points ±x_c(n).
- Labels positioned to the right of the right turning point.

---

## UI placement

A `<details>` / `<summary>` collapsible below `EnergyLevelsTable`, above
`MatrixPanel`.  Closed by default.

```
[WavefunctionPlot]
[EnergyLevelsTable]
▶ Energy levels diagram   ← new, collapsed by default
▶ Matrix representation
```

---

## Files

| File | Action |
|---|---|
| `src/components/EnergyLevelsDiagram.tsx` | New component |
| `src/components/StationaryExplorer.tsx` | Add `<details>` wrapper + import |

`EnergyLevelsDiagram` receives the same props as `WavefunctionPlot`:
`potential`, `n`, `L`, `omega`.  It computes energies internally via
`iswEnergy` / `hoEnergy` / `hoPotential` (all already available).

No new physics files needed.

---

## Conversion: a.u. → eV

`1 a.u. (Hartree) = 27.2114 eV`

Use the existing `auToEv` from `src/utils/units.ts`.

---

## Visual spec

- Dark theme matching the rest of the app (`paper_bgcolor: '#0d0d0d'`, etc.)
- Selected level: blue accent line (`#4361ee`), bold label.
- Other levels: dim (`rgba(150,160,220,0.4)`), smaller label.
- V(x) fill: same semi-transparent fill as `WavefunctionPlot`.
- No wavefunction traces — this chart is energy-only.
- y-axis: "Energy (a.u.)" with a secondary annotation "(eV)" on each label.
- x-axis: "x (a.u.)".
- Height: 420 px.

---

## Tests

**File:** `src/test/energyLevelsDiagram.test.ts`

The component itself is a Plotly wrapper — there is no new pure-function
physics to test.  The underlying energy functions are already tested.  Tests
should verify the `auToEv` conversion used for labels.

```
auToEv(1.0)  ≈  27.2114  (1 Hartree = 27.2114 eV)
auToEv(0)    =  0
auToEv(iswEnergy(1, 10))  ≈  0.1336 eV  (π²/200 × 27.2114)
```

---

## Help modal — inline `?` button on the component

`EnergyLevelsDiagram` has its own `?` button in its header row (using the
existing `HelpButton` / `HelpModal` pattern).  Clicking it opens a modal
with a new `EnergyLevelsDiagramInfoPanel` component containing KaTeX formulas.

### `EnergyLevelsDiagramInfoPanel` content

**Sections (KaTeX formulas via `BlockMath` / `InlineMath` from `KatexMath.tsx`):**

1. **What this chart shows** — V(x) with quantised energy levels; why the
   levels are discrete (Dirichlet boundary conditions → standing waves).

2. **ISW energy formula**
   ```
   E_n = n^2 \pi^2 / 2L^2
   ```
   Level spacing grows: ΔEₙ = Eₙ − Eₙ₋₁ = (2n−1)π²/2L².

3. **HO energy formula**
   ```
   E_n = \omega\!\left(n + \tfrac{1}{2}\right)
   ```
   Level spacing is uniform: ΔEₙ = ω for all n.

4. **eV conversion** — 1 a.u. (Hartree) = 27.2114 eV.

5. **What to explore** — drag L slider (ISW) and observe levels scaling as 1/L²;
   drag ω (HO) and observe uniform compression/expansion of all levels.
