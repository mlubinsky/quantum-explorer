# Changelog

All notable changes to quantum-explorer are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

## [0.2026.0506i] — 2026-05-06

### Added
- **Hydrogen Atom module** — new top-level tab "Hydrogen Atom":
  - **Quantum number controls**: dropdowns for n (1–5), l (0..n−1), m (−l..l),
    integer Z slider (1–10); all quantum numbers constrained to valid range
  - **Readout**: state label (e.g. 3d), E_n in Hartree and eV, ⟨r⟩ in a₀,
    radial node count, angular node count
  - **Radial probability density P(r)** — exact `r² |R_nl(r)|²` with
    ⟨r⟩ dashed marker; Plotly dark-theme plot
  - **Radial wavefunction R_nl(r)** — collapsible; exact closed-form
    using associated Laguerre polynomials via three-term recurrence
  - **2D orbital cross-section** — collapsible heatmap of |ψ_nlm(x,z)|² in the
    xz-plane; 140×140 grid; Viridis colour scale; real spherical harmonics via
    associated Legendre polynomials
  - **Grotrian energy level diagram** — SVG; n = 1..5, l = 0..4 (s/p/d/f/g);
    electric-dipole transition arrows (Δl = ±1) coloured by series:
    Lyman (violet, UV), Balmer (cyan, visible), Paschen (orange, IR), Brackett+ (red);
    hover tooltip shows transition label, ΔE, λ; selected state highlighted
  - **? help modals** on all four sections with KaTeX formulas:
    radial density, R_nl normalisation, 2D cross-section factorisation,
    Grotrian selection rules and Rydberg formula
- **`src/physics/hydrogen.ts`** — exact functions:
  `hydrogenEnergy`, `meanRadius`, `radialNodes`, `assocLaguerre`,
  `radialWavefunction`, `radialDensity`, `angularDensity`, `orbitalDensity2D`, `rMax`
- **`src/test/hydrogen.test.ts`** — 31 tests (218 total passing)
- **`src/components/HydrogenExplorer.tsx`** — full hydrogen atom UI
- **`src/components/HydrogenInfoPanel.tsx`** — KaTeX help for all sections

## [0.2026.0506h] — 2026-05-06

### Added
- **Step potential** — new sub-tab "Step" under the (renamed) Scattering module:
  - T(E) / R(E) plot: sharp transition at E = V₀ (total reflection for E < V₀,
    monotone rise to 1 for E > V₀); V₀ marker; "Total reflection" annotation
  - Scattering wavefunction |ψ(x)|²: standing-wave pattern left of step,
    evanescent exponential decay right for E < V₀, constant flat amplitude for E > V₀;
    penetration depth δ = 1/κ annotated
  - Step potential diagram V(x) with energy line, fill (grey up-step, green down-step)
  - Live readout: T, R, T+R, δ, regime label
  - **? help modals** on all three sections with KaTeX formulas:
    r = (k₁−k₂)/(k₁+k₂), T = 4k₁k₂/(k₁+k₂)², total reflection proof,
    standing-wave fringe visibility, evanescent penetration depth
- **`src/physics/step.ts`** — 4 exact functions:
  `stepT`, `stepR`, `stepPsiSq`, `stepPenetrationDepth`
- **`src/test/step.test.ts`** — 17 tests (187 total passing)
- **`src/components/StepExplorer.tsx`** — full step potential UI
- **`src/components/ScatteringInfoPanel.tsx`** — unified help panel for both
  Barrier and Step topics (6 topics total)

### Changed
- **"Tunnelling" tab renamed to "Scattering"** — more accurate name for a module
  that covers both tunnelling (E < V₀) and above-barrier transmission
- **`TunnellingExplorer.tsx` refactored**:
  - Barrier content extracted to `BarrierExplorer.tsx` (imports `ScatteringInfoPanel`)
  - New `ScatteringExplorer.tsx` wraps Barrier + Step with a sub-tab strip
  - `TunnellingInfoPanel.tsx` superseded by `ScatteringInfoPanel.tsx`
- **`specs/step-potential.md`** — full physics and implementation spec

## [0.2026.0506g] — 2026-05-06

