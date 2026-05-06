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

## Next — Time evolution (high priority)

### ISW superposition
Time-evolving superposition Σ cₙ ψₙ e^{−iEₙt} — exact, no numerics.

- [ ] Coefficient editor: set c₁…c₈, normalise automatically
- [ ] Animate |ψ(x,t)|² with Play / Pause / Reset / speed selector
- [ ] Quantum revival at T_rev = 4ML²/π (ISW-specific, exact)
- [ ] Beating between nearby levels visible at short times
- [ ] ⟨x(t)⟩ cursor on plot (Ehrenfest: oscillates classically)
- [ ] ? help modal: revival formula, what beating looks like

### HO coherent state
Displaced ground state α|α⟩ — Gaussian that oscillates without spreading.

- [ ] Slider for displacement amplitude α (complex: |α|, arg α)
- [ ] Animate |ψ(x,t)|² — Gaussian packet oscillates at ω, shape invariant
- [ ] Show ⟨x(t)⟩ = |α|√(2/ω) cos(ωt + φ) and ⟨p(t)⟩ exactly
- [ ] Overlay classical trajectory
- [ ] ? help modal: coherent state definition, displacement operator

### HO squeezed state (natural extension of coherent state)
- [ ] Squeeze parameter r — Δx shrinks, Δp grows, Δx·Δp = ħ/2 maintained
- [ ] Breathing wavepacket animation

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
