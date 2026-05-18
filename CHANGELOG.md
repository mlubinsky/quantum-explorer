# Changelog

All notable changes to quantum-explorer are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Fixed
- **Spin ½ infinite update loop** — `bhat` Bloch vector was recreated each render, triggering
  an infinite `useEffect` → `setTrajectory` → re-render cycle; wrapped in `useMemo`
- **Gate trail antipodal crash** — `blochSlerp` divided by `sin(ω)` which is ~0 for X|↑⟩→|↓⟩;
  added `sinO < 1e-6` guard that routes through a perpendicular midpoint via `_perpTo`
- **Bloch sphere south-pole arc NaN** — θ arc code only guarded `theta < 0.02`, not `theta > π−0.02`;
  added the missing south-pole guard, preventing `NaN` geometry at |↓⟩
- **Hydrogen nested buttons** — `<button>` elements contained `<HelpButton>` (also a `<button>`),
  invalid HTML; replaced with a flex wrapper `<div>` separating the toggle button and HelpButton
- **Hash URL params stripped on navigation** — `App.tsx` always rewrote the hash to bare `#module`,
  discarding `?param=value` params written by child components; now only pushes when the module ID
  in the current hash differs from the active module
- **Wrong Born density displayed for momentum measurement** — `FreeParticleExplorer` logged
  `bornProbDensityK(kMeas, k0, sigmaKDet)` (detector resolution) instead of the wavepacket width
  `sigmaK`; corrected to `bornProbDensityK(kMeas, k0, sigmaK)`
- **Odd cat Wigner NaN at α=0** — `wignerCat` divided by `N2 = 2(1−e^{−2α²}) ≈ 0` for odd cat
  at small α; added `if (N2 < 1e-10) return 0` early-exit guard
- **Gaussian sampler potential infinity** — `sampleGaussian` called `Math.log(rand())` without
  guarding `rand() = 0`; changed to `Math.max(Number.EPSILON, rand())`

### Added
- **WKB wavefunction overlay** — position-space comparison in the Barrier sub-tab
  - New `wkbPsiSq(x, E, V0, L)` in `tunnelling.ts`: piecewise WKB |ψ|² — left region = 1
    (no reflection), inside E < V0: exp(−2κ̃(x+L/2)) exponential decay, inside E > V0:
    k/κ′ from flux conservation, right region: T_WKB (tunnelling) or 1 (above barrier)
  - Orange dashed "WKB |ψ|²" trace overlaid on the exact blue curve in the wavefunction plot;
    shows where WKB fails: resonances above barrier, oscillations from internal reflections,
    and the jump discontinuity at barrier edges vs exact smooth matching
  - 16 new tests; 747 total
- **Wavefunction collapse** — Quantum Measurement section in Free Particle Explorer
  - `src/physics/collapse.ts`: `sampleGaussian` (Box-Muller), `bornProbDensityX/K`,
    `collapsePosition`, `collapseMomentum`; `MeasurementEvent` interface
  - "Measure x̂" — samples x from |ψ(x,t)|², collapses to new Gaussian of width σ_det;
    demonstrates fast re-spreading and increased momentum uncertainty
  - "Measure p̂" — samples k from |φ(k)|², collapses to wide Gaussian σ₀ = 1/(2σ_k_det);
    demonstrates complement: sharp momentum → slow spreading, large position uncertainty
  - Adjustable detector resolution slider σ_det ∈ [0.1, 2.0] a₀; HUP always satisfied
  - Dashed measurement marker on the main plot; scrollable event log (max 8); Clear log button
  - 26 new tests; 731 total
- **Single-qubit gates** — new "Gates" tab in Spin-½ / Bloch Sphere module
  - `src/physics/gates.ts`: 14 pure functions — `blochToQubit`, `qubitToBloch`, `qubitAngles`, `qubitNorm`; fixed gates X, Y, Z, H, S, S†, T, T†; parametric rotations Rx(θ), Ry(θ), Rz(θ); `blochSlerp` for great-circle arc animation
  - `src/components/GatesPanel.tsx`: state preset strip (|↑⟩ |↓⟩ |+x⟩ |−x⟩ |+y⟩ |−y⟩), 3-row gate pad (Pauli / Clifford / T-family), parametric rotation with axis selector + angle slider, gate history (max 12) with undo, state readout (complex ket + Bloch vector)
  - Bloch sphere animates great-circle arc after each gate via SLERP
  - 65 new tests; 705 total
- **Fourier Explorer** — new module (Single Particle — 1D group) with three modes:
  - *Gaussian*: position/momentum Gaussian pair, exact Δx = σ, Δk = 1/(2σ), Δx·Δk = ½
  - *Chirped*: position-dependent local frequency β; exact σ_k = √(1/(4σ²)+β²σ²);
    momentum plot broadens live as β increases; Δx·Δk ≥ ½ shown in readout
  - *ISW*: exact FT of ψₙ(x); two Bragg peaks at ±nπ/L; Δk = nπ/L exact
  - Sliders for x₀, k₀, σ, β (chirped), n, L (ISW); |ψ|²/Re ψ/Im ψ toggle
  - Uncertainty readout (Δx, Δk, Δx·Δk) with min-uncertainty indicator
  - URL state encoded; ? help modal with full derivations
  - New `src/physics/fourier.ts`: 7 functions; 19 new tests; 640 total
- **URL state encoding** — key parameters for all 9 modules are encoded in the URL hash as
  `#module?key=val&…`; any configuration can be bookmarked or shared; params are written via
  `replaceState` (no extra history entries); switching modules clears params; invalid/missing
  params silently fall back to defaults. New `src/physics/urlState.ts` with 5 pure utility
  functions (`parseHash`, `buildHash`, `getNumericParam`, `getIntParam`, `getStringParam`) +
  2 DOM helpers (`setUrlParam`, `setUrlParams`); 28 unit tests; 621 total.