### Added
- **Tunnelling module** — new "Tunnelling" top-level tab (rectangular barrier / well):
  - Three parameter sliders: V₀ (−5 to +10 a.u.), L (0.5–10 a.u.), E (0.05–15 a.u.)
  - **T(E) and R(E) plot**: exact transmission (blue) and reflection (red) curves;
    WKB approximation T_WKB = exp(−2κ̃L) (orange dashed, tunnelling region only);
    vertical marker at current E; V₀ line; resonance markers n=1,2,… labelled
  - **Live readout**: E, T, R, T+R (green when = 1.000000), T_WKB, regime label
  - **Scattering wavefunction |ψ(x)|²** (collapsible, default open): standing-wave
    pattern left of barrier, evanescent decay through barrier, flat transmitted
    amplitude T on right; barrier region shaded; edge dashed lines; annotations
  - **Barrier potential V(x)** (collapsible, default open): rectangular step with
    fill (grey for barrier, green for well), energy line E, zero line
  - **? help modals** on every section with KaTeX formulas:
    T formula for above/below barrier, resonance condition κL=nπ, WKB derivation,
    piecewise wavefunction, classical vs quantum comparison table
- **`src/physics/tunnelling.ts`** — 5 exact functions:
  `transmissionT`, `reflectionR`, `wkbT`, `resonanceEnergies`, `scatteringPsiSq`
- **`src/components/TunnellingExplorer.tsx`** — full tunnelling UI
- **`src/components/TunnellingInfoPanel.tsx`** — topics: tvsE, wavefunction, potential
- **`src/test/tunnelling.test.ts`** — 22 tests (170 total passing)
- **`specs/barrier-tunnelling.md`** — full physics and implementation spec

## [0.2026.0506f] — 2026-05-06

### Added
- **Bell inequality demo** — third sub-tab "Bell" under Spin-½ / Bloch Sphere:
  - **Correlation curve**: E(θ) = −cos θ (quantum, blue) vs classical LHV bound
    ±(1−2θ/π) (orange dashed); shaded violation zone; interactive θ slider;
    annotation "Quantum violates classical bound for 0° < θ < 90°"
  - **CHSH panel**: four angle sliders a, a′, b, b′ (0°–180°); "Optimal (2√2)" preset
    sets a=0°, a′=90°, b=45°, b′=135°; live readout table E(a,b)…E(a′,b′);
    S value with gradient progress bar showing classical bound 2 and Tsirelson bound 2√2;
    green highlight when S > 2
  - **N-shot simulation** (N=10–5000): estimates E from sampled singlet pairs using
    exact conditional probabilities; shows same/opposite pair counts, Ê vs exact E,
    convergence |Ê−E| vs 3σ = 3/√N
  - **? help modals** on every section (correlation, CHSH, simulation) with KaTeX
    formulas: singlet state, E(θ)=−cosθ derivation, LHV bound, CHSH formula,
    Tsirelson bound, sampling probabilities, convergence σ≈1/√N
- **`src/physics/bell.ts`** — 3 exact functions:
  `bellCorrelation(theta)`, `chshS(a, aPrime, b, bPrime)`,
  `simulatePairs(theta, n) → { samePairs, oppositePairs, eEstimate }`
- **`src/components/BellDemo.tsx`** — full Bell inequality UI
- **`src/components/BellInfoPanel.tsx`** — topics: correlation, chsh, simulation
- **`src/test/bell.test.ts`** — 16 tests covering all three physics functions
- Total: **148 tests passing**

## [0.2026.0506e] — 2026-05-06

### Added
- **Stern-Gerlach / Measurement tab** — second sub-tab on the Spin-½ page:
  - Axis selector: x / y / z / custom (θ_n, φ_n sliders)
  - Live Born-rule probability bars: P(+½) = (1 + n̂·r̂)/2, updates as state animates
  - **Measure once**: Bernoulli sample, Bloch vector snaps to collapsed eigenstate
  - Measurement history (last ~8 shown) with automatic context notes:
    non-commutativity explanation when axis changes; spin-filter paradox note after
    ≥3 measurements with matching first/last axis
  - **Run N shots** (N=1…5000): histogram vs exact probability, "irreducible randomness" note
  - **Lock |ψ⟩ as prep state** + run N shots from frozen preparation
  - Switching to Measurement tab clears precession trajectory and stops animation
- **`bornP(axis, bloch)`** added to `src/utils/spinMath.ts`
- **`src/test/sternGerlach.test.ts`** — 16 tests (Born rule, collapse, N-shot simulation)
- **Stern-Gerlach section** in `SpinInfoPanel` help modal: Born rule formula, collapse,
  non-commutativity, irreducible randomness / Bell's theorem note
- Total: **132 tests passing**

## [0.2026.0506d] — 2026-05-06

### Added
- **Spin-½ state presets** — six one-click buttons (|↑⟩ |↓⟩ |+x⟩ |−x⟩ |+y⟩ |−y⟩)
  below the φ slider; clicking a preset sets (θ, φ) and resets the animation
- **Ket display** — live `|ψ⟩ = α|↑⟩ + (β)|↓⟩` readout with formatted complex β
  (pure real / pure imaginary / general cases)
