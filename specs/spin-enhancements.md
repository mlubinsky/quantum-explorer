# Spec: Spin-½ Enhancements — Presets, Ket Display, Robertson Uncertainty

## Overview

Three tightly related improvements to `SpinExplorer.tsx` that make the Bloch sphere page
match the richer state-composer in the QM project. All are pure UI + arithmetic — no new
physics files, no new tests needed beyond trivial regression.

---

## 1. State presets

Six one-click buttons placed below the φ slider, replacing the current blank gap:

| Label | θ | φ |
|-------|---|---|
| \|↑⟩  | 0       | 0       |
| \|↓⟩  | π       | 0       |
| \|+x⟩ | π/2     | 0       |
| \|−x⟩ | π/2     | π       |
| \|+y⟩ | π/2     | π/2     |
| \|−y⟩ | π/2     | 3π/2    |

Clicking a preset sets both `theta` and `phi` and resets the animation (frame → 0,
playing → false), so the Bloch vector jumps immediately to the preset position.

---

## 2. Ket display

A single read-only line below the presets:

```
|ψ⟩ = 0.866 |↑⟩ + (0.500i) |↓⟩
```

Derived from (θ, φ) using the standard Bloch parameterisation:

```
α = cos(θ/2)                  (real, ≥ 0 — global phase fixed)
β = sin(θ/2) · e^{iφ}
  = sin(θ/2)·cos(φ)  +  i·sin(θ/2)·sin(φ)
```

Formatting rules for β (matching QM project):
- If |Im(β)| < 5×10⁻⁴  →  show only Re(β), e.g. `0.500`
- If |Re(β)| < 5×10⁻⁴  →  show only Im part, e.g. `0.500i` or `−0.500i`
- Otherwise             →  `0.354 + 0.354i` or `0.354 − 0.354i`

Always show four significant figures (`.toFixed(3)`).
The ket line is purely cosmetic — it does not accept input.

---

## 3. Robertson uncertainty

One compact row below the ket display, always visible:

```
Robertson:  Δσₓ·Δσᵧ = 0.433  ≥  |⟨σ_z⟩| = 0.500  ✓
```

### Physics

Robertson's uncertainty relation for two observables A, B:

```
ΔA · ΔB ≥ ½ |⟨[A, B]⟩|
```

For Pauli operators with [σ_x, σ_y] = 2iσ_z:

```
Δσ_x · Δσ_y ≥ |⟨σ_z⟩|
```

All quantities derived from the current Bloch vector (r_x, r_y, r_z):

```
⟨σ_x⟩ = r_x,   ⟨σ_y⟩ = r_y,   ⟨σ_z⟩ = r_z
⟨σ_x²⟩ = 1  (eigenvalues ±1, so σ_x² = I)
Δσ_x = √(1 − r_x²)
Δσ_y = √(1 − r_y²)
LHS = Δσ_x · Δσ_y
RHS = |r_z|
```

Indicator:
- `✓` in green  when LHS ≥ RHS − 1×10⁻⁹  (accounting for float rounding)
- `✗` in red    otherwise (should never happen for a normalised pure state)

The check should always be ✓ for a pure state on the Bloch sphere; showing it makes the
relation visceral — drag θ to 0 (north pole) and watch LHS → 0 while RHS → 1, both sides
pinched to 0 simultaneously.

---

## Changes to existing files

### `src/components/SpinExplorer.tsx`

All three features live entirely in this file. No new files needed.

Add after the φ slider and before the B-field section:

1. **Preset buttons** — a flex row of 6 small buttons using existing `btnStyle` variant
2. **Ket display** — a `<div>` with monospace styling, computed from `theta`/`phi`
3. **Robertson row** — a `<div>` with label + computed values + coloured ✓/✗

The values must track **`currentVec`** (the animated Bloch vector) so they update live
during precession, not just when the user moves sliders. `currentVec = [sx, sy, sz]` is
already computed at render time.

The presets must call `setTheta` / `setPhi` and also stop + reset the animation.

---

## Spec for ? help modal update

The existing `SpinInfoPanel.tsx` should get a new section **"Robertson uncertainty"**
after the Pauli matrices section:

```
Robertson's relation for σ_x and σ_y
Δσ_x · Δσ_y ≥ |⟨σ_z⟩|

Proof sketch: [σ_x, σ_y] = 2iσ_z, Robertson gives Δσ_x·Δσ_y ≥ |⟨σ_z⟩|.
For a pure state: Δσ_i = √(1 − ⟨σ_i⟩²).

Key cases to try:
- |↑⟩: ⟨σ_z⟩=1, Δσ_x=Δσ_y=1, product = 1 ≥ 1  (saturates)
- |+x⟩: ⟨σ_z⟩=0, product ≥ 0  (trivially satisfied — σ_x eigenstate)
- θ=π/2, φ=π/4: intermediate case, product > |⟨σ_z⟩|
```

---

## Implementation order

1. Add preset buttons to `SpinExplorer.tsx`
2. Add ket display
3. Add Robertson row
4. Add Robertson section to `SpinInfoPanel.tsx`
5. Update CHANGELOG + TODO
