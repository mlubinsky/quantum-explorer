# Quantum Explorer — CLAUDE.md

Interactive quantum mechanics explorer that runs entirely in the browser.
No PDE solvers, no matrix diagonalisers, no time-steppers — eigenfunctions
and eigenvalues are always closed-form. Numerical quadrature and finite-difference
derivatives are used where a closed form would be unwieldy (e.g. expectation
values, norms), but never to find eigenvalues or propagate wavefunctions in time.

## Dev commands

```bash
npm run dev      # dev server at http://localhost:5174
npm test         # vitest run (all tests, currently 593)
npm run build    # production build
```

## Module pattern

Every physics module follows this layout:

| File | Role |
|---|---|
| `src/physics/<name>.ts` | Pure functions only — no React, no side effects |
| `src/test/<name>.test.ts` | Vitest unit tests — write these first |
| `src/components/<Name>Explorer.tsx` | Main UI component |
| `src/components/<Name>InfoPanel.tsx` | KaTeX help content for ? modals |
| `specs/<name>.md` | Physics spec and implementation notes |

Wiring a new module into `App.tsx` requires three touches:
1. Add to the `Module` type union
2. Add `{ id, label }` entry to `MODULES` array
3. Add `{active === '...' && <...Explorer />}` in `<main>`

## Physics conventions

- Atomic units throughout: ħ = mₑ = e = 1
- Flux quantum Φ₀ = 2π (atomic units)
- Energies in Hartree (Eₕ), lengths in Bohr radii (a₀)

## Existing modules

Modules are grouped in the nav dropdown by category.

### Single Particle — 1D

| Tab label | Key physics |
|---|---|
| Stationary States | ISW + HO eigenfunctions, matrix representation (H, X, P heatmaps), Heisenberg picture |
| Time Evolution | ISW superposition + quantum revival, HO coherent + squeezed states, momentum-space animation |
| Free Particle | Gaussian wavepacket spreading, exact σ(t) |
| Scattering | 6 sub-tabs: Barrier (transfer matrix), Step, Delta (δ-function, bound state), Pöschl-Teller (reflectionless, N bound states), Kronig-Penney (band structure, Brillouin zone), Morse (anharmonic, Laguerre wavefunctions) |
| Wigner Function | W(x,p) for Fock, coherent, squeezed, cat (even/odd), Fock superposition states; animated for coherent/squeezed |

### Atoms & Fields

| Tab label | Key physics |
|---|---|
| Hydrogen Atom | Radial/2D/3D orbitals, Grotrian diagram, emission spectra (4 series), Z slider, normal Zeeman effect, linear Stark effect (n=2 parabolic splitting) |
| Ring & A-B | Aharonov-Bohm energy spectrum, persistent current, wavepacket |

### Two Particles

| Tab label | Key physics |
|---|---|
| Bosons & Fermions (ISW) | Two-particle 2D density heatmap; distinguishable / bosons / fermions statistics; marginal and diagonal distributions; Pauli exclusion |

### Quantum Information

| Tab label | Key physics |
|---|---|
| Spin-½ / Bloch Sphere | Larmor precession, state presets, Robertson uncertainty; Stern-Gerlach measurement tab (Born-rule probabilities, N-shot histogram, measurement history); Bell inequality demo (CHSH, singlet correlation) |

## After implementing a new feature

Update these three files before committing:

- **TODO.md** — mark completed items `[x]`; move any new Phase 2 ideas to the appropriate section
- **CHANGELOG.md** — add an entry under `[Unreleased]` describing what was added
- **README.md** — add or update the module's entry in the Features section; update the test count

## What belongs in the related QM repo instead

Anything requiring a numerical eigensolver or time-stepper (double well,
Gaussian barrier, arbitrary potentials) belongs in
[github.com/mlubinsky/QM](https://github.com/mlubinsky/QM) (Python/FastAPI backend).