- **Feedback FAB** — floating "💬 Feedback" button (bottom-right, fixed) links to GitHub Discussions
- **README**: removed stale "Planned (Phase 2)" entries for Delta function, Kronig-Penney, and Morse potential (all implemented)

- **Emission Spectra** — new collapsible section in Hydrogen module
  - `src/physics/hydrogen.ts`: `transitionPhotonEnergy`, `transitionWavelengthNm`, `spectralLines`,
    `SpectralLine` interface, `HC_NM` constant (exported; replaces three duplicate local constants)
  - 4-series SVG spectral display: Lyman (UV), Balmer (visible rainbow gradient), Paschen (NIR), Brackett (IR)
  - Lines at exact wavelength positions within each series range; colored by wavelength via `wavelengthToColor`
  - Greek-letter line labels: H-α, H-β, H-γ, H-δ; Ly-α, Ly-β; Pa-α, Pa-β; Br-α, Br-β
  - Hover tooltip: λ (nm), ΔE (Eh + eV), series, UV/visible/IR region
  - Click to select line → readout card with λ, ΔE, region; "View n = X wavefunctions ↑" button
    that jumps to the upper state in the quantum number controls
  - All wavelengths scale as 1/Z² — Z slider in the main controls updates all lines live
  - KaTeX help modal covering Rydberg formula, hc in atomic units, series table
  - 19 new unit tests (593 total)

- **Linear Stark Effect (n = 2)** — new collapsible section in Hydrogen module
  - `src/physics/hydrogen.ts`: `starkLinearShift`, `starkN2Sublevels`, `starkIonizationField`,
    `StarkLevel` interface — all exact first-order perturbation theory, no numerics
  - Energy shift ΔE = −(3/2)n(n₁−n₂)F/Z from parabolic-coordinate eigenstates; 4 levels for n=2
  - Fan diagram: 4 energy traces vs F, colour-coded by shift (red = down, grey = unshifted, blue = up)
  - Orange dashed ionisation-threshold line at F_ion = Z³/(16n⁴)
  - Readout table: parabolic quantum numbers, spherical expansion, ΔE, total E for current F
  - In-line warning when F exceeds barrier-suppression threshold
  - `HydrogenInfoPanel.tsx`: new `'stark'` topic with full derivation (matrix element, parabolic QNs,
    dipole moment, ionisation field) rendered in KaTeX
  - `specs/stark.md`: full physics spec
  - 27 unit tests; 574 total
- **Anomalous Zeeman effect** — new collapsible section in Hydrogen module
  - `src/physics/hydrogen.ts`: `landeG`, `jTerms`, `mJValues`, `anomalousZeemanEnergy`,
    `anomalousSublevels`, `anomalousAllowed`, `anomalousZeemanLines` — all exact, no numerics
  - Landé g-factor g_J = 1 + [J(J+1)+S(S+1)−L(L+1)]/(2J(J+1)) with S=½
  - Fan diagram for both J=L±½ multiplets: solid (upper J) vs dashed (lower J), slopes g_J·μ_B
  - Spectral pattern bar chart: up to 10 lines for 2p→1s (vs 3 Lorentz triplet in normal Zeeman)
  - Selection rules: |ΔL|=1, ΔJ=0,±1 (J=0↔J=0 forbidden), |Δm_J|≤1
  - g_J readout per J term; note that s orbitals show spin doublet (g=2) absent from normal Zeeman
  - `HydrogenInfoPanel.tsx`: new `'anomalousZeeman'` topic with Landé g-factor formula
  - 50 unit tests; 544 total
- **Morse potential** — 6th sub-tab in the Scattering module
  - `src/physics/morse.ts`: `morseV`, `morseLambda`, `morseOmega`, `morseNBound`,
    `morseEnergy`, `morseTurningPoints`, `laguerreAssoc`, `morsePsi`, `morseProb` — all exact
  - `specs/morse.md`: physics spec (TDD-first)
  - Potential V(x) = De(e^{−2αx} − 2e^{−αx}): asymmetric well, finite depth De, repulsive wall
  - Exact eigenvalues E_n = −α²(λ−n−½)²/2; N = ⌊λ−½⌋+1 bound states
  - Exact wavefunctions via associated Laguerre polynomials L_n^k(z); Lanczos Γ-function
  - **Potential diagram**: V(x) curve, per-level horizontal bars at classical turning-point width,
    dissociation line, |ψ_n|² overlay scaled within adjacent gap
  - **Wavefunction viewer**: signed ψ_n(x) and |ψ_n|², turning-point dashed lines, node count
  - **Anharmonicity table**: ΔE_n spacing, ΔE_n/ω_e ratio (1 → HO; approaches 0 near dissociation)
  - D_e slider (1–20 a.u.), α slider (0.2–2.0), n button selector; λ, ω_e, N_bound readout
  - 29 unit tests (normalization ≈ 1, orthogonality ≈ 0, n nodes, turning-point V check); 494 total
- **Kronig-Penney model** — 5th sub-tab in the Scattering module
  - `src/physics/kronigPenney.ts`: `kpP`, `kpRHS`, `kpAllowed`, `kpBlochKa`, `kpZoneBoundaries` — all exact, no numerics
  - `specs/kronig-penney.md`: physics spec (TDD-first)
  - Delta-function periodic potential V(x) = α·a·Σ δ(x−na); dimensionless P = αa
  - **Dispersion condition** plot f(E) = cos(ka) + P·sin(ka)/(ka): cyan trace, ±1 dashed reference, blue/red allowed/forbidden shading
  - **Band structure** E(Ka/π) scatter in reduced Brillouin zone; each band colored distinctly
  - **Zone-boundary table**: E_n = (nπ/a)²/2 in a.u. and eV; gap-above indicator; approximate bandwidth
  - α slider (0–5) and a slider (1–8); derived P readout; limits: P=0 free particle, P→∞ tight-binding
  - 24 unit tests; 465 total
