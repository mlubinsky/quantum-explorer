# Morse Potential — spec

## Scope

New sub-tab **"Morse"** (6th) in the Scattering module.
Exact analytical — no numerical eigensolver, no time-stepper.
Units: atomic units (ħ = m = 1).

---

## Physics

### Model

The Morse potential models a diatomic molecule bond:

    V(x) = D_e (e^{−2αx} − 2 e^{−αx})

- V_min = −D_e at x = 0 (equilibrium)
- V → 0 as x → +∞ (dissociation threshold)
- V → +∞ as x → −∞ (repulsive hard wall)

Parameters: D_e = well depth (a.u.), α = range parameter (a₀⁻¹).

### Key derived quantities

| Symbol | Formula | Meaning |
|---|---|---|
| λ | √(2D_e)/α | dimensionless well depth |
| ω_e | α√(2D_e) = α²λ | harmonic frequency at minimum |
| N_bound | ⌊λ − ½⌋ + 1 | number of bound states |

### Exact eigenvalues

    E_n = −α²(λ − n − ½)²/2      n = 0, 1, …, n_max = ⌊λ − ½⌋

All E_n < 0 (bound); E_n increases with n.

Anharmonic level spacing:

    ΔE_n = E_{n+1} − E_n = α²(λ − n − 1)

Spacing decreases linearly with n; closes to zero as n → n_max.
The constant HO spacing would be ω_e = α²λ; anharmonic correction is −α²(n+1).

Harmonic limit (α → 0, D_e → ∞ at fixed ω_e = α√(2D_e)):

    E_n → −D_e + ω_e(n + ½)    (equidistant Fock ladder)

### Exact wavefunctions

    ψ_n(x) = N_n · z^{λ−n−½} · e^{−z/2} · L_n^{(k)}(z)

where:
- z = 2λ e^{−αx}          (Morse coordinate)
- k = 2λ − 2n − 1         (parameter of the associated Laguerre polynomial, k > 0)
- L_n^{(k)}(z)            via the three-term recurrence (valid for non-integer k):
    L_0^k = 1
    L_1^k = 1 + k − z
    L_n^k = ((2n−1+k−z)·L_{n−1}^k − (n−1+k)·L_{n−2}^k) / n
- N_n = √(α·k·n!/Γ(2λ−n))   (normalization constant)

ψ_n has exactly n nodes. L_n^k(0) = (n+k)!/(n!k!) = C(n+k, n).

### Classical turning points

At energy E_n, solve V(x) = E_n:

    β = √(1 + E_n/D_e)
    x_left  = −ln(1 + β)/α     (< 0, repulsive side)
    x_right = −ln(1 − β)/α     (> 0, dissociation side)

As n → n_max, x_right → +∞ (dissociation).

---

## New physics functions (`src/physics/morse.ts`)

| Export | Description |
|---|---|
| `morseV(x, De, alpha)` | V(x) = De(e^{−2αx} − 2e^{−αx}) |
| `morseLambda(De, alpha)` | λ = √(2De)/α |
| `morseOmega(De, alpha)` | ω_e = α√(2De) |
| `morseNBound(De, alpha)` | ⌊λ − ½⌋ + 1 |
| `morseEnergy(n, De, alpha)` | E_n = −α²(λ−n−½)²/2 |
| `morseTurningPoints(n, De, alpha)` | [x_left, x_right] |
| `laguerreAssoc(n, k, z)` | L_n^k(z) via three-term recurrence |
| `morsePsi(x, n, De, alpha)` | Normalized ψ_n(x) |
| `morseProb(x, n, De, alpha)` | |ψ_n(x)|² |

---

## UI — `MorseExplorer.tsx`

### Controls
- **D_e slider**: 1 to 20, step 0.5, default 8 (well depth, a.u.)
- **α slider**: 0.2 to 2.0, step 0.05, default 0.7 (range parameter)
- **n selector**: 0 … n_max − 1 (quantum number for selected state)
- **Readout**: λ, ω_e, N_bound, E_n in a.u. and eV

### Section 1 — Potential + energy levels
- V(x) curve (cyan)
- Horizontal E_n lines from x_left(n) to x_right(n), colored by level index
- Dissociation line at E = 0 (gray dashed)
- |ψ_n(x)|² overlay for selected state (scaled, gold)
- x range: x_left(0) − 2/α to x_right(n_max) + 3/α

### Section 2 — Wavefunction viewer
- ψ_n(x) (signed, blue) and |ψ_n(x)|² (green)
- Vertical dashed lines at classical turning points
- Node-count annotation

### Section 3 — Energy level table
- Columns: n | E_n (a.u.) | E_n (eV) | ΔE_n (a.u.) | ΔE_n / ω_e
- Last column shows the anharmonic ratio (= 1 for HO, decreasing for Morse)
- Selected row highlighted

---

## Files to create / modify

| Action | File |
|---|---|
| new | `specs/morse.md` |
| new | `src/physics/morse.ts` |
| new | `src/test/morse.test.ts` |
| new | `src/components/MorseExplorer.tsx` |
| modify | `src/components/ScatteringExplorer.tsx` — add 'morse' tab |
| modify | `src/components/ScatteringInfoPanel.tsx` — add 3 Morse topics |
| modify | `TODO.md`, `CHANGELOG.md`, `README.md` |

---

## Tests (~27 tests)

morseV (4), morseLambda (2), morseOmega (2), morseNBound (4),
morseEnergy (5), morseTurningPoints (3), laguerreAssoc (4),
morsePsi (4), morseProb (2).
