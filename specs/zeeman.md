# Normal Zeeman Effect — spec

## Scope

New collapsible section **"Normal Zeeman Effect"** inside `HydrogenExplorer.tsx`.
Exact analytical, no numerics. Extends the existing hydrogen module.
Units: atomic units (ħ = mₑ = e = 1). Labelled as "simplified nonrelativistic model."

---

## Physics

### Energy of sublevel |n, l, m_l⟩ in a uniform magnetic field B (along z)

In the normal Zeeman effect (orbital angular momentum only, spin ignored):

    E(n, l, m_l, B) = E_n + μ_B · B · m_l

where

    E_n = −Z²/(2n²)     (zero-field hydrogen energy, Hartree)
    μ_B = 1/2            (Bohr magneton in atomic units)

So the shift is:

    ΔE(m_l, B) = μ_B · B · m_l = B · m_l / 2

- m_l = −l, −l+1, …, l−1, l
- Positive B raises m_l > 0 sublevels, lowers m_l < 0 sublevels
- m_l = 0 sublevel is unchanged
- At B = 0 all 2l+1 sublevels are degenerate

### Lorentz triplet (normal Zeeman effect)

For any E1-allowed transition (nHi, lHi) → (nLo, lLo) with |Δl| = 1:

    ΔE(σ+) = ΔE₀ + μ_B B    (Δm_l = +1, upper m_l − lower m_l = +1)
    ΔE(π)  = ΔE₀             (Δm_l =  0)
    ΔE(σ−) = ΔE₀ − μ_B B    (Δm_l = −1)

where ΔE₀ = E_nHi − E_nLo is the unperturbed transition energy.

Key insight: the photon energy depends only on Δm_l, not on the specific m_l values.
Multiple m_l paths contribute to each component but produce the same frequency.
This is why there are always exactly **3 lines** regardless of l values (Lorentz triplet).

### Selection rules for E1 transitions

    Δl  = ±1        (required)
    Δm_l ∈ {−1, 0, +1}   (polarization selector)

Polarization (emission convention, Δm_l = m_l(upper) − m_l(lower)):

    Δm_l = +1 → σ+  (higher frequency photon)
    Δm_l =  0 → π   (same frequency, linearly polarized perpendicular to B)
    Δm_l = −1 → σ−  (lower frequency photon)

---

## New physics functions (`src/physics/hydrogen.ts`)

| Export | Description |
|---|---|
| `MU_B = 0.5` | Bohr magneton in atomic units |
| `zeemanShift(ml, B)` | ΔE = μ_B · B · m_l |
| `zeemanEnergy(n, Z, ml, B)` | E_n + ΔE(m_l, B) |
| `zeemanSublevels(n, l, Z, B)` | All 2l+1 sublevels sorted by m_l |
| `zeemanAllowed(deltaL, deltaMl)` | True iff |Δl|=1 and |Δm_l|≤1 |
| `polarization(deltaMl)` | `'sigma+'`, `'pi'`, or `'sigma-'` |
| `zeemanTriplet(nHi, nLo, Z, B)` | The three Lorentz components with pol, deltaMl, dE |

---

## UI additions (`HydrogenExplorer.tsx`)

New collapsible section below the Grotrian diagram, expanded by default when B > 0.

### Controls
- **B slider**: 0 to 0.3 a.u. (step 0.005, default 0)
- Note: "B in atomic units; 1 a.u. ≈ 2.35 × 10⁵ T (slider scaled for visibility)"

### Plot 1 — Sublevel fan diagram
- X-axis: B (0 → 0.3 a.u.)
- Y-axis: sublevel energy E(n, l, m_l, B) for selected (n, l)
- One trace per m_l, colored: m_l > 0 → warm red/orange, m_l = 0 → white, m_l < 0 → cool blue
- Shows degeneracy lifting as B increases from 0

### Plot 2 — Spectral triplet (Lorentz triplet)
- For selected transition (n, l) → (nLo, lLo), show the three emission lines as a bar chart
- X-axis: wavelength λ (nm) or energy ΔE (a.u.) with λ annotation
- Y-axis: relative intensity (always 1 for each component in the normal Zeeman effect)
- Bars colored: σ+ red, π white/grey, σ− blue
- At B = 0: three bars stack on top of each other (single line)
- As B increases: σ+ moves to shorter wavelength, σ− to longer

### Lower level selector
- Dropdown showing all valid (nLo, lLo) pairs reachable from current (n, l) via |Δl|=1
- Constrained to nLo < n, lLo ≥ 0, lLo < nLo
- Default: lowest nLo with lLo = l−1 (if available), else lLo = l+1

### Readout
- ΔE₀, λ₀ for unperturbed line
- ΔE and λ for σ+, π, σ− at current B
- "Splitting: Δλ = ±..." annotation

---

## Tests (`src/test/zeeman.test.ts`)

Write before implementation (TDD). Total: ~28 new tests.

See test file for full list. Key cases:
1. MU_B = 0.5
2. zeemanShift: zero at B=0, zero for m_l=0, linear in B and m_l, antisymmetric
3. zeemanEnergy: equals hydrogenEnergy at B=0, m_l=0 unchanged, correct formula
4. zeemanSublevels: 2l+1 count, all degenerate at B=0, correct spacing μ_B B
5. zeemanAllowed: Δl=0 forbidden, |Δm_l|=2 forbidden, Δl=±2 forbidden
6. polarization: deltaMl mapping
7. zeemanTriplet: 3 components, merge at B=0, pi = ΔE₀, σ± symmetric, correct Z scaling

---

## Files to create / modify

| Action | File |
|---|---|
| new | `specs/zeeman.md` |
| new | `src/test/zeeman.test.ts` |
| modify | `src/physics/hydrogen.ts` — add 7 exports |
| modify | `src/components/HydrogenExplorer.tsx` — add Zeeman section |
| modify | `src/components/HydrogenInfoPanel.tsx` — add `'zeeman'` topic |
| modify | `TODO.md`, `CHANGELOG.md`, `README.md` |