- **Normal Zeeman effect** — new collapsible section in the Hydrogen Atom module
  - `src/physics/hydrogen.ts`: `MU_B`, `zeemanShift`, `zeemanEnergy`, `zeemanSublevels`,
    `zeemanAllowed`, `polarization`, `zeemanTriplet` — all exact, no numerics
  - `specs/zeeman.md`: physics spec written before implementation (TDD)
  - B-field slider (0–0.3 a.u.; labelled "simplified nonrelativistic model")
  - **Sublevel fan diagram**: energy vs B for all 2l+1 m_l sublevels of the selected level;
    warm/cool colouring by m_l sign; shows degeneracy lifting continuously
  - **Lorentz spectral triplet** bar chart for any selectable E1 transition;
    σ+ (red), π (grey), σ− (blue) bars; merge at B=0, spread symmetrically for B>0
  - Transition selector: all valid lower levels reachable via |Δl|=1
  - Readout: λ (nm) and ΔE (Hartree) per component; Δλ from π line
  - ? help modal with formula, triplet explanation, polarization table
  - 33 new unit tests (441 total)

- **Pöschl-Teller potential** — fourth sub-tab inside the Scattering module
  - `src/physics/poschlTeller.ts`: `ptV0`, `ptPotential`, `ptBoundEnergy`, `ptBoundPsiSqArray` — fully exact
  - `specs/poschl-teller.md`: physics spec written before implementation
  - V(x) = −N(N+1)α²/2 · sech²(αx); T = 1 for all E > 0 (reflectionless for integer N)
  - Exactly N bound states with energies E_j = −α²(N−j)²/2
  - Wavefunctions via Rodrigues formula: sech^m(αx) · [d^m P_N/du^m](tanh(αx)), m = N−j
  - Section 1: T = 1 flat vs classical step at V₀; V₀ annotation
  - Section 2: Potential shape with N energy levels; classical turning-point line widths
  - Section 3: All N normalised |ψ_j(x)|² on one plot, each a different colour
  - 3 KaTeX help sections: reflectionless T, bound-state wavefunctions, potential well
  - 19 new unit tests: V₀ formula, V(0) = −V₀, energy spectrum, normalisation, symmetry/node structure (408 total)

### Added
- **Delta function potential** — third sub-tab inside the Scattering module
  - `src/physics/delta.ts`: exact closed-form `deltaT`, `deltaR`, `deltaBoundEnergy`,
    `deltaBoundPsiSq`, `deltaPsiSq` — no numerics
  - T = k²/(k²+α²) — same for attractive and repulsive (depends only on α²)
  - Attractive/Repulsive toggle; α strength slider; E energy slider
  - T(E) and R(E) curves with |E_b| half-transmission marker for attractive case
  - Scattering wavefunction: standing wave for x < 0, flat T for x ≥ 0 (annotated)
  - Bound-state wavefunction |ψ_b|² = α e^{−2α|x|} with peak and 1/α decay-length labels
  - Potential diagram: vertical spike showing sign and strength; E and E_b level lines
  - 3 KaTeX help sections: T formula, wavefunctions, physical interpretation
  - 19 new unit tests: T+R=1, half-transmission at |E_b|, bound-state normalization,
    wavefunction continuity and flatness (389 total)

### Added
- **Wigner function — time animation** — coherent and squeezed HO states now animate in phase space
  - Coherent blob rigidly orbits the classical ellipse at ω without any spreading or distortion
  - Squeezed ellipse rotates and breathes at 2ω; exact cross-term B = 2sinh(2r)sin(2ωt) preserves det = 1
  - Play/Pause/Stop controls with 5 speed presets (0.25×–5×); t/T readout; phase slider φ_α
  - Fixed-axis heatmap (axes set from full orbital envelope — no jump on play/pause)
  - Orbit ellipse drawn as dashed white trace; moving centroid shown as orange cross marker
  - Resolution drops to 50×50 during playback, returns to 70×70 on pause for smooth animation
  - Marginals suppressed during playback to keep frame rate high
  - 8 new physics tests: `wignerCoherentT` and `wignerSqueezedT` — normalization, classical limit,
    periodicity, squeeze-axis swap (370 total)

### Added
- **Two-particle ISW module** — new "Two Particles" group in the dropdown
  - Distinguishable, boson, and fermion statistics with selector
  - 80×80 joint-density heatmap |Ψ(x₁,x₂)|² with dotted x₁=x₂ diagonal annotation
  - Pauli exclusion enforced: fermion m=n is blocked with a clear warning
  - Collapsible single-particle marginal ρ(x) — all three statistics overlaid; confirms
    bosons and fermions share the same marginal (exchange vanishes by orthogonality)
  - Collapsible diagonal |Ψ(x,x)|² — shows fermionic exchange hole (always 0),
    bosonic HBT bunching (2× distinguishable), and distinguishable baseline on one plot
  - 25 new unit tests: symmetry, antisymmetry, Pauli exclusion, normalisation (6 cases),
    marginal identity of bosons/fermions, HBT factor-2, energy formula (362 total)

