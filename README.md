# Quantum Explorer

An interactive quantum mechanics explorer that runs entirely in the browser —
no backend, no installation. Modules are selected from a grouped dropdown
(`<optgroup>` categories) so the navigation scales to many modules without
layout changes.

Every feature uses an **exact analytical solution**. Eigenvalues, expectation
values, and time evolution are closed-form; a small number of expectation values
(HO squeezed state) use numerical quadrature over the exact wavefunction.

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
- Analytic norm = 1 — flat at 1.000 (exact, no drift)

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
- Analytic norm = 1 — exact flat 1.000 (no PDE solver, no drift)
- **Quantum Measurement** — click "Measure x̂" or "Measure p̂" to collapse the wavepacket
  - Born-rule sampling: x_meas ~ |ψ(x,t)|², k_meas ~ |φ(k)|²
  - Position collapse: new σ₀ = σ_det (narrow → fast re-spreading, large Δp)
  - Momentum collapse: new σ₀ = 1/(2σ_k_det) (wide → slow re-spreading, small Δp)
  - Adjustable detector width σ_det; dashed marker on plot; scrollable event log

### Scattering
Six sub-tabs covering zero-range, reflectionless, periodic, diatomic, and extended potentials.

**Pöschl-Teller potential** V(x) = −N(N+1)α²/2 · sech²(αx) — reflectionless well
- T = 1 for all E > 0 (R = 0 exactly) for integer N — the defining reflectionless property
- Classical comparison: T_cl = 0 for E < V₀, T_cl = 1 for E ≥ V₀; quantum wins for all E
- Exactly N bound states: E_j = −α²(N−j)²/2; V₀ = N(N+1)α²/2 derived, not free
- Wavefunctions via Rodrigues formula P_N^{N−j}(tanh(αx)); normalised by trapezoidal quadrature
- Energy level lines use classical turning points for accurate width display

**Delta function potential** V(x) = ±αδ(x) — exact zero-range scattering
- T = k²/(k²+α²) — same for attractive and repulsive; monotonically rises to 1
- Attractive delta: one bound state E_b = −α²/2; T(|E_b|) = 1/2 exactly
- Scattering wavefunction: standing wave on left, perfectly flat T on right
- Bound-state wavefunction |ψ_b|² = α e^{−2α|x|} with decay length 1/α
- Potential diagram shows spike direction, E level, and E_b level line

**Rectangular barrier** (T & R via exact transfer matrix)
- T(E) and R(E) vs E; T_WKB dashed overlay; resonance markers at E = V₀ + n²π²/2a²
- Scattering wavefunction |ψ(x)|² (exact, blue) with WKB |ψ|² overlay (orange dashed)
  — shows exponential decay vs oscillations inside barrier, WKB jump vs exact smooth matching
- Potential diagram with energy slider

**Step potential** (single interface, exact)
- Total reflection for E < V₀ (T = 0 exactly); T rises monotonically for E > V₀
- Wavefunction: standing-wave pattern left of step, evanescent decay right for E < V₀
- Penetration depth δ = 1/κ annotated; live readout T, R, T+R, δ

**Morse potential** V(x) = De(e^{−2αx} − 2e^{−αx}) — diatomic molecule bond
- Exact eigenvalues E_n = −α²(λ−n−½)²/2; N = ⌊λ−½⌋+1 bound states (λ = √(2De)/α)
- Exact wavefunctions via associated Laguerre polynomials L_n^k(z), Γ-function normalization
- Anharmonic level spacing ΔE_n = ω_e − α²(n+1): decreasing toward dissociation threshold
- Potential diagram with per-level bars, |ψ_n|² overlay, dissociation line at E = 0
- Wavefunction viewer: signed ψ_n, |ψ_n|², classical turning-point markers, node count

**Kronig-Penney model** V(x) = α·a · Σ δ(x−na) — periodic delta-function lattice
- Exact dispersion: cos(Ka) = f(ka), f(u) = cos(u) + P·sin(u)/u, P = αa
- Allowed bands |f| ≤ 1, forbidden gaps |f| > 1 — visualized with blue/red shading
- Reduced Brillouin zone band structure E(Ka/π) with bands colored distinctly
- Zone-boundary energies E_n = (nπ/a)²/2 exact for any P (sin(nπ) = 0)
- α slider (0–5), lattice constant a slider (1–8); limits: P=0 free particle, P→∞ tight-binding

### Spin-½ / Bloch Sphere
Four sub-tabs.

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

**Single-qubit gates** — interactive gate pad on the Bloch sphere
- One-click gates: X, Y, Z (Pauli), H, S, S† (Clifford), T, T†
- Parametric rotations Rx(θ), Ry(θ), Rz(θ) with angle slider (−2π to 2π)
- State presets: |↑⟩ |↓⟩ |+x⟩ |−x⟩ |+y⟩ |−y⟩
- Bloch sphere sweeps great-circle arc animation (SLERP) after each gate
- Gate history strip (max 12) with undo; live ket + Bloch vector readout

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
- **Normal Zeeman effect** — B-field slider; sublevel fan diagram (energy vs B for all 2l+1 m_l of selected level); Lorentz spectral triplet (σ+, π, σ−) bar chart for any E1 transition; λ and ΔE readout per component; labelled "simplified nonrelativistic model"
- **Anomalous Zeeman effect** — includes electron spin S=½; Landé g-factor g_J = 1 + [J(J+1)+S(S+1)−L(L+1)]/(2J(J+1)); fan diagram for both J=L±½ multiplets (solid/dashed, different slopes); spectral pattern showing up to 10 lines for 2p→1s (vs 3 for normal Zeeman); g_J readout per J term; note on spin doublet in s orbitals
- **Linear Stark effect (n = 2)** — electric field F along z-axis; exact first-order perturbation theory via parabolic coordinates; ΔE = −(3/2)n(n₁−n₂)F/Z; fan diagram of all 4 n=2 levels vs F (two shifted ±3F/Z, two degenerate m=±1); readout table with parabolic labels and spherical expansions; classical ionisation threshold F_ion = Z³/(16n⁴) marked; Z-scaling demonstrated
- **Emission spectra** — 4-series SVG spectral display: Lyman (UV), Balmer (rainbow gradient, H-α through H-δ), Paschen (NIR), Brackett (IR); lines at exact wavelength positions; hover tooltip (λ, ΔE, region); click line → readout card + "View wavefunctions" button; all lines scale as 1/Z²