- **Robertson uncertainty** — `Δσ_x·Δσ_y ≥ |⟨σ_z⟩|` row with live values and
  green ✓ / red ✗ indicator; updates during animation from the current Bloch vector
- **Robertson section in SpinInfoPanel** — KaTeX formula, derivation sketch from
  `[σ_x,σ_y]=2iσ_z`, and three key cases to try

## [0.2026.0506c] — 2026-05-06

### Fixed
- **Expectation Values plot blank after collapse/expand** — replaced `<details>/<summary>`
  with state-controlled conditional rendering for all four collapsible plot sections
  (Energy decomposition, Expectation values, Momentum-space, Norm history). Plotly
  rendered with zero width inside `display:none` and never resized on re-open; remounting
  on show fixes this. Adds ▾/▸ triangles matching Free Particle style.
- **No disclosure triangle on Time Evolution collapsible plots** — `display:flex` on
  `<summary>` suppresses the browser `::marker` pseudo-element. Removed the flex
  properties; added `stopPropagation` on ? button spans to prevent accidental
  collapse when clicking help.

## [0.2026.0506b] — 2026-05-06

### Added
- **Sub-mode ? help button** — dedicated modal on the ISW / HO Coherent / HO Squeezed
  selector buttons in Time Evolution, comparing all three sub-modes with formulas for
  superposition, coherent state, and squeezed state.

## [0.2026.0506a] — 2026-05-06

### Added
- **Free Particle tab** — exact Gaussian wavepacket spreading under V = 0:
  - Sliders: x₀ (initial centre), k₀ (wave vector / group velocity), σ₀ (initial width)
  - Animated |ψ(x,t)|² with Re(ψ) / Im(ψ) toggle; orange dashed ⟨x(t)⟩ cursor
  - Live readout: t₀, v_g, v_ph, σ(t), Δx·Δp (green at minimum, yellow growing)
  - Momentum distribution |φ(k)|² — static Gaussian, labelled "Time-independent"
  - Expectation values plot: ⟨x(t)⟩ (linear), ⟨p⟩ (flat), Δx(t) (growing), Δx·Δp with ħ/2 bound
  - Norm history — exact flat 1.000 (analytical guarantee)
  - ? help modals on all 4 plots
- **`src/physics/freeParticle.ts`** — 8 exact closed-form functions:
  `fpSigma`, `fpSpreadingTime`, `fpProb`, `fpExpectX`, `fpExpectP`,
  `fpDeltaX`, `fpDeltaP`, `fpMomentumDist`
- **`src/test/freeParticle.test.ts`** — 21 new tests; total **116 passing**
- **`specs/free-particle.md`** — full physics and implementation spec

## [0.2026.0507b] — 2026-05-07

### Added
- **Momentum-space animation |φ(k,t)|²** — collapsible plot in Time Evolution tab:
  - ISW: exact complex amplitudes φₙ(k) via FT formula; |φ(k,t)|² = |Σ cₙ(t) φₙ(k)|²
  - HO coherent: exact moving Gaussian |φ_α(k,t)|² = (1/√(πω)) exp(−(k−⟨p⟩)²/ω)
  - HO squeezed: breathing Gaussian with σ_p(t) = √[ω(cosh(2r)+sinh(2r)cos(2ωt))]
  - ? help modal with ISW Bragg peaks, HO duality, Heisenberg duality explanation
- **HO squeezed coherent state** — new sub-mode "HO Squeezed" in Time Evolution:
  - Squeeze parameter r slider (0–2); Δx range e^{−r}–e^r × 1/√(2ω)
  - Animated breathing Gaussian: σ(t) = √[(cosh(2r)−sinh(2r)cos(2ωt))/ω]
  - Δx(t), Δp(t) oscillate at 2ω; Δx·Δp shown green (=ħ/2) or yellow (>ħ/2)
  - Breathing period T_sq = π/ω readout
  - Expectation values plot shows oscillating Δx·Δp touching ħ/2 bound twice per breath
  - ? help modal: squeezing definition, σ(t) formula, minimum-uncertainty timing
- **`src/physics/timeEvolution.ts`** additions:
  `hoSqueezedProb`, `hoSqueezedDeltaX`, `hoSqueezedDeltaP`,
  `hoSqueezedSigmaX`, `hoSqueezedSigmaP`
- **`src/physics/momentumSpace.ts`** additions:
  `iswMomentumAmplitude`, `iswMomentumProbTE`, `hoCoherentMomentumProb`,
  `hoSqueezedMomentumProb`
- **`specs/momentum-space-animation.md`** and **`specs/ho-squeezed-state.md`**

### Tests
- 28 new tests in `momentumSpaceTE.test.ts` and `hoSqueezedState.test.ts`
- Total at this release: **95 tests passing** across 8 test files