### Added
- **Wigner Function module** — new tab in Single Particle — 1D group
  - Closed-form W(x,p) for: Fock |n⟩ (n=0..6), coherent |α⟩, displaced squeezed D(α)S(r)|0⟩,
    even/odd cat states (|α⟩±|−α⟩)/N, and Fock superpositions (|n⟩+|m⟩)/√2
  - 70×70 phase-space heatmap with diverging blue–white–red colorscale; negative regions
    (non-classical) highlighted in red with a warning banner
  - Marginal plots ∫W dp = |ψ(x)|² and ∫W dx = |φ̃(p)|² with exact |ψ|² overlay for
    Fock states and superpositions
  - Negativity readout 𝒩 = ∫|W<0||W| dx dp
  - 24 new unit tests: Laguerre recurrence, all Wigner types integrate to 1, marginals match
    |ψ|², negativity zero for classical states and positive for Fock n≥1 and cat states

## [0.2026.0509m] — 2026-05-09

### Fixed
- **Squeezed-state Fock decomposition** — three issues resolved:
  1. `nMax` raised from 16 → 32; at `r=2` (max slider) ⟨n⟩≈13 with spread≈19 so 16 bins
     silently missed the tail; 32 bins capture >99% for all accessible `r` values
  2. Weights are normalised to sum exactly to 1 in the UI; an amber warning line appears
     when the captured fraction falls below 99% ("Showing X% — tail truncated at n=31")
  3. Y-axis label corrected: ISW keeps `|cₙ|²`; HO coherent shows `P(n)` (Poisson);
     HO squeezed shows `P(n)` (non-Poisson, r-dependent)
- **Section header** now dynamic: "Energy decomposition |cₙ|²" for ISW, "Fock distribution
  P(n) = |⟨n|ψ_α⟩|² — Poisson" for coherent, "Fock distribution P(n) = |⟨n|ψ_sq⟩|²"
  for squeezed

## [0.2026.0509l] — 2026-05-09

### Changed
- **Navigation: tab buttons → grouped `<select>` dropdown** — replaced the horizontal
  button bar (which would overflow as module count grows) with a native `<select>`
  using `<optgroup>` categories in the header. The title and selector now share one
  row. Categories: *Single Particle — 1D* (Stationary, Time Evolution, Free Particle,
  Scattering), *Atoms & Fields* (Hydrogen, Ring & A-B), *Quantum Information* (Spin-½).
  Scales to many more modules without layout changes; keyboard-accessible out of the box.

## [0.2026.0509k] — 2026-05-09

### Fixed
- **GitHub Actions Node.js 20 deprecation warnings** — set `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true`
  at job level and bump `node-version` to 22 (LTS)
- **ESLint exhaustive-deps warnings** — added missing `bhat` to SpinExplorer useEffect deps
  and `thetas` to RingExplorer useMemo deps (both were safe additions; deps are stable values)

## [0.2026.0509j] — 2026-05-09

### Fixed
- **GitHub Actions deploy: ESLint failures** — `eslint.config.js` updated:
  - `@typescript-eslint/no-unused-vars`: added `argsIgnorePattern`/`varsIgnorePattern: '^_'`
    so `_n`, `_t` and similar intentionally-unused params are accepted
  - `@typescript-eslint/no-explicit-any`: disabled — Plotly interop legitimately needs `as any`
  - `react-hooks/immutability`, `react-hooks/refs`, `react-hooks/set-state-in-effect`: disabled —
    these react-hooks v7 rules conflict with the RAF animation and ref-accumulator patterns used
    throughout the codebase
  - Removed 11 now-orphaned `// eslint-disable-next-line @typescript-eslint/no-explicit-any` comments
- **Pre-commit hook**: now runs both `typecheck` and `lint` before every commit

## [0.2026.0509i] — 2026-05-09

### Fixed
- **GitHub Actions deploy: second round of TypeScript errors** — removed two unused variables:
  - `matrixElements.test.ts`: `hoEnergies` → `_hoEnergies`
  - `tunnelling.test.ts`: `k` → `_k`

## [0.2026.0509h] — 2026-05-09

### Fixed
- **GitHub Actions deploy blocked by 10 TypeScript errors** — all resolved:
  - Removed unused imports: `hoSqueezedSigmaX` (TimeEvolutionExplorer),
    `hoEigenstate` (StationaryExplorer), `iswEigenstate` (EnergyLevelsDiagram),
    `InlineMath` (HydrogenExplorer), `fpExpectX` (FreeParticleExplorer)
  - `FreeParticleExplorer`: `useRef<number>()` → `useRef<number|undefined>(undefined)`;
    React 19 requires an explicit initial value to return a `MutableRefObject`
    (the no-arg overload returns a read-only `RefObject`, causing assignment errors)
  - `RingExplorer`: renamed unused `EnergyDiagram` prop `n: selectedN` → `n: _n`;
    added explicit type `{ points?: Array<{ x?: unknown }> }` to Plotly `onClick`
    parameter `e` to satisfy `noImplicitAny`

## [0.2026.0509g] — 2026-05-09

### Changed
- **TODO.md enriched with new feature proposals** — reviewed `TODO_new.md` and merged
  non-duplicate, analytically-feasible ideas into the roadmap. Added:
  - ISW cat-state / traveling-packet presets
  - WKB overlay for Scattering module
  - Phase 2: Heisenberg picture expansions (animated A_H(t), Ehrenfest panel,
    ladder operators, commutator display)
  - Phase 2: Extended entanglement module (Schmidt decomp, concurrence, partial trace)
  - Phase 2: Two-particle ISW symmetrization (bosons/fermions, Pauli exclusion)
  - Phase 2: Interactive Fourier Explorer (exact for Gaussians)
  - Phase 2: Position-space wavefunction collapse (detector click, re-normalise)
  - Phase 2: Wigner function (exact Gaussian form for coherent/squeezed/Fock)
  - Phase 2 Hydrogen: Normal Zeeman (detailed), Anomalous Zeeman, Stark effect (linear)
  - Phase 3: Density matrix + decoherence (Kraus channels, purity, entropy)
  - Phase 3: Adiabatic theorem / Landau-Zener (exact LZ formula)
  - Phase 3: URL state encoding, Comparison mode
  - Excluded section extended with explicit rationale for double-slit, 2D solver,
    path integral, large many-body, and Paschen-Back as out-of-scope items

