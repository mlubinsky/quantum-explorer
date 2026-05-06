# quantum-explorer — TODO

Pure-JavaScript quantum mechanics explorer. All features use exact analytical solutions —
no Crank-Nicolson, no matrix diagonalisation, no Python backend. Deploys as a static site.

---

## Done ✓

### Infrastructure
- [x] Scaffold: Vite 8 + React 19 + TypeScript
- [x] Three.js for 3D (Bloch sphere)
- [x] Plotly.js for 2D plots
- [x] KaTeX for physics formulas in help modals
- [x] Vitest unit tests
- [x] GitHub Actions deploy to GitHub Pages
- [x] Dev server pinned to port 5174

### Spin-½ / Bloch Sphere module
- [x] Larmor precession — exact Rodrigues rotation (no numerical ODE)
- [x] Sliders: initial state (θ, φ), ω₀, B-field direction (θ_B, φ_B)
- [x] Real-time ⟨σ_x⟩, ⟨σ_y⟩, ⟨σ_z⟩ expectation values
- [x] Play / Pause / Reset animation
- [x] ? help modal with KaTeX formulas

### Stationary States module — ISW + HO
- [x] Eigenfunctions plot — all 8 levels simultaneously; selected state highlighted
- [x] Toggle ψ / |ψ|²
- [x] ISW: well width L slider; HO: frequency ω slider
- [x] Exact Eₙ, σ_x, x_classical readout
- [x] Node count in legend: ψₙ (k nodes)
- [x] Energy levels table — n, Eₙ, ΔEₙ, Eₙ/E₁; selected row highlighted
- [x] Momentum distribution |φₙ(k)|² — exact formula for ISW and HO self-duality
- [x] Energy levels diagram — V(x) fill + Eₙ lines labelled in a.u. and eV
- [x] Matrix representation — H, X, P heatmaps; animated Heisenberg picture;
      Bohr frequency table
- [x] ? help modal on every plot

---

## Done ✓ — Time evolution

### ISW superposition
- [x] Coefficient editor: set c₁…c₈, normalise automatically; presets
- [x] Animate |ψ(x,t)|² with Play / Pause / Reset / speed selector (0.25×–5×)
- [x] Quantum revival at T_rev = 4L²/π (exact); t/T_rev readout
- [x] ⟨x(t)⟩ cursor on plot (Ehrenfest)
- [x] Energy decomposition |cₙ|² bar chart
- [x] Expectation values plot: ⟨x⟩, ⟨p⟩ and Δx, Δp, Δx·Δp with ħ/2 bound
- [x] Norm history (exact = 1.000 for all t)
- [x] ? help modals on every plot

### HO coherent state
- [x] Slider for |α|, φ_α, ω
- [x] Animate |ψ(x,t)|² — exact Gaussian packet oscillating at ω
- [x] Show ⟨x(t)⟩, ⟨p(t)⟩, Δx = 1/√(2ω), Δx·Δp = ħ/2
- [x] Energy decomposition — Poisson distribution
- [x] ? help modal: coherent state definition, Poisson, uncertainty

## Done ✓ — Time evolution enhancements

- [x] Momentum-space |φ(k,t)|² — ISW (exact complex amplitudes), HO coherent + squeezed (Gaussian)
- [x] HO squeezed state — breathing Gaussian, Δx·Δp oscillating, breathing period T_sq = π/ω
- [x] ? help modals for all new plots

## Next — Further enhancements

### ISW
- [ ] Quantum revival annotation: highlight t = T_rev on time axis
- [ ] Re(ψ)/Im(ψ) overlay on same axes as |ψ|² (currently separate toggle)

---

## Phase 2 — 1D potentials

- [ ] **Free particle Gaussian wavepacket** — exact spreading, σ(t) = σ₀√(1+(t/t₀)²)
- [ ] **Rectangular barrier tunnelling** — exact T and R via transfer matrix
- [ ] **Step potential** — exact T and R, total internal reflection at E < V₀
- [ ] **Delta function potential** — one bound state, exact scattering amplitudes
- [ ] **Particle on a ring + Aharonov-Bohm** — exact with magnetic flux slider
- [ ] **Kronig-Penney model** — exact band structure and band gaps
- [ ] **Morse potential** — finite bound states, diatomic vibration (Laguerre polynomials)
- [ ] **Pöschl-Teller potential** — reflectionless at certain energies (T = 1 exactly)

---

## Phase 2 — Spin extensions

- [ ] **Two spin-½ particles** — Bell states, entanglement, singlet correlation −cos θ
- [ ] **Single-qubit gates on Bloch sphere** — X, Y, Z, H, S, T as rotations; compose gates
- [ ] **Heisenberg dimer** — H = J S₁·S₂, exact singlet/triplet eigenvalues
- [ ] **Spin-1** — 3×3 matrices, m = −1, 0, +1 levels

---

## Phase 2 — Hydrogen atom

- [ ] **Energy level diagram** — Eₙ = −1/(2n²), interactive Grotrian diagram
- [ ] **Radial probability** P(r) = r²|R_nl|² — exact, 1D plot
- [ ] **Emission spectra** — Lyman / Balmer / Paschen; click transition → wavefunctions
- [ ] **Zeeman effect** — level splitting with B-field slider, exact
- [ ] **Hydrogenic ions** — Z slider, scaling r → r/Z, E → Z²E

---

## Phase 3 — More effort

### 1D
- [ ] Quantum bouncer — Airy function eigenstates, gravitational quantisation
- [ ] Finite square well — piecewise exact eigenfunctions, eigenvalues via Newton's method

### Spin
- [ ] NMR / spin echo — free precession, π-pulse, Hahn echo, T₁/T₂ Bloch equations
- [ ] Berry phase — geometric phase γ = −Ω/2 traced on Bloch sphere

### 2D / 3D
- [ ] 2D infinite square well — degeneracy heatmap, accidental degeneracy when Lx = Ly
- [ ] 2D harmonic oscillator — degeneracy counting, exact
- [ ] Rigid rotor — Y_lm(θ,φ), E_l = l(l+1)ħ²/(2I)
- [ ] Hydrogen 2D cross-sections — |ψ_nlm|² heatmap in xz-plane
- [ ] Hydrogen 3D orbital isosurfaces — WebGL + marching cubes (Three.js)

---

## Excluded (no exact analytical solutions)

Out of scope by design — these require numerical PDE solvers:
- Double well, deep double well, Gaussian barrier
- Real-time wavepacket dynamics through smooth arbitrary potentials
- Any potential without a known closed-form eigenfunction
