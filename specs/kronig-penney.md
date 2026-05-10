# Kronig-Penney Model — spec

## Scope

New sub-tab **"Kronig-Penney"** (5th) in the Scattering module.
Exact analytical — no numerical eigensolver, no time stepper.
Units: atomic units (ħ = m = 1).

---

## Physics

### Model

A 1D periodic array of delta-function barriers with spacing a (lattice constant):

    V(x) = α · a · Σ_n δ(x − n a)    (α = barrier strength, a.u.)

The dimensionless barrier strength is P = α · a.

### Bloch dispersion relation

Bloch's theorem requires the wavefunction to satisfy ψ(x + a) = e^{iKa} ψ(x).
Matching boundary conditions at each delta barrier gives the exact transcendental relation:

    cos(Ka) = f(ka)  where  f(u) = cos(u) + P · sin(u) / u,   u = ka = a · √(2E)

- K is the Bloch wavevector, Ka ∈ [0, π] (first Brillouin zone)
- k = √(2E) is the free-particle wavevector in the barrier-free region
- At u = 0: f → 1 + P  (L'Hôpital)

### Allowed bands and forbidden gaps

- **Allowed band**: |f(ka)| ≤ 1  →  Ka = arccos(f(ka)) ∈ [0, π]
- **Forbidden gap**: |f(ka)| > 1  →  no real Bloch wavevector

### Zone boundary energies (exact)

At ka = nπ (n = 1, 2, 3, …): sin(nπ) = 0, so f = cos(nπ) = (−1)ⁿ = ±1.
These energies E_n = (nπ/a)² / 2 are always on a band boundary regardless of P.
Gaps open around these points when P ≠ 0.

### Limits

| Limit | Physics |
|---|---|
| P → 0 | Free particle: f = cos(ka), no gaps, continuous spectrum |
| P → ∞ | Tight-binding: all energy in gaps, infinitely narrow bands |
| a → 0 (fixed P) | Dense barriers → effectively raises V₀ → free particle in a box |

---

## New physics functions (`src/physics/kronigPenney.ts`)

| Export | Description |
|---|---|
| `kpP(alpha, a)` | Dimensionless barrier strength P = α · a |
| `kpRHS(E, P, a)` | f(ka) = cos(ka) + P · sin(ka) / (ka); limit 1+P at E=0 |
| `kpAllowed(E, P, a)` | True iff |f(ka)| ≤ 1 |
| `kpBlochKa(E, P, a)` | Ka = arccos(f) ∈ [0,π]; NaN in gap |
| `kpZoneBoundaries(a, nMax)` | Zone-boundary energies E_n = (nπ/a)²/2 for n=1..nMax |

---

## UI — `KronigPenneyExplorer.tsx`

### Controls
- **α slider**: 0 to 5, step 0.1, default 1.5 (barrier strength)
- **a slider**: 1 to 8, step 0.5, default 4 (lattice constant a₀)
- **P readout**: P = α · a (derived, displayed prominently)

### Section 1 — Dispersion condition f(E)
- X-axis: E (a.u.), range [0, E_MAX] where E_MAX ≈ 4 zone periods
- Y-axis: f(ka) = cos(Ka)
- Cyan line trace: the RHS function f(E)
- Two horizontal dashed lines at y = ±1
- Background: red-tinted shapes for forbidden regions |f| > 1; blue-tinted for allowed
- Annotation: "Allowed band" / "Forbidden gap" labels
- ? help modal

### Section 2 — Band structure E(Ka/π)
- X-axis: Ka/π ∈ [0, 1] (reduced Brillouin zone)
- Y-axis: E (a.u.)
- Scatter of (Ka/π, E) for all allowed energies; each band colored differently
- Zone-boundary lines at Ka/π = 0 and 1
- ? help modal

### Section 3 — Band/gap summary table
- Shows first 4 zone-boundary energies E_n = (nπ/a)²/2
- Indicates which zone boundaries have gaps (depends on P)
- Shows approximate bandwidth (% of zone period with |f| ≤ 1)

### Readout
- P = α · a, whether P = 0 (free particle)
- First zone-boundary energy E₁ = (π/a)²/2

---

## Files to create / modify

| Action | File |
|---|---|
| new | `specs/kronig-penney.md` |
| new | `src/physics/kronigPenney.ts` |
| new | `src/test/kronigPenney.test.ts` |
| new | `src/components/KronigPenneyExplorer.tsx` |
| modify | `src/components/ScatteringExplorer.tsx` — add 'kronig-penney' tab |
| modify | `src/components/ScatteringInfoPanel.tsx` — add 3 KP topics |
| modify | `TODO.md`, `CHANGELOG.md`, `README.md` |

---

## Tests to write (TDD)

~24 tests across: kpP, kpRHS (limit, zone boundaries, P=0 free particle, general formula),
kpAllowed (forbidden at E=0 for P>0, always allowed for P=0, boundaries at ka=nπ, known gap/band),
kpBlochKa (NaN in gap, zone center, zone boundary, range [0,π]),
kpZoneBoundaries (values, length, monotonicity, independence of P).