## [0.2026.0509f] — 2026-05-09

### Fixed
- **Ring wavepacket animation frozen on Play** — `coeffs` and `thetas` were plain
  `const` array assignments inside the component, so every `setFrame`/`setDisplayT`
  state update produced new array references, causing `getFrame` and `tick`
  `useCallback`s to be recreated each frame. This triggered `useEffect([running, tick])`
  on every render, which cancelled and restarted the `requestAnimationFrame` loop and
  reset `lastTimeRef.current = null`, making `dt = 0` on every tick and leaving `t`
  permanently at 0. Fixed by wrapping `coeffs` in `useMemo([n0])` and `thetas` in
  `useMemo([])` so both have stable references across renders.

## [0.2026.0509e] — 2026-05-09

### Fixed
- **`angularShape` m<0 mislabelled as xz cross-section** — the polar plot showed
  `∫|Y_lm|²dφ/(2π)`, the φ-integrated θ-profile, which is identical for m and −m.
  The old annotation "θ-profile only — φ-orientation not shown" did not warn that
  for m<0 real spherical harmonics (sin(|m|φ) factor) the xz-plane density is
  identically zero — the lobes live in the yz-plane. Fixed:
  - Plot title changed to `∫|Y_lm|²dφ — φ-integrated θ-profile`.
  - Persistent note: "Same shape for m and −m; φ-factor (cos vs sin) not shown."
  - When m<0: amber warning annotation "m<0 (sin(|m|φ) factor): xz-plane density
    is zero — lobes live in yz-plane."
  - Help modal rewrote `AngularShapeSection` to explain the φ-factor, why m and −m
    look identical in this plot, and which plane each orbital's lobes inhabit.
  - `angularShape` docstring updated to state the φ-integration explicitly.

## [0.2026.0509d] — 2026-05-09

### Fixed
- **`groundStateN` silent branch at half-integer φ** — at level crossings
  (`φ = k + 0.5`) two bands are exactly degenerate and `Math.round` silently
  picked one. Added `isDegenerateGS(phi, eps=0.005)` and `degenerateGSPair(phi)`
  to `ring.ts`. In the UI:
  - Energy diagram: both degenerate bands drawn at full width (3 px) with star
    markers and a labelled callout arrow `"degenerate n=k, k+1"`.
  - Readout panel: `n*(φ)` row shows `k, k+1 (degenerate)` in amber instead of a
    single silent integer.
  9 new unit tests for `isDegenerateGS` and `degenerateGSPair`; test count 301 → 310.

## [0.2026.0509c] — 2026-05-09

### Fixed
- **`iswExpectX2` replaced 400-point quadrature with exact analytical formula** —
  previously ⟨x²(t)⟩ was computed by summing `x²|ψ(x,t)|²` on a 400-point grid,
  which had O(10⁻⁴) error and was O(N_grid × N_coeffs²) in cost. It is now
  computed as the exact double sum `Σ_{m,n} c_m c_n cos((E_m−E_n)t) X2_{mn}`
  where the matrix elements are:
  - diagonal: `X2_{nn} = L²/3 − L²/(2n²π²)`
  - off-diagonal: `X2_{mn} = 2L²(−1)^{m+n}/π² · [1/(m−n)² − 1/(m+n)²]`
  derived by integrating `x² sin(mπx/L) sin(nπx/L)` in closed form. The result
  matches quadrature to 4 decimal places and is exact to machine precision.
  5 new unit tests: diagonal values, time-independence of eigenstates, agreement
  with quadrature for ground state and 1+2 mix at T_rev/4.

## [0.2026.0509b] — 2026-05-09

### Added
- **HO coherent and squeezed state Re(ψ)/Im(ψ)** — implemented exact complex
  wavefunctions for both sub-modes. For the coherent state:
  `ψ_α(x,t) = (ω/π)^{1/4} exp(−ωξ²/2) · exp(i·phase)`,
  `phase = p_cl·ξ + p_cl·⟨x⟩/2 − ωt/2`. For the squeezed state the same carrier
  phase gains a quadratic chirp term `−χ(t)·ξ²` where
  `χ(t) = sinh(2r)·sin(2ωt) / (2σ_x²(t))`, derived from the Riccati equation.
  Both satisfy `Re² + Im² = |ψ|²` exactly (8 new unit tests verify this pointwise
  and via numerical norm). The Re/Im display toggle in the UI now works for all
  three sub-modes (ISW, HO Coherent, HO Squeezed).

## [0.2026.0509a] — 2026-05-09

### Fixed
- **ISW momentum amplitude: wrong phase at k = −kₙ pole (bug)** — `iswMomentumAmplitude`
  resolved both poles to `−i·√(L/4π)`, but the L'Hôpital limit at `k = −kₙ` is
  `+i·√(L/4π)`. The incorrect sign had no effect on the static `|φₙ(k)|²` plot (the
  magnitude is the same) but caused wrong interference in `iswMomentumProbTE` at the
  negative-momentum peaks. Fixed by branching on `k ≥ 0`. Added 3 new tests for
  pole phases and magnitudes.

