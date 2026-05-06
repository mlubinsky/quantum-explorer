# quantum-explorer — TODO

Pure-JavaScript quantum mechanics explorer. All features use exact analytical solutions —
no Crank-Nicolson, no matrix diagonalisation, no Python backend. Deploys as a static site.

## MVP (implement first)

- [ ] ISW superposition — Σ c_n ψ_n e^{−iE_n t}, beating and quantum revivals
- [ ] HO coherent state — Gaussian oscillating without spreading, exact closed form
- [ ] Spin-½ / Bloch sphere — Larmor precession, Rabi oscillations (2×2 matrices only)

These three cover 1D wavefunctions, harmonic physics, and spin — good cross-section of
the feature space with minimal engineering effort.

## Phase 2 — High value, low effort

### 1D potentials
- [ ] Free particle Gaussian wavepacket — exact spreading, closed form
- [ ] Harmonic oscillator eigenstates — Hermite polynomials via recurrence
- [ ] Delta function potential — exact bound state and scattering amplitudes
- [ ] Step potential — exact T and R coefficients
- [ ] Rectangular barrier tunnelling — exact T and R via transfer matrix
- [ ] Morse potential — finite bound states, diatomic vibration (associated Laguerre polynomials)
- [ ] Pöschl-Teller potential — reflectionless at certain energies, T = 1 exactly
- [ ] Particle on a ring + Aharonov-Bohm effect — exact with magnetic flux slider
- [ ] Kronig-Penney model — exact band structure, band gaps from first principles
- [ ] Squeezed states (HO extension) — breathing wavepacket, Δx·Δp = ħ/2 maintained

### Spin extensions
- [ ] Two spin-½ particles — Bell states, entanglement, singlet correlation −cos θ (exact)
- [ ] Single-qubit gates on Bloch sphere — X, Y, Z, H, S, T as rotations; compose gates
- [ ] Heisenberg dimer — H = J S₁·S₂, exact singlet/triplet eigenvalues
- [ ] Spin-1 system — 3×3 matrices, m = −1, 0, +1

### Hydrogen atom
- [ ] Energy level diagram — E_n = −1/(2n²), interactive Grotrian diagram
- [ ] Radial probability P(r) = r²|R_nl|² — 1D plot, exact
- [ ] Hydrogen emission spectra — Lyman/Balmer/Paschen, click transition → see wavefunctions
- [ ] Zeeman effect — level splitting with B-field slider, exact
- [ ] Hydrogenic ions — Z slider, scale r → r/Z, E → Z²E

## Phase 3 — Medium value / more effort

### 1D
- [ ] Quantum bouncer — Airy function eigenstates, gravity quantisation
- [ ] Finite square well — piecewise exact eigenfunctions, eigenvalues via Newton's method

### Spin
- [ ] NMR / spin echo — free precession, π-pulse, Hahn echo, T₁/T₂ Bloch equations
- [ ] Berry phase — geometric phase γ = −Ω/2 on Bloch sphere
- [ ] Stark effect (1st order) — degenerate perturbation theory for n = 2 hydrogen

### 2D / 3D
- [ ] 2D infinite square well — degeneracy heatmap, accidental degeneracy when Lx = Ly
- [ ] 2D harmonic oscillator — degeneracy counting, exact
- [ ] Rigid rotor — Y_lm(θ,φ), E_l = l(l+1)ħ²/(2I), molecular rotation
- [ ] Hydrogen 2D cross-sections — |ψ_nlm|² heatmap in xz-plane
- [ ] Hydrogen 3D orbital isosurfaces — WebGL + marching cubes (Three.js)

## Observables (add alongside features above)

- [ ] ⟨x⟩, ⟨p⟩, σ_x, σ_p, ⟨E⟩ — exact for all analytical states
- [ ] Uncertainty product Δx·Δp shown in real time during animations
- [ ] Ehrenfest's theorem visualisation — ⟨x⟩ follows classical trajectory

## Infrastructure

- [ ] Scaffold: `npm create vite` + React + TypeScript
- [ ] Add `mathjs` for complex arithmetic
- [ ] Add Three.js / react-three-fiber for 3D (Bloch sphere, orbitals)
- [ ] Set up GitHub Pages deployment (static, free)
- [ ] CLAUDE.md with project context

## Excluded (no exact analytical solutions)

The following are out of scope by design — they require numerical PDE solvers:
- Double well, deep double well, Gaussian barrier
- Real-time wavepacket dynamics through smooth arbitrary potentials
- Any potential without a known closed-form eigenfunction
