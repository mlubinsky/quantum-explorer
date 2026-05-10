# Linear Stark Effect — spec

## Scope

New collapsible section **"Linear Stark Effect (n = 2)"** inside `HydrogenExplorer.tsx`.
Exact first-order perturbation theory — no numerics. Extends the existing hydrogen module.
Units: atomic units (ħ = mₑ = e = 1, a₀ = 1).

---

## Physics

### Setting

A uniform electric field **F** along the z-axis is applied to a hydrogen-like atom.
The perturbation Hamiltonian (in atomic units) is:

    H' = F z

where z is the electron's z-coordinate and F is the field magnitude in a.u.
(1 a.u. of field = e/(4πε₀a₀²) ≈ 5.14 × 10¹¹ V/m.)

### Why n = 2 first?

The n = 1 level has no linear Stark effect (⟨1s|z|1s⟩ = 0 and there are no
degenerate partners). The n = 2 level has accidental degeneracy between
|2s⟩ = |2,0,0⟩ and |2p₀⟩ = |2,1,0⟩, which lifts linearly in F.

### Key matrix element (a.u., Z-scaled hydrogen)

    ⟨2s|z|2p₀⟩ = −3/Z

All other off-diagonal z-matrix elements between n = 2 states vanish (selection rules
Δl = ±1, Δm = 0; and ⟨2p₁|z|2p₋₁⟩ = 0, ⟨2p_m|z|2p_m⟩ = 0).

### First-order energy shifts (degenerate perturbation theory)

The 4 × 4 H' matrix in the n = 2 basis {|2s⟩, |2p₋₁⟩, |2p₀⟩, |2p₊₁⟩} decouples:
- The m = ±1 states: no matrix elements → no first-order shift.
- The {|2s⟩, |2p₀⟩} 2 × 2 block:

      H'₂ₓ₂ = F × [[0, −3/Z], [−3/Z, 0]]

  Eigenvalues: ΔE = ±3F/Z.
  Eigenstates:
    - ΔE = −3F/Z → (|2s⟩ + |2p₀⟩)/√2 ≡ parabolic state (n₁=1, n₂=0, m=0)
    - ΔE = +3F/Z → (|2s⟩ − |2p₀⟩)/√2 ≡ parabolic state (n₁=0, n₂=1, m=0)

### Parabolic quantum numbers

Good quantum numbers for the hydrogen Stark problem are (n₁, n₂, m), where:

    n₁ + n₂ + |m| + 1 = n    (n₁, n₂ ≥ 0)

The general linear Stark energy shift (exact parabolic-coordinate result):

    ΔE = −(3/2) n (n₁ − n₂) F / Z    (a.u.)

For n = 2, the four parabolic states and their shifts:

| n₁ | n₂ | m  | ΔE     | Spherical state              |
|----|----|----|--------|------------------------------|
| 1  | 0  | 0  | −3 F/Z | (\|2s⟩ + \|2p₀⟩)/√2        |
| 0  | 1  | 0  | +3 F/Z | (\|2s⟩ − \|2p₀⟩)/√2        |
| 0  | 0  | +1 | 0      | \|2p₊₁⟩                     |
| 0  | 0  | −1 | 0      | \|2p₋₁⟩                     |

Physical picture (F along +z):
- The n₁=1, n₂=0 state has its charge cloud displaced toward −z (⟨z⟩ = −3/Z a₀).
  It gains potential energy from moving against the field → lower energy.
- The n₁=0, n₂=1 state is displaced toward +z (⟨z⟩ = +3/Z a₀) → higher energy.

### Electric dipole moment

The induced dipole moment of each shifted sublevel (first order):

    ⟨μ_z⟩ = −∂ΔE/∂F = ±3/Z    (a.u.)

### Expectation value of z

    ⟨z⟩ = −ΔE/F = (3/2) n (n₁ − n₂) / Z    (a.u.)

For n₁=1, n₂=0: ⟨z⟩ = −3/Z;  for n₁=0, n₂=1: ⟨z⟩ = +3/Z.

### Field ionization threshold (classical barrier suppression)

At field F_ion the Coulomb barrier is suppressed below the unperturbed level energy:

    F_ion = Z³ / (16 n⁴)    (a.u.)

For n = 2, Z = 1: F_ion = 1/256 ≈ 0.00391 a.u.
First-order perturbation theory is valid for F ≪ F_ion; the UI displays this threshold.

---

