# Quantum Explorer

An interactive quantum mechanics explorer that runs entirely in the browser —
no backend, no installation, no approximations.

Every feature uses an **exact analytical solution**. Results are not numerical
approximations: eigenvalues, expectation values, and time evolution are all
computed in closed form.

## Live demo

**[https://mlubinsky.github.io/quantum-explorer/](https://mlubinsky.github.io/quantum-explorer/)**

## Features

### Stationary States
Textbook-style energy level diagram showing all 8 levels simultaneously.

| Potential | What is exact |
|---|---|
| Infinite square well | E_n = n²π²/2L², eigenfunctions, σ_x, ⟨x²⟩ |
| Harmonic oscillator | E_n = ω(n+½), Hermite polynomials, σ_x, classical turning points |

- Toggle between ψ and \|ψ\|²
- Sliders for well width L (ISW) and frequency ω (HO)
- Exact E_n and σ_x readout for the selected state
- Energy levels table — n, Eₙ, ΔEₙ, Eₙ/E₁
- Momentum distribution \|φₙ(k)\|² — exact closed form (ISW sinc²; HO self-duality)
- Energy levels diagram — V(x) fill + Eₙ lines labelled in a.u. and eV
- Matrix representation (Heisenberg picture) — H, X, P heatmaps; animated time evolution; Bohr frequency table

### Time Evolution
Exact wavepacket dynamics — no Crank-Nicolson, no grid PDE solver.

**ISW superposition** ψ(x,t) = Σ cₙ ψₙ(x) e^{−iEₙt}
- 8-coefficient editor with sliders; presets (ground state, equal mix, Gaussian envelope)
- Animated \|ψ(x,t)\|² with Re(ψ) / Im(ψ) toggle
- ⟨x(t)⟩ cursor tracking (Ehrenfest theorem)
- Quantum revival at T_rev = 4L²/π — wavepacket reconstructs exactly
- Energy decomposition \|cₙ\|² bar chart
- Expectation values plot: ⟨x(t)⟩, ⟨p(t)⟩, Δx, Δp, Δx·Δp with ħ/2 bound
- Norm history — flat at 1.000 (exact, no drift)

**HO coherent state** \|α⟩ — displaced ground state
- Sliders for displacement \|α\|, phase φ_α, frequency ω
- Animated Gaussian packet oscillating at ω without spreading
- Exact ⟨x(t)⟩, ⟨p(t)⟩, Δx = 1/√(2ω), Δx·Δp = ħ/2 readout
- Poisson energy decomposition \|cₙ\|² = e^{−\|α\|²}\|α\|^{2n}/n!

**HO squeezed state** S(r)\|α⟩ — breathing wavepacket
- Squeeze parameter r slider (0–2); breathing period T_sq = π/ω
- Width oscillates: σ(t) = √[(cosh(2r)−sinh(2r)cos(2ωt))/ω]
- Δx·Δp oscillates between ħ/2 (min-uncertainty) and cosh(2r)/2

**Momentum-space \|φ(k,t)\|²** — animated for all three sub-modes
- ISW: exact complex FT amplitudes; Bragg peaks at k=±nπ/L shift and interfere
- HO coherent: moving Gaussian with constant width Δp = √(ω/2)
- HO squeezed: breathing Gaussian with σ_p(t) oscillating out of phase with σ(t)

### Free Particle
Exact Gaussian wavepacket spreading under V = 0 — a minimum-uncertainty state that never stops spreading.

- Sliders for x₀ (initial centre), k₀ (wave vector), σ₀ (initial width)
- Animated |ψ(x,t)|² — watch the Gaussian spread and translate; toggle Re(ψ) / Im(ψ) to see the carrier wave
- Orange dashed cursor tracks ⟨x(t)⟩ = x₀ + k₀t at group velocity v_g = k₀
- Momentum distribution |φ(k)|² — static Gaussian, width σ_p = 1/(2σ₀)
- Live readout: spreading time t₀ = 2σ₀², group velocity v_g, phase velocity v_ph = k₀/2, σ(t), Δx·Δp
- Expectation values: ⟨x⟩ grows linearly, ⟨p⟩ constant, Δx grows as σ₀√(1+(t/t₀)²), Δx·Δp ≥ ħ/2
- Norm history — exact flat 1.000 (no PDE solver, no drift)

### Scattering
Two sub-tabs covering both above- and below-barrier regimes.

**Rectangular barrier** (T & R via exact transfer matrix)
- T(E) and R(E) vs E; WKB comparison; resonance markers at E = V₀ + n²π²/2a²
- Scattering wavefunction |ψ(x)|² with incident, reflected, and transmitted regions
- Potential diagram with energy slider

**Step potential** (single interface, exact)
- Total reflection for E < V₀ (T = 0 exactly); T rises monotonically for E > V₀
- Wavefunction: standing-wave pattern left of step, evanescent decay right for E < V₀
- Penetration depth δ = 1/κ annotated; live readout T, R, T+R, δ

### Spin-½ / Bloch Sphere
Three sub-tabs.

**Precession** — Larmor precession under arbitrary B-field direction
- Exact Rodrigues rotation — no numerical ODE
- Sliders for initial state (θ, φ), frequency ω₀, B-field direction (θ_B, φ_B)
- State presets: |↑⟩ |↓⟩ |+x⟩ |−x⟩ |+y⟩ |−y⟩
- Real-time ⟨σ_x⟩, ⟨σ_y⟩, ⟨σ_z⟩; Robertson uncertainty Δσ_x·Δσ_y ≥ |⟨σ_z⟩|
- Live ket display |ψ⟩ = α|↑⟩ + β|↓⟩

**Stern-Gerlach / Measurement**
- Measurement axis selector (x / y / z / custom)
- Exact Born-rule probability P(+½) = (1 + n̂·r̂)/2
- "Measure once" — Bernoulli sample, state collapse, measurement history
- "Run N shots" — histogram vs exact probability
- "Lock |ψ⟩ as prep state" — demonstrate randomness from identical preparation

**Bell inequality demo** — two-spin singlet |ψ⁻⟩ = (|↑↓⟩ − |↓↑⟩)/√2
- Correlation curve E(θ) = −cos θ vs classical LHV bound |E| ≤ 1
- CHSH panel with 4 angle sliders; optimal preset (S = 2√2 ≈ 2.828)
- N-shot simulation with convergence indicator

### Hydrogen Atom
Exact hydrogenic solutions for n = 1–5, l = 0–4, m = −l…l, Z = 1–10.

- Quantum number dropdowns (n, l, m) with validity enforcement; Z slider
- Readout: state label (e.g. 3d), E_n in Hartree and eV, ⟨r⟩ in a₀, node counts
- **Radial probability** P(r) = r²\|R_nl(r)\|² — exact associated Laguerre polynomial recurrence; ⟨r⟩ marker
- **Radial wavefunction** R_nl(r) — collapsible; closed-form exact
- **2D orbital cross-section** — \|ψ_nlm(x,z)\|² heatmap (140×140); real spherical harmonics; Viridis colour scale with colorbar
- **Angular shape** \|Y_l^m(θ)\|² — polar plot side-by-side with the 2D heatmap
- **3D isosurface** — lazy-rendered Plotly isosurface at 10% of peak density; drag to rotate
- **Grotrian diagram** — n=1..5, Δl=±1 arrows coloured by series (Lyman/Balmer/Paschen/Brackett); clickable levels; series filter buttons; wavelength-accurate arrow colours; λ labels toggle; forbidden transitions toggle; metastable 2s marker; hover tooltips

### Ring & Aharonov-Bohm Effect
Exact solutions for a spinless particle on a 1D ring threaded by magnetic flux Φ.

- Dimensionless flux φ = Φ/Φ₀ slider (−1 to 3); ring radius R slider; quantum number n selector
- Live readout: E_n(φ), I_n(φ), n*(φ), ground-state energy, AB phase 2πφ, T_rev
- **Energy level diagram** — E_n(φ) = (n−φ)²/(2R²) parabolic bands for n = −4…4; click to set φ; crossing points marked at half-integer φ; ground-state band highlighted
- **Wavefunction on ring** — polar deformation plot Re(ψ_n(θ)); 2|n| lobes for n ≠ 0
- **Persistent current** — sawtooth I_gs(φ) (amplitude ±1/2R²) and selected-n straight line; discontinuities at level crossings
- **Wavepacket animation** — Gaussian superposition |ψ(θ,t)|² animated on ring; Play/Pause/Reset; speed slider; t/T_rev readout; T_rev = 4πR²

Every module includes a **?** help button with physics formulas (KaTeX).

### Planned (Phase 2)
- Delta function potential — one bound state, exact scattering
- Kronig-Penney model — exact band structure and band gaps
- Morse potential — finite bound states, diatomic vibration
- Hydrogen emission spectra / Zeeman effect
- Single-qubit gates on Bloch sphere

See [TODO.md](TODO.md) for the full roadmap and [CHANGELOG.md](CHANGELOG.md) for release history.

## Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5174`.

## Tech stack

| Library | Purpose |
|---|---|
| React 19 + TypeScript + Vite 8 | Framework |
| Three.js | Bloch sphere (3D WebGL) |
| Plotly.js | 2D/3D wavefunction plots |
| KaTeX | Physics formulas in help panels |
| Vitest | Unit tests (250 passing) |

No Python, no server, no dependencies beyond npm.

## Why no backend?

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full rationale. Short version:
the problems covered here have exact analytical solutions, so numerical solvers
add error without adding capability. A static site also means instant load,
offline use, and free hosting.

## Related project

[QM](https://github.com/mlubinsky/QM) — a general 1D Schrödinger solver with
a Python/FastAPI backend, covering potentials that have no analytical solution
(double well, Gaussian barrier, arbitrary initial states).

## License

MIT