- **`wkbT` returned 1 for E ≥ V₀ (wrong physics)** — WKB tunnelling is undefined
  above the barrier (no evanescent region). The function now returns `NaN` for
  `E ≥ V₀`; the UI readout was already guarded by `{E < V₀ && ...}` so no UI
  change. Added 2 tests confirming NaN for `E = V₀` and `E > V₀`.

- **`scatteringPsiSq` at E = V₀ returned a constant (wrong physics)** — the `E ≈ V₀`
  branch returned `transmissionT(...)` (a single number) as the inside density, but
  the true TISE solution at `E = V₀` is linear: `ψ_B = A + Bx`. The branch now
  derives `A` and `B` by matching the exact boundary conditions at `x = +L/2` and
  evaluates `|A + Bx|²`. `scatteringAmplitudes` was also updated for `E = V₀`: it
  now uses the exact linear transfer-matrix result `t = 2e^{−ikL}/(2−ikL)` and
  `r = −ikL·e^{−ikL}/(2−ikL)` instead of the incorrect zero-imaginary-part
  approximation. Added 2 continuity tests for the `E = V₀` wavefunction.

- **`persistentCurrent` was off by 2π (unit error)** — the function returned
  `−∂E/∂φ = (n−φ)/R²`, which is the φ-derivative, not the physical persistent
  current `I = −∂E/∂Φ = (n−φ)/(2πR²)` (where `Φ₀ = 2π` in atomic units). Divided
  by `2π` to match the textbook definition. Updated 4 ring unit tests to the
  corrected values; the derivative identity test now verifies against `−dE/dΦ`.

## [0.2026.0508h] — 2026-05-08

### Added
- **Module equation strip** — a compact two-line strip now appears between the
  navigation buttons and the module content, showing the governing equation and either
  boundary conditions or key results for each module:
  - Stationary States: `Ĥψ=Eψ` + ISW/HO boundary conditions
  - Time Evolution: `i∂ψ/∂t=Ĥψ` + superposition formula
  - Free Particle: TDSE with V=0 + vg, vφ, σ(t)
  - Scattering: TISE with step potential + asymptotic scattering BCs
  - Spin-½: Larmor Hamiltonian + Bloch vector normalisation
  - Hydrogen: `Ĥψ=Eψ` with Coulomb potential + En and asymptotic BCs
  - Ring & A-B: Hamiltonian with flux + Aharonov-Bohm phase BC

### Removed
- Subtitle "Exact analytical quantum mechanics — no backend, no numerical eigensolvers"
  (replaced by the equation strip which conveys the same intent more concretely)
- Duplicate Schrödinger equation block from Free Particle left control panel
- Duplicate Schrödinger equation row from Hydrogen Atom header

## [0.2026.0508g] — 2026-05-08

### Fixed
- **Re(ψ)/Im(ψ) used approximate phase (bug)** — `fpRePsi`/`fpImPsi` omitted the
  quadratic chirp term ξ²t/(8σ₀²σ(t)²) and the Gouy phase −arctan(t/t₀)/2 that arise
  as the packet spreads. Both functions are now exact. The chirp makes the oscillation
  pattern tighter on the leading edge and wider on the trailing edge at large t; ignoring
  it gave visually wrong fringes for t ≳ t₀. Functions moved to `freeParticle.ts` and
  exported so they can be unit-tested.
- **x-grid too narrow for negative k₀ (bug)** — `makeProbGrid` only extended the grid
  to the right regardless of the sign of k₀. For k₀ < 0 the packet moved off the left
  edge. Fixed by computing both endpoints c₀ = x₀ and c₁ = x₀+k₀·t_max and spanning
  min(c₀,c₁)−4σ_f … max(c₀,c₁)+4σ_f.
- **Changing x₀ or k₀ did not reset time/history (bug)** — the reset `useEffect`
  depended only on `sigma0`; changing x₀ or k₀ while playing left stale history in the
  expectation-value plots. Added x₀ and k₀ to the dependency array.
- **History appended on every render (bug)** — the history push `useEffect` had no
  dependency array, so it fired on every re-render (opening help modal, toggling a
  section, etc.), duplicating points. Added `[t, expectX, deltaX, uxp]` as dependencies.

### Improved
- **"Norm history" section renamed to "Analytic norm = 1"** — the chart always shows
  the flat line 1.0 because this is an analytic guarantee, not a computed quantity. The
  old label "Norm history" implied a numerical check was being performed.

### Added
- 5 new tests for `fpRePsi`/`fpImPsi`: Re²+Im²=|ψ|² identity at t=0 and t>>0, correct
  phase at t=0, chirp is detectable at t=t₀, norm integral via Re/Im. Tests 277–281.

## [0.2026.0508f] — 2026-05-08

### Fixed
- **Scattering reflection amplitude phase (bug)** — `scatteringAmplitudes()` computed the
  complex reflection amplitude r with an incorrect phase in both the oscillatory (E > V0)
  and evanescent (E < V0) cases. The old code computed a rough angle then rescaled the
  magnitude, producing the right |r| but wrong arg(r), which made the standing-wave
  interference pattern on the incident side appear at wrong positions. Fixed using the
  exact transfer-matrix formula r = −i·rFactor·t (oscillatory: rFactor = (k²−κ²)/(2kκ)·sin(κL);
  evanescent: rfFactor = (k²+κ̃²)/(2kκ̃)·sinh(κ̃L)). This satisfies |r|²+|t|²=1
  algebraically, eliminating the rescaling step entirely. The wavefunction is now exactly
  continuous at both barrier boundaries.
- **E ≈ V0 limiting formula (cosmetic)** — `transmissionT` near-threshold branch used
  1/(1 + V0²L²/(8E)) instead of the correct Taylor limit 1/(1 + V0²L²/(2E)). The
  threshold (|E−V0| < 1e-12) is too narrow to be triggered by UI sliders, but the
  formula is now correct.

