# Particle on a Ring + Aharonov-Bohm Effect — spec

## What this is

A spinless particle of mass m = 1 constrained to a 1D ring of radius R, with a
thin solenoid threaded through the centre carrying magnetic flux Φ.  The flux is
confined inside the solenoid; the particle never touches it.  Yet the flux
changes the energy spectrum — the Aharonov-Bohm (AB) effect.

All solutions are **exact and analytical**.  No numerics beyond evaluation of
cosines and integers.

## Physics

### Dimensionless flux
    φ = Φ / Φ₀,    Φ₀ = h/e = 2π  (atomic units, e = ħ = 1)
φ is real-valued; the spectrum is **periodic in φ with period 1**.

### Schrödinger equation on the ring
    Ĥ = (1/2R²)(−i ∂/∂θ − φ)²
    ψ_n(θ) = (1/√2π) e^{inθ},   n ∈ ℤ

### Eigenenergies
    E_n(φ) = (n − φ)² / (2R²)

### Level crossings
Adjacent bands n and m cross whenever (n − φ)² = (m − φ)²:
    φ_cross = (n + m) / 2
For nearest neighbours n, n+1: crossing at φ = n + ½.

### Ground-state quantum number
    n*(φ) = round(φ)    [nearest integer — changes by ±1 at half-integer φ]

### Persistent current
The thermodynamic current in state n:
    I_n(φ) = −∂E_n/∂Φ = −(1/Φ₀) ∂E_n/∂φ = (n − φ) / R²
The ground-state persistent current I_gs(φ) = (n*(φ) − φ) / R²
has a sawtooth waveform, amplitude ±1/(2R²), period Φ₀.

### Probability density
|ψ_n(θ)|² = 1/(2π)   — uniform for all energy eigenstates.
Re(ψ_n(θ)) = cos(nθ)/√(2π),   Im(ψ_n(θ)) = sin(nθ)/√(2π).

### Time-dependent wavepacket on the ring
A Gaussian superposition of angular-momentum states (width σ_φ in k-space):
    c_n = C · exp(−(n − n₀)² / (2σ_φ²))
    ψ(θ, t) = Σ_n  c_n ψ_n(θ) e^{−i E_n(φ) t}
    |ψ(θ, t)|² = (1/2π)|Σ_n c_n e^{i(nθ − E_n t)}|²

Quantum revival time (φ = 0, R = 1):  T_rev = 4πR²  (analogous to ISW).

With non-zero flux, the revival time is unchanged but the wavepacket acquires an
extra phase shift of 2πφ per revolution, shifting the revival pattern.

## Parameters

| Parameter | Range | Default |
|-----------|-------|---------|
| φ (flux Φ/Φ₀) | −1 to 3 | 0 |
| R (ring radius) | 0.5 to 3.0 a₀ | 1.0 |
| n (displayed level) | −4 to 4 | 0 |

## Sections / Plots

### 1. Controls + readout
- φ slider (continuous, −1 to 3)
- R slider (0.5 to 3)
- n selector dropdown (−4 to 4)
- Live readout: E_n(φ), I_n(φ), n*(φ), ground-state energy, AB phase = 2πφ

### 2. Energy level diagram  (main attraction)
- Plot E_n(φ) for n = −4..4 as parabolic curves over φ ∈ [−1, 3]
- Vertical dashed line at current φ
- Filled circle on each band at current φ showing current energy
- Ground-state band highlighted
- Crossing points marked at φ = n + ½ (small circles on x-axis)
- Dark theme, 8 visible bands, each in distinct colour
- ? help modal

### 3. Wavefunction on the ring (collapsible)
- Polar Plotly plot: ring deformed by Re(ψ_n(θ))
  x(θ) = [1 + A · Re(ψ_n(θ))] cos θ
  y(θ) = [1 + A · Re(ψ_n(θ))] sin θ
  (A = 0.5 for visual scaling; unit circle shown as reference)
- Caption shows n = 0 is flat circle (no angular variation)
- For n ≠ 0: 2|n| lobes visible around the ring
- ? help modal (shared with energy diagram)

### 4. Persistent current (collapsible)
- Ground-state current I_gs(φ) = (n*(φ) − φ)/R² — sawtooth, over φ ∈ [−1, 3]
- Current for selected n: I_n(φ) = (n − φ)/R² — straight line with slope −1/R²
- Vertical line at current φ; dot at current I value
- Sawtooth discontinuities at half-integer φ labelled
- ? help modal

### 5. Wavepacket animation (collapsible)
- Gaussian wavepacket |ψ(θ,t)|² animated on the ring (polar plot)
- Coefficients: Gaussian centred at n₀ = round(φ), width σ_φ = 1.5
- Sliders: speed multiplier
- Play / Pause / Reset buttons
- t/T_rev readout (exact revival time = 4πR²)
- Shows effect of flux: at φ = 0, packet reforms at θ = 0; at φ = 0.5, packet
  returns shifted by π (AB phase cancels/adds to revival)
- ? help modal

## Files to create

- `specs/aharonov-bohm.md` (this file)
- `src/physics/ring.ts` — pure functions (no UI)
- `src/test/ring.test.ts` — unit tests (write first, before implementation)
- `src/components/RingExplorer.tsx`
- `src/components/RingInfoPanel.tsx`
- Wire into `App.tsx` as new top-level tab "Ring & A-B"

## Tests to write (failing first)

### ringEnergy(n, phi, R)
1. E_0(0, 1) = 0
2. E_1(0, 1) = 0.5
3. E_{-1}(0, 1) = 0.5  (symmetric)
4. E_1(1, 1) = 0        (n=1 is ground state at φ=1)
5. E_0(0.5, 1) = E_1(0.5, 1)  (level crossing at φ=0.5)
6. E_n(φ, R) scales as 1/R²: E_1(0, 2) = E_1(0, 1) / 4
7. Periodicity: E_n(φ + 1, R) = E_{n+1}(φ, R)
8. E_n ≥ 0 for all n, φ

### groundStateN(phi)
9.  groundStateN(0)    = 0
10. groundStateN(0.4)  = 0
11. groundStateN(0.6)  = 1
12. groundStateN(-0.4) = 0
13. groundStateN(-0.6) = −1
14. groundStateN(1.0)  = 1

### persistentCurrent(n, phi, R)
15. I_0(0, 1) = 0
16. I_1(0, 1) = 1.0    (n=1, φ=0: I = (1-0)/1² = 1)
17. I_0(0.5, 1) = I_1(0.5, 1) = −0.5  (same at crossing)
18. Current scales as 1/R²: I_1(0, 2) = I_1(0, 1) / 4

### ringWavefunctionRe / Im
19. Norm: (1/2π) ∫₀^{2π} |ψ_n(θ)|² dθ = 1  (numerical, tol 1e-6)
20. Re(ψ_0(θ)) = 1/√(2π) for all θ
21. Max of Re(ψ_1(θ)) = 1/√(2π) at θ = 0

## CHANGELOG / TODO update

- Add to Done: Quantum ring / Aharonov-Bohm — energy diagram, persistent current,
  wavefunction on ring, wavepacket animation
- Remove from TODO Phase 2: "Particle on a ring + Aharonov-Bohm"
