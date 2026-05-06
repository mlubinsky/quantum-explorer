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

### Spin-½ / Bloch Sphere
- Larmor precession under arbitrary magnetic field direction
- Exact Rodrigues rotation — no numerical ODE
- Real-time ⟨σ_x⟩, ⟨σ_y⟩, ⟨σ_z⟩ expectation values
- Sliders for initial state (θ, φ), frequency ω₀, B-field direction

Every module includes a **?** help button with physics formulas (KaTeX).

### Planned
- Free particle — Gaussian wavepacket spreading (exact)
- ISW / HO time evolution — superposition, quantum revivals, coherent states
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
| Vitest | Unit tests |

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