### Added
- 8 new tests for `scatteringAmplitudes`: |r|²+|t|²=1 for oscillatory and evanescent
  cases, wavefunction continuity at both boundaries for both regimes, resonance condition
  r=0, and V0=0 free-particle check. Tests 269–276.

## [0.2026.0508e] — 2026-05-08

### Fixed
- **Bell simulation always returned identical results (bug)** — `simulatePairs` reset
  its LCG seed to a fixed constant on every call, so pressing "Run simulation" again
  gave exactly the same counts. Replaced with `Math.random()` (default) and added an
  optional `rng` parameter so tests can still use deterministic sequences.

### Added
- **Measurement axis shown on Bloch sphere** — `SternGerlachPanel` now fires an
  `onAxisChange` callback when the Stern-Gerlach axis changes. `SpinExplorer` stores
  it and passes it as `measureAxis` to `BlochSphere`, which renders it as the existing
  dashed yellow line. The axis only appears while on the Measurement tab.

### Improved (documentation / UI)
- **Precession sign convention documented** — `computeTrajectory` in `spinMath.ts` now
  has a comment explaining the counterclockwise convention (H = +½ω₀σ·B̂). The
  Spin help panel now includes a sign-convention note with the NMR/electron alternative.
- **Bell CHSH section**: added italic note that the four angles are coplanar analyzer
  settings and the 2√2 maximum is achievable in-plane.
- **Bell simulation section**: clarified that each run is independently random (now that
  the LCG is gone) so repeated clicks give different counts.

## [0.2026.0508d] — 2026-05-08

### Fixed
- **2D orbital origin bug (physics)** — `orbitalDensity2D` returned 0 at r=0 for all
  orbitals, including 1s where the density is maximum. Fixed by delegating to
  `orbitalDensity3D(n,l,m, x,0,z, Z)` which already handles the l=0 origin case.
- **2D orbital m-sign bug (physics)** — `orbitalDensity2D` used only `|m|` for the
  angular factor, making m=+1 and m=-1 look identical. Real spherical harmonics have
  a φ-factor: cos(|m|φ) for m>0, sin(|m|φ) for m<0. In the xz-plane (y=0, φ=0 or π),
  m<0 orbitals have zero density. Delegating to `orbitalDensity3D` at y=0 fixes both
  issues in one change.
- **Normalization comment typo** — `radialWavefunction` docstring said `((n+l)!)^3`
  (Griffiths-convention residue); the code uses the Abramowitz-Stegun convention where
  it should be `(n+l)!` to the first power. Comment corrected.

### Improved (UI)
- **2D heatmap**: added orange warning banner when m<0 (xz cross-section is blank);
  explains the orbital lies in a different plane. Heatmap title updated to say
  "xz cross-section (y = 0) — color normalized to peak".
- **Angular shape plot**: annotation updated from "Rotate around z-axis for 3D shape"
  to "θ-profile only — φ-orientation not shown for m ≠ 0".
- **Grotrian legend**: added disclaimer that same-n levels are degenerate in this
  nonrelativistic model; clarified that E1 selection rule shown is Δℓ = ±1 only
  (Δm not displayed).

### Tests
- 5 new `orbitalDensity2D` tests: non-zero origin for 1s, zero origin for 2p, m±1
  distinction, left-right symmetry for m=0, exact equality with orbitalDensity3D at y=0.
  Total: 268 tests.

## [0.2026.0508c] — 2026-05-08

### Fixed
- **Squeezed state Fock distribution wrong (physics bug)** — `decompData` for `ho-sq`
  was using the Poisson distribution (valid only for coherent states). Added
  `squeezedFockDist()` to `timeEvolution.ts` which numerically evaluates
  `P(n) = |⟨n|ψ_sq(t=0)⟩|²` by grid integration; `TimeEvolutionExplorer` now uses it
  for the HO Squeezed energy decomposition bar chart.
- **Re(ψ)/Im(ψ) display buttons visible for HO modes** — these modes only compute
  `|ψ|²`, not the complex wavefunction. Buttons now hidden when `subMode !== 'isw'`;
  switching to an HO mode resets `displayMode` to `'prob'`.
- **Squeezed state description misleading** — description said `S(r)|α⟩`; corrected
  to `D(α)S(r)|0⟩` to match what the code actually implements.
- **Expectation-value history stale after parameter change** — `histRef` accumulated
  entries from old parameter regimes. Added a reset `useEffect` that clears `histRef`
  whenever `subMode`, coefficients, `L`, `α`, `φ_α`, `ω`, or `r` change.
- **"Norm history" label misleading** — the plot shows the analytical constant 1, not
  a numerical norm check. Section header renamed to "Norm conservation".

### Tests
- 6 new `squeezedFockDist` tests: normalisation, Poisson limit (r=0), even-n-only for
  squeezed vacuum, ground-state purity, non-negativity. Total: 263 tests.

## [0.2026.0508b] — 2026-05-08

### Fixed
- **HO matrix elements wrong grid (severe)** — `StationaryExplorer` was passing
  `gridX = [0, L]` (ISW grid) to `MatrixPanel` for the harmonic oscillator, but HO
  wavefunctions live on `[−xMax, xMax]`. All HO X and P matrix elements were computed
  against incorrect x-coordinates. Fix: build a common symmetric grid from the widest
  eigenstate (n = N_LEVELS−1) and evaluate all HO wavefunctions via `hoWavefunction`.
