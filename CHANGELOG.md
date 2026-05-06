# Changelog

All notable changes to quantum-explorer are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.2026.0506] — 2026-05-06

### Added
- **Stationary States module** — textbook-style energy level diagram for two potentials:
  - Infinite square well: exact E_n = n²π²/2L², eigenfunctions via sin, σ_x, ⟨x²⟩
  - Harmonic oscillator: exact E_n = ω(n+½), Hermite polynomial eigenfunctions
    (log-normalised to avoid overflow up to n ≈ 50), σ_x, classical turning points
  - All 8 levels shown simultaneously; selected state highlighted in blue
  - Toggle between ψ and |ψ|²
  - ISW: well width L slider; HO: frequency ω slider with parabola V(x) overlay
  - Yellow dashed classical turning point markers for HO
  - Exact E_n and σ_x readout panel
  - ? help modal with KaTeX formulas and what-to-explore guide

## [0.2026.0505] — 2026-05-05

### Added
- **Spin-½ / Bloch Sphere module** — Larmor precession under arbitrary magnetic field:
  - Exact Rodrigues rotation formula (no numerical ODE integration)
  - Sliders for initial state (θ, φ), Larmor frequency ω₀, B-field direction (θ_B, φ_B)
  - Real-time ⟨σ_x⟩, ⟨σ_y⟩, ⟨σ_z⟩ expectation values
  - Play / Pause / Reset animation controls
  - ? help modal with KaTeX reference (state space, Pauli matrices, precession formula)
- **Project scaffold** — Vite 8 + React 19 + TypeScript, Three.js, Plotly.js, KaTeX, Vitest
- **Reusable components** — HelpButton, HelpModal, ParameterSlider
- **Pure-JS utilities** — spinMath (Rodrigues rotation, Bloch vectors), matrixElements, units
- **GitHub Actions** — automatic deploy to GitHub Pages on push to main
- **Architecture documentation** — ARCHITECTURE.md, TODO.md, docs/