## [0.2026.0507] — 2026-05-07

### Added
- **Time Evolution module** — new "Time Evolution" tab, exact analytical (no numerics):
  - **ISW superposition**: ψ(x,t) = Σ cₙ ψₙ(x) e^{−iEₙt} with 8-coefficient editor,
    presets (ground state, 1+2 mix, Gaussian envelope), live Σ|cₙ|² normalisation readout
  - **HO coherent state**: exact Gaussian packet |ψ_α|² = √(ω/π) exp(−ω(x−⟨x⟩)²);
    sliders for |α|, φ_α, ω; Δx·Δp = ħ/2 shown exactly
  - **Main plot**: |ψ(x,t)|² animated; toggle Re(ψ)/Im(ψ); ⟨x(t)⟩ dashed marker;
    Play/Pause/Reset; speed (0.25×–5×); loop toggle; t display with T_rev fraction
  - **Energy decomposition |cₙ|²** bar chart (time-independent; Poisson for HO)
  - **Expectation values** two-row plot: ⟨x⟩, ⟨p⟩ (top) and Δx, Δp, Δx·Δp with
    ħ/2 = 0.5 a.u. bound (bottom)
  - **Norm history** (collapsible): flat line at 1.000 — confirms exact normalisation
  - **? help modals** on every plot: superposition, revival, Ehrenfest, Heisenberg,
    coherent state definition, Poisson distribution
- **`src/physics/timeEvolution.ts`** — exact ISW and HO coherent physics:
  `iswPsi`, `iswProb`, `iswExpectX`, `iswExpectP`, `iswExpectX2`, `iswExpectP2`,
  `iswRevivalPeriod`, `hoCoherentProb`, `hoCoherentExpectX`, `hoCoherentExpectP`,
  `hoCoherentDeltaX`, `hoCoherentDeltaP`
- **`specs/time-evolution.md`** — full feature spec written before implementation

### Tests
- 15 new tests in `src/test/timeEvolution.test.ts`
- Total: **67 tests passing** across 6 test files

## [0.2026.0506b] — 2026-05-06

### Added
- **Node count in legend** — selected wavefunction trace now labelled
  `ψₙ (k nodes)` using `countNodes()` sign-change counter (margin = 5 pts)
- **Energy levels table** — compact n / Eₙ / ΔEₙ / Eₙ·E₁ table below the
  eigenfunctions plot; selected row highlighted; uniform HO spacing vs
  quadratic ISW growth immediately visible
- **Matrix representation panel** (collapsible, Heisenberg picture):
  - H / X / P heatmaps in dark theme (blue–dark–red diverging scale)
  - Static structure view and animated Heisenberg time-evolution view
  - Play / Pause / Reset controls, speed selector (0.25×–5×), t in a.u.
  - Bohr frequency table ωₘₙ = Eₘ − Eₙ in nested collapsible
- **Momentum distribution |φₙ(k)|²** (collapsible):
  - ISW: exact closed-form sinc² formula; yellow dashed Bragg lines at k = ±nπ/L
  - HO: self-duality — |φₙ(k; ω)|² = |ψₙ(k; 1/ω)|²; at ω ≈ 1 annotated
    "self-dual"; for ω ≠ 1 the ω = 1 reference curve is overlaid
  - σ_p, σ_x, σ_x·σ_p readout with Heisenberg-bound indicator
  - ? help modal with Fourier transform formula, ISW result, HO self-duality,
    and Heisenberg uncertainty table
- **Energy levels diagram** (collapsible):
  - ISW: infinite-wall rectangles + horizontal Eₙ lines labelled in a.u. and eV
  - HO: filled parabola + levels between classical turning points; eV labels
  - ? help modal with ISW/HO energy formulas and a.u.→eV conversion
- **Eigenfunctions plot header** — "Eigenfunctions" title + inline ? button
  added to the wavefunction chart (consistent with all other plots)
- **KaTeX fix** — replaced `react-katex` (incompatible with React 19) with
  `KatexMath.tsx`, a direct wrapper around `katex.renderToString`

### Changed
- `StationaryInfoPanel`: clarified "Classical turning points" sentence to
  read "In the eigenfunctions plot, yellow dashed vertical lines mark x_c …"
- Removed redundant global ? button from "Stationary States" heading
  (the eigenfunctions plot now has its own inline ? covering the same content)
- Dev server pinned to port **5174** (`strictPort: true`) to avoid conflict
  with the QM project on 5173

### Tests
- 52 unit tests passing across 5 test files
- New: `countNodes`, `energyLevelsTable`, `matrixElements`, `energyLevelsDiagram`,
  `momentumSpace`

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