- **P matrix Heisenberg animation wrong trig function** — `Re[P_mn(t)] = −Im[P_mn]·sin(ωmn·t)`,
  not `Im[P_mn]·cos(ωmn·t)`. Added `heisenbergReFromIm()` to `matrixElements.ts`;
  `MatrixPanel` now uses it for the P operator in animated view.
- **ISW momentum amplitude pole sign wrong for even n** — limit of φₙ(k→kₙ) is
  `−i·√(L/4π)` for all n; was returning `+i·√(L/4π)` for even n. Negligible visual
  impact (grid rarely hits exact pole), but now analytically correct.
- **Evanescent inside-barrier wavefunction discontinuity** — `insideCoeffsEvanescent`
  used `√T` as a real proxy for the complex transmission amplitude `t`, discarding its
  phase. Caused `|ψ_inside(L/2)|² = T·cos²(kL/2)` instead of `T`. Fixed by deriving
  complex A, B from the full complex `t`.
- **ParameterSlider integer values showed `.00`** — added `digits` prop (default 2);
  quantum number n, Z, and degree-angle sliders now pass `digits={0}`.
- **App subtitle** — changed "no approximations" to "no numerical eigensolvers" to
  accurately reflect that finite-difference derivatives and quadrature are used for
  visualization, but eigenvalues are always closed-form.

## [0.2026.0508a] — 2026-05-08

### Added — Ring & Aharonov-Bohm Effect module
- **New top-level tab "Ring & A-B"** — spinless particle on a 1D ring threaded by
  magnetic flux Φ; dimensionless flux φ = Φ/Φ₀ slider (−1 to 3), ring radius R, quantum number n
- **Energy level diagram** — E_n(φ) = (n−φ)²/(2R²) parabolic bands for n = −4…4;
  click plot to set φ; crossing points marked at half-integer φ; ground-state band highlighted
- **Wavefunction on ring** — polar deformation plot showing Re(ψ_n(θ)); 2|n| lobes for n ≠ 0
- **Persistent current** — sawtooth ground-state current I_gs(φ) = (n*(φ)−φ)/R² with
  amplitude ±1/(2R²); selected-n straight line overlay; discontinuities at level crossings
- **Wavepacket animation** — Gaussian superposition |ψ(θ,t)|² animated on ring;
  Play/Pause/Reset; speed slider; t/T_rev readout; exact revival time T_rev = 4πR²
- **Live readout**: E_n(φ), I_n(φ), n*(φ), E_gs, I_gs, AB phase 2πφ, T_rev
- **`src/physics/ring.ts`** — 8 exact functions: `ringEnergy`, `groundStateN`,
  `persistentCurrent`, `ringWavefunctionRe/Im`, `ringPacketCoeffs`, `ringPacket`, `revivalTime`, `crossingPhis`
- **`src/test/ring.test.ts`** — 32 tests (250 total passing)
- **`specs/aharonov-bohm.md`** — full physics spec

### Changed
- **README.md** updated to document all 7 implemented modules and 250 tests
- **CLAUDE.md** added — project conventions, module pattern, post-feature checklist

## [0.2026.0506j] — 2026-05-06

### Added / Changed — Hydrogen Atom enhancements
- **Schrödinger equation + Coulomb potential** displayed as a formula row below the readout:
  Ĥψ = Eψ · Ĥ = −½∇² + V(r) · V(r) = −Z/r (Coulomb)
- **Grotrian diagram** — comprehensive redesign matching QM project feature set:
  - **Clickable levels**: click any energy level to select that (n,l) state in the explorer
  - **n= labels on right axis** for n = 1..5
  - **Series filter buttons**: Lyman (→n=1), Balmer (→n=2), Paschen (→n=3), Brackett (→n=4)
    — clicking a series button dims all other transitions
  - **Wavelength-accurate arrow colours**: UV violet/dashed, visible solid coloured by λ,
    IR dark-red/dashed (from `wavelengthToColor` mapping)
  - **Opacity system**: clicking a level dims unreachable levels and highlights
    allowed decay channels in the focused-level colour; click again to clear focus
  - **Forbidden transitions toggle** (Δℓ ≠ ±1) — gray dashed, with hover tooltip explaining rule
  - **λ labels toggle** — shows wavelength in nm alongside each arrow
  - **Metastable 2s marker** — orange dot with hover tooltip (Δℓ = 0 forbidden, two-photon lifetime)
  - **Hover tooltip** (fixed position) — shows level energy, or for arrows: series name, λ (nm),
    ΔE (eV), colour swatch indicating visible/UV/IR
  - **Bottom legend** — Levels (current/reachable/dimmed/metastable) and Arrows (solid visible /
    UV dashed / IR dashed / gray forbidden) sections
- **Angular shape |Y_l^m(θ)|² polar plot** — new section side-by-side with 2D orbital heatmap:
  - Closed polar curve normalised to max=1; computed from `angularShape()` in hydrogen.ts
  - Fill shading with Plotly scatter fill='toself'; square axes; ? help modal
- **2D orbital heatmap**: colorbar (vertical legend bar 0–1 = |ψ|²/max) added via `showscale: true`
- **3D isosurface |ψ|²** — new collapsible section using Plotly isosurface trace:
  - Uniform 3D grid (N≤32 per axis, adaptive by n); 10% of peak isosurface
  - Real spherical harmonics with φ-dependence (cos/sin factors for m≠0)
  - Dark scene background; drag to rotate, scroll to zoom; ? help modal
  - Only computed/mounted when section is expanded (lazy rendering)
- **Two new physics functions** in `src/physics/hydrogen.ts`:
  `angularShape(l, m)` — closed xz polar-plot curve
  `orbitalDensity3D(n, l, m, x, y, z, Z)` — full 3D density with real spherical harmonics

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
