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
- [ ] **Squeezed-state Fock decomposition shows wrong distribution** — the UI renders a Poisson
      distribution based only on `|α|`, ignoring the squeeze parameter `r`. Replace with
      `squeezedFockDist` (already implemented and correct) or derive the exact formula.
- [x] **`groundStateN` silent branch at half-integer φ** — added `isDegenerateGS` and
      `degenerateGSPair`; energy diagram highlights both bands and shows a callout;
      readout shows `k, k+1 (degenerate)` in amber.
- [ ] **`angularShape` shows φ-integrated density, not xz-section** — for `m < 0` real
      orbitals the xz-plane density is identically zero (lobes live in yz-plane), but the
      plot looks the same as `m > 0`. Label the plot explicitly as "|Y_lm(θ)|² integrated
      over φ" and note that m < 0 orbitals are not visible in this cross-section.

## Phase 2 — 1D potentials (remaining)
- [ ] **Delta function potential** — one bound state, exact scattering amplitudes
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

## Done ✓ — Hydrogen atom

- [x] **Energy level diagram (Grotrian)** — n=1..5, l=0..4, Δl=±1 transitions coloured by series;
      hover tooltip with ΔE and λ; selected state highlighted
- [x] **Radial probability** P(r) = r²|R_nl|² — exact, with ⟨r⟩ marker
- [x] **Radial wavefunction** R_nl(r) — exact associated Laguerre polynomial recurrence
- [x] **2D orbital cross-section** — |ψ_nlm(x,z)|² heatmap via real spherical harmonics
- [x] **Hydrogenic ions** — Z slider (1–10), exact scaling

## Phase 2 — Hydrogen atom (remaining)

- [ ] **Emission spectra** — Lyman / Balmer / Paschen; click transition → wavefunctions
- [ ] **Zeeman effect** — level splitting with B-field slider, exact

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
