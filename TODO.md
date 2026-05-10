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

### Spin-½ enhancements — next up
- [x] **State presets** — one-click buttons |↑⟩ |↓⟩ |+x⟩ |−x⟩ |+y⟩ |−y⟩
- [x] **Ket display** — live |ψ⟩ = α|↑⟩ + β|↓⟩ with formatted complex β
- [x] **Robertson uncertainty** — Δσ_x·Δσ_y ≥ |⟨σ_z⟩| with live ✓/✗ indicator
- [ ] **Component input mode** — toggle between angles (θ,φ) and direct (α,β) entry
- [ ] **B̂ presets** — +x/+y/+z/custom button group replacing raw θ_B/φ_B sliders
- [x] **Stern-Gerlach / Measurement tab** — second tab alongside Precession:
      - Measurement axis selector (x/y/z/custom)
      - Exact Born-rule probability bar P(+½) = (1 + n̂·r̂)/2
      - "Measure once" — Bernoulli sample, collapse Bloch vector, measurement history
      - History with context notes on non-commutativity and the spin-filter paradox
      - "Run N shots" — histogram vs exact probability (pure JS, no backend)
      - "Lock |ψ⟩ as prep state" — demonstrate randomness from identical preparation
- [ ] **Per-tab ? help** (low priority polish) — small ? inline in each tab label showing
      only precession or only measurement content; defer until Measurement tab grows large
      enough to justify it (e.g. after Bell demo or sequential measurement visualisation)
- [ ] **Sequential measurement visualisation** — step-by-step diagram showing state before
      and after each measurement; highlight how intermediate measurements erase prior
      spin-polarisation; useful companion to the history log already in the Measurement tab
- [x] **Bell inequality demo** — two-spin singlet state |ψ⁻⟩ = (|↑↓⟩ − |↓↑⟩)/√2;
      correlation curve E(θ) = −cos θ vs classical LHV bound; CHSH panel with 4 angle
      sliders, optimal preset (2√2), live S readout; N-shot simulation with convergence
      indicator; ? help modals on all three sections

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
- [x] Sub-mode ? help — modal on ISW / HO Coherent / HO Squeezed selector, comparing all three with formulas
- [x] Collapsible plots use state-controlled rendering (not `<details>`) so Plotly resizes correctly on expand

## Next — Further enhancements

### ISW
- [ ] Quantum revival annotation: highlight t = T_rev on time axis
- [ ] Re(ψ)/Im(ψ) overlay on same axes as |ψ|² (currently separate toggle)
- [ ] **More presets** — cat states (|ψ_m⟩ ± |ψ_n⟩)/√2, "traveling" Gaussian-like
      superposition, "breathing" state; one-click loading alongside existing presets

---

## Done ✓ — Free Particle

- [x] Gaussian wavepacket spreading — exact, σ(t) = σ₀√(1+(t/t₀)²)
- [x] Animated |ψ(x,t)|² with Re(ψ)/Im(ψ) toggle and ⟨x(t)⟩ cursor
- [x] Static momentum distribution |φ(k)|² — time-independent annotation
- [x] Expectation values: ⟨x⟩ linear, Δx growing, Δx·Δp with ħ/2 bound
- [x] Norm history — exact flat 1.000
- [x] ? help modals on all 4 plots

---

## Done ✓ — Scattering module (formerly Tunnelling)

- [x] **Rectangular barrier** — exact T and R via transfer matrix; T/R vs E plot,
      WKB comparison, scattering wavefunction |ψ(x)|², potential diagram;
      resonance markers, ? help modals on all sections
- [x] **Step potential** — exact T and R (one interface); total reflection for E < V₀;
      standing-wave pattern + evanescent decay wavefunction; penetration depth δ;
      sub-tab "Step" under renamed "Scattering" module

## Done ✓ — Ring & Aharonov-Bohm Effect

- [x] **Energy level diagram** — E_n(φ) = (n−φ)²/(2R²) parabolic bands for n = −4…4;
      click to set φ; crossing points at half-integer φ; ground-state band highlighted
- [x] **Wavefunction on ring** — polar deformation plot Re(ψ_n(θ)); 2|n| lobes for n ≠ 0
- [x] **Persistent current** — sawtooth I_gs(φ) and selected-n straight line;
      discontinuities at level crossings
- [x] **Wavepacket animation** — Gaussian superposition |ψ(θ,t)|² on ring;
      Play/Pause/Reset; speed slider; t/T_rev readout; T_rev = 4πR²
- [x] **Live readout**: E_n, I_n, n*(φ), E_gs, I_gs, AB phase 2πφ, T_rev
- [x] **32 unit tests** — ringEnergy, groundStateN, persistentCurrent, wavefunction, wavepacket

## Known physics issues (from physicist review — to fix)

- [x] **`iswExpectX2` is numerical** — replaced 400-point trapezoid grid with exact formula:
      diagonal `L²/3 − L²/(2n²π²)`, off-diagonal `2L²(−1)^{m+n}/π²·[1/(m−n)²−1/(m+n)²]`.