### Bosons & Fermions — Two-Particle ISW
Two identical particles in an infinite square well: the role of quantum statistics.

| State | Wavefunction |
|---|---|
| Distinguishable | ψₘ(x₁)ψₙ(x₂) |
| Bosons (m≠n) | \[ψₘ(x₁)ψₙ(x₂) + ψₙ(x₁)ψₘ(x₂)\]/√2 |
| Fermions (m≠n) | \[ψₘ(x₁)ψₙ(x₂) − ψₙ(x₁)ψₘ(x₂)\]/√2 (Slater det.) |

- 80×80 joint-density heatmap \|Ψ(x₁,x₂)\|² with x₁=x₂ diagonal annotation
- **Pauli exclusion**: m=n blocked for fermions with a clear warning
- **Single-particle marginal** ρ(x) — all three statistics overlaid; bosons and
  fermions are identical (exchange term integrates to zero by orthogonality)
- **Diagonal density** \|Ψ(x,x)\|²: fermionic exchange hole (always 0),
  bosonic HBT bunching (2× distinguishable), distinguishable baseline
- Energy E = Eₘ + Eₙ readout; symmetry label

### Fourier Explorer
Live position ↔ momentum Fourier pair — move a slider, watch both plots update instantly.

| Mode | What is exact |
|---|---|
| Gaussian | Δx = σ, Δk = 1/(2σ), Δx·Δk = ½ (minimum uncertainty) |
| Chirped | σ_k = √(1/(4σ²)+β²σ²); FT broadens with chirp rate β; Δx·Δk ≥ ½ |
| ISW eigenstate | Exact |φₙ(k)|²; Bragg peaks at k = ±nπ/L; Δk = nπ/L |

- Sliders: x₀, k₀, σ, chirp rate β, quantum number n, well width L
- Position plot: |ψ|² with Re ψ / Im ψ overlay toggle; Δx bracket
- Momentum plot: |φ(k)|² with Δk bracket; Bragg-peak markers for ISW
- Uncertainty readout: Δx, Δk, Δx·Δk — green ✓ at minimum uncertainty

### Wigner Function
Phase-space quasi-probability distribution W(x,p) — the closest quantum analogue of a classical phase-space density.

| State | Formula |
|---|---|
| Fock \|n⟩ | W_n = (−1)^n/π · e^{−s} · L_n(2s),  s = p²/ω + ωx² |
| Coherent \|α⟩ | Gaussian, always non-negative |
| Squeezed D(α)S(r)\|0⟩ | Tilted Gaussian ellipse, still non-negative |
| Even/odd cat (\|α⟩±\|−α⟩)/N | Two blobs + cos-modulated interference fringe |
| Fock super (\|n⟩+\|m⟩)/√2 | Cross-term computed by 1D quadrature |

- 70×70 phase-space heatmap with diverging blue–white–red colour scale; negative regions flagged
- Marginal plots: ∫W dp = \|ψ(x)\|², ∫W dx = \|φ̃(p)\|², with exact \|ψ\|² overlay for Fock states
- Negativity readout 𝒩 = ∫\|W<0\|\|W\| dx dp (zero for classical states)
- Sliders for ω, Fock n, displacement \|α\|, squeeze r
- **Time animation** for coherent (blob orbits at ω) and squeezed (ellipse rotates/breathes at 2ω):
  Play/Pause/Stop, 5 speed presets, orbit ellipse trace, moving centroid, phase slider φ_α

### Ring & Aharonov-Bohm Effect
Exact solutions for a spinless particle on a 1D ring threaded by magnetic flux Φ.

- Dimensionless flux φ = Φ/Φ₀ slider (−1 to 3); ring radius R slider; quantum number n selector
- Live readout: E_n(φ), I_n(φ), n*(φ), ground-state energy, AB phase 2πφ, T_rev
- **Energy level diagram** — E_n(φ) = (n−φ)²/(2R²) parabolic bands for n = −4…4; click to set φ; crossing points marked at half-integer φ; ground-state band highlighted
- **Wavefunction on ring** — polar deformation plot Re(ψ_n(θ)); 2|n| lobes for n ≠ 0
- **Persistent current** — sawtooth I_gs(φ) (amplitude ±1/2R²) and selected-n straight line; discontinuities at level crossings
- **Wavepacket animation** — Gaussian superposition |ψ(θ,t)|² animated on ring; Play/Pause/Reset; speed slider; t/T_rev readout; T_rev = 4πR²

Every module includes a **?** help button with physics formulas (KaTeX).

Key parameters for every module are encoded in the URL hash (`#module?key=val&…`) so any
configuration can be bookmarked or shared — the URL updates automatically as you adjust sliders.

### Planned (Phase 2)
- ~~Single-qubit gates on Bloch sphere~~ ✓ done

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
| Vitest | Unit tests (747 passing) |

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
