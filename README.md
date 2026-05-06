# Quantum Explorer

An interactive quantum mechanics explorer that runs entirely in the browser —
no backend, no installation, no approximations.

Every feature uses an **exact analytical solution**. Results are not numerical
approximations: eigenvalues, expectation values, and time evolution are all
computed in closed form.

## Live demo

<!-- Add GitHub Pages URL here once deployed -->

## Features

### Available now
- **Spin-½ / Bloch Sphere** — Larmor precession under arbitrary magnetic field,
  exact Rodrigues rotation, real-time ⟨σ_x/y/z⟩ expectation values

### Planned
- Infinite square well — superposition, quantum revivals
- Harmonic oscillator — coherent states, squeezed states
- Hydrogen atom — energy levels, radial wavefunctions, orbital cross-sections
- Kronig-Penney band structure
- Two-spin entanglement and Bell states
- Single-qubit gates on Bloch sphere
- NMR / spin echo

See [TODO.md](TODO.md) for the full roadmap.

## Running locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

## Tech stack

- React 19 + TypeScript + Vite 8
- Three.js (Bloch sphere, 3D orbitals)
- Plotly.js (2D plots)
- KaTeX (physics notation in help panels)
- Vitest (tests)

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