- [x] **HO Re(ψ)/Im(ψ) not implemented** — `hoCoherentProb` and `hoSqueezedProb` return `|ψ|²`
      only; the Re/Im toggle in the UI has nothing to display. Add exact complex ψ for the
      coherent state: `ψ_α(x,t) = (ω/π)^{1/4} exp(−ω(x−⟨x⟩)²/2 + i⟨p⟩x − i·phase)`.
      Implemented: `hoCoherentRePsi`, `hoCoherentImPsi`, `hoSqueezedRePsi`, `hoSqueezedImPsi`.
- [x] **Squeezed-state Fock decomposition** — wired `squeezedFockDist` into UI; nMax raised to
      32 (captures tail at r=2 where ⟨n⟩≈13, spread≈19); normalised weights sum exactly to 1;
      amber truncation warning shown when captured < 99%; axis label corrected to P(n) for HO
      modes; section header now reads "Fock distribution P(n)" vs "Energy decomposition |cₙ|²"
      for ISW.
- [x] **`groundStateN` silent branch at half-integer φ** — added `isDegenerateGS` and
      `degenerateGSPair`; energy diagram highlights both bands and shows a callout;
      readout shows `k, k+1 (degenerate)` in amber.
- [x] **`angularShape` shows φ-integrated density, not xz-section** — title now says
      "∫|Y_lm|²dφ — φ-integrated θ-profile"; amber warning shown for m<0; help modal
      explains cos vs sin φ-factor and which plane the lobes inhabit.

## Phase 2 — 1D potentials (remaining)
- [x] **Delta function potential** — one bound state, exact scattering; T = k²/(k²+α²);
      attractive/repulsive toggle; bound-state |ψ_b|²; 19 tests; 389 total
- [x] **Pöschl-Teller potential** — reflectionless (T = 1 for all E > 0, integer N);
      N bound states; Rodrigues-formula wavefunctions; 19 tests; 408 total
- [ ] **Kronig-Penney model** — exact band structure and band gaps
- [ ] **Morse potential** — finite bound states, diatomic vibration (Laguerre polynomials)
- [ ] **WKB approximation overlay** — show WKB tunnelling probability and wavefunction
      alongside exact results in the Scattering module; educational contrast, highlights
      where WKB fails (near turning points, near resonances)

---

## Phase 2 — Spin extensions

- [ ] **Two spin-½ particles** — Bell states, entanglement, singlet correlation −cos θ
- [ ] **Single-qubit gates on Bloch sphere** — X, Y, Z, H, S, T as rotations; compose gates
- [ ] **Heisenberg dimer** — H = J S₁·S₂, exact singlet/triplet eigenvalues
- [ ] **Spin-1** — 3×3 matrices, m = −1, 0, +1 levels

## Phase 2 — Heisenberg picture / matrix mechanics (extensions to existing matrix view)

The Stationary States module already has H, X, P heatmaps and a Bohr frequency table.
These items deepen that into a proper Heisenberg-picture module:

- [ ] **Animated operator evolution** — A_H(t) = e^{iHt}Ae^{−iHt} heatmaps for ISW/HO
      truncated basis; show off-diagonal elements oscillating at Bohr frequencies; toggle
      between Schrödinger picture (wavefunction moving) and Heisenberg picture (operators
      evolving, state fixed)
- [ ] **Ehrenfest theorem panel** — explicitly show d⟨x⟩/dt = ⟨p⟩/m and d⟨p⟩/dt = −⟨V'⟩
      computed from matrix elements; verify against expectation-value plots
- [ ] **Ladder operator visualizer** — show a†|n⟩ = √(n+1)|n+1⟩ and a|n⟩ = √n|n−1⟩
      acting on ISW/HO eigenstates; visualize raising/lowering in energy-level diagram
- [ ] **Commutator display** — compute [X, P] = iħ, [L_x, L_y] = iħL_z, Pauli commutators
      in the truncated matrix basis; show that uncertainty follows from non-commutativity

## Phase 2 — Entanglement / Two-particle

- [ ] **Extended entanglement module** — arbitrary 2-qubit pure states; Schmidt decomposition;
      concurrence C = |⟨ψ|σ_y⊗σ_y|ψ*⟩|; partial trace; reduced density matrix; entanglement
      entropy S = −Tr(ρ_A log ρ_A); heatmap of correlation matrix; separable vs entangled
      indicator. Extends the existing Bell inequality demo.
- [x] **Two-particle ISW symmetrization** — exact two-particle wavefunctions
      ψ_B/F(x₁,x₂) = [ψ_m(x₁)ψ_n(x₂) ± ψ_n(x₁)ψ_m(x₂)]/√2; density heatmap; bosonic
      bunching vs fermionic avoidance; Pauli exclusion (n=m forbidden for fermions);
      Slater determinant visualisation

## Phase 2 — New modules