## New physics exports (`src/physics/hydrogen.ts`)

| Export | Description |
|---|---|
| `starkLinearShift(n, n1, n2, F, Z)` | ΔE = −(3/2)n(n₁−n₂)F/Z |
| `starkN2Sublevels(F, Z)` | 4 n=2 levels sorted by energy, with shifts and labels |
| `starkIonizationField(n, Z)` | F_ion = Z³/(16n⁴) |

`StarkLevel` interface:

```typescript
export interface StarkLevel {
  n1: number; n2: number; m: number
  shift: number; energy: number
  label: string          // spherical expansion label
}
```

---

## UI additions (`HydrogenExplorer.tsx`)

New `StarkSection` component, collapsible, rendered after the Anomalous Zeeman section.
Shows only n = 2 content (regardless of selected n); controlled by F slider.

### Controls
- **F slider**: 0 to 0.05 a.u., step 0.001, default 0
  - Note: "1 a.u. ≈ 5.14 × 10¹¹ V/m; ionization threshold at F_ion ≈ 0.004 a.u."
  - Reset button

### Plot — Sublevel fan diagram
- X-axis: F (0 → 0.05 a.u.)
- Y-axis: total energy E₂ + ΔE for each of the 4 states
- 4 traces, colored by energy shift:
  - Downward shifted (ΔE < 0): red/warm
  - Unshifted (ΔE = 0): white/grey (2 degenerate lines overlapping)
  - Upward shifted (ΔE > 0): blue/cool
- Dotted vertical line at current F
- Dotted horizontal line at E₁ (1s ground state) for reference
- Title shows: "n=2 linear Stark splitting"

### Readout table
Below the fan diagram, a monospace row per state:
- Parabolic label (n₁, n₂, m), spherical expansion, ΔE at current F, total E

### Physics note
- "Splitting = 6F/Z between upper and lower states"
- Link to ionization threshold

### Help button → opens 'stark' info panel topic

---

## Tests (`src/test/stark.test.ts`)

28 unit tests. Key groups:

### starkLinearShift
1. Zero at F=0 for any (n,n1,n2)
2. Zero when n1=n2 (no splitting)
3. Negative for n1>n2 at F>0 (downward state)
4. Positive for n1<n2 at F>0 (upward state)
5. Antisymmetric: shift(n,n1,n2,F,Z) = −shift(n,n2,n1,F,Z)
6. Exact value: n=2,n1=1,n2=0,F=1,Z=1 → −3
7. Exact value: n=2,n1=0,n2=1,F=0.01,Z=1 → +0.03
8. Z scaling: doubling Z halves the shift
9. n scaling: n=3 gives larger shift than n=2 for same (n1-n2)
10. Linear in F

### starkN2Sublevels
11. Returns exactly 4 levels
12. At F=0: all 4 levels degenerate at E₂ = hydrogenEnergy(2, Z)
13. At F>0: two shifted levels (ΔE=±3F/Z), two unshifted (ΔE=0)
14. Sorted ascending by energy
15. m=±1 levels have shift=0 at any F
16. Shifted pair energies: E₂−3F/Z and E₂+3F/Z
17. Energy = hydrogenEnergy(2,Z) + shift for every level
18. energy fields consistent with starkLinearShift
19. Parabolic quantum numbers present and correct (n1+n2+|m|=1)
20. n1=1,n2=0,m=0 state has shift = −3F/Z
21. n1=0,n2=1,m=0 state has shift = +3F/Z
22. Total splitting between shifted states = 6F/Z
23. Z=2 gives half the splitting compared to Z=1 at same F
24. Label strings non-empty for all levels

### starkIonizationField
25. F_ion = Z³/(16n⁴) exact
26. n=2, Z=1 → 1/256 ≈ 0.003906
27. Z scaling: F_ion(n,2Z) = 8 × F_ion(n,Z)
28. n scaling: F_ion(2n,Z) = F_ion(n,Z)/16

---

## Files to create / modify

| Action | File |
|---|---|
| new | `specs/stark.md` |
| new | `src/test/stark.test.ts` |
| modify | `src/physics/hydrogen.ts` — add 3 exports + StarkLevel interface |
| modify | `src/components/HydrogenExplorer.tsx` — add StarkSection component |
| modify | `src/components/HydrogenInfoPanel.tsx` — add 'stark' topic |
| modify | `TODO.md`, `CHANGELOG.md`, `README.md` |
