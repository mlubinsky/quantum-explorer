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

### Spin-½ / Bloch Sphere
- Larmor precession under arbitrary magnetic field direction
- Exact Rodrigues rotation — no numerical ODE
- Real-time ⟨σ_x⟩, ⟨σ_y⟩, ⟨σ_z⟩ expectation values
- Sliders for initial state (θ, φ), frequency ω₀, B-field direction

Every module includes a **?** help button with physics formulas (KaTeX).

### Planned
- HO squeezed state — breathing wavepacket, Δx·Δp = ħ/2 maintained
- Free particle — Gaussian wavepacket spreading (exact)
- Hydrogen atom — energy levels, radial wavefunctions, Grotrian diagram
- Kronig-Penney band structure
- Two-spin entanglement and Bell states
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
| Plotly.js | 2D wavefunction plots |
| KaTeX | Physics formulas in help panels |
| Vitest | Unit tests (67 passing) |

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