- [ ] **Interactive Fourier Explorer** — dedicated module; draggable Gaussian wavepacket in
      position space with live exact Fourier transform in momentum space; phase display;
      chirped packet (linear phase gradient); uncertainty product Δx·Δk animated; exact
      for Gaussians and ISW eigenstates
- [ ] **Position-space wavefunction collapse** — on the Free Particle or Time Evolution tab,
      add a "detector" at x=x₀; click probability P(detector fires); collapse ψ→ projected
      state re-normalised; show post-measurement Gaussian and its subsequent spreading; exact
      for Gaussian projection kernels. Connects time evolution, uncertainty, and measurement.
- [x] **Wigner function** — exact closed-form W(x,p) for Fock states (Laguerre polynomial),
      coherent (Gaussian), squeezed, even/odd cat states, Fock superpositions; 70×70 heatmap;
      marginals; negativity readout
- [x] **Wigner function — time animation** — animate W(x,p,t) for HO coherent state (Gaussian
      blob rigidly rotating in phase space at ω) and squeezed state (ellipse rotating and
      breathing at 2ω); Play/Pause/Stop controls; phase φ_α slider; orbit ellipse trace;
      moving centroid marker; 5 speed presets; fixed axes; 370 tests

---

## Done ✓ — Hydrogen atom

- [x] **Energy level diagram (Grotrian)** — n=1..5, l=0..4, Δl=±1 transitions coloured by series;
      hover tooltip with ΔE and λ; selected state highlighted
- [x] **Radial probability** P(r) = r²|R_nl|² — exact, with ⟨r⟩ marker
- [x] **Radial wavefunction** R_nl(r) — exact associated Laguerre polynomial recurrence
- [x] **2D orbital cross-section** — |ψ_nlm(x,z)|² heatmap via real spherical harmonics
- [x] **Hydrogenic ions** — Z slider (1–10), exact scaling

## Phase 2 — Hydrogen atom (remaining)

- [ ] **Emission spectra** — Lyman / Balmer / Paschen; click transition → wavefunctions
- [ ] **Zeeman effect (normal)** — level splitting ΔE = μ_B B m_l with B-field slider;
      animated degeneracy lifting; spectral line triplet (σ+, π, σ−); selection rules
      Δm = 0, ±1 overlaid on Grotrian diagram. Label as "non-relativistic model".
- [ ] **Zeeman effect (anomalous)** — extend with spin; total J, Landé g-factor
      g_J = 1 + [J(J+1)+S(S+1)−L(L+1)]/(2J(J+1)); ΔE = g_J μ_B B m_J; requires
      Phase 2 Normal Zeeman to be done first
- [ ] **Stark effect (linear)** — first-order Stark splitting of hydrogen n=2 levels
      under electric field F; exact parabolic-coordinate wavefunctions; ΔE = ±3n a₀ F
      (in a.u.); show lifted degeneracy in Grotrian diagram with field slider

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

### Open quantum systems
- [ ] **Density matrix + decoherence** — single-qubit 2×2 ρ; exact Kraus-operator channels:
      dephasing (ρ₀₁ → ρ₀₁ e^{−Γt}), amplitude damping, depolarisation; animated Bloch
      vector shrinkage; purity Tr(ρ²), von Neumann entropy −Tr(ρ log ρ); purity gauge

### Adiabatic / geometric
- [ ] **Adiabatic theorem / Landau-Zener** — two-level system with slowly/rapidly varying
      parameter; exact LZ transition probability P = exp(−2πΓ) where Γ = |⟨1|dH/dt|2⟩|²/(ħ|ΔE|²);
      animated instantaneous eigenstates and population transfer; adiabatic vs sudden limits

### UX / infrastructure
- [ ] **URL state encoding** — encode active module + all slider values in the URL hash so
      any configuration can be shared or bookmarked; useful for classroom demos
- [ ] **Comparison mode** — side-by-side display of two states or two potentials on the same
      axes (e.g. coherent vs squeezed, ISW vs HO, classical vs quantum trajectory)

---

## Excluded (no exact analytical solutions)

Out of scope by design — these require numerical PDE solvers or stochastic methods:
- Double well, deep double well, Gaussian barrier
- Real-time wavepacket dynamics through smooth arbitrary potentials
- Any potential without a known closed-form eigenfunction
- **Double-slit interference** — requires split-step Fourier 2D TDSE (Python/FastAPI backend)
- **General 2D Schrödinger solver** — Crank–Nicolson / split-step FFT on a grid
- **Time-dependent potentials** — moving barrier, driven oscillator (no closed-form)
- **Path integral** (Monte Carlo sum over paths) — stochastic, not exact
- **Large many-body systems** — Hilbert space grows exponentially (20 qubits = 1M amplitudes)
- **Relativistic 3D Dirac solver** — requires numerical 4-spinor PDE
- **Anomalous Zeeman / Paschen-Back in strong-field regime** — requires numerical
  diagonalisation of the combined Zeeman + spin-orbit Hamiltonian

These belong in [github.com/mlubinsky/QM](https://github.com/mlubinsky/QM) (Python/FastAPI backend).
