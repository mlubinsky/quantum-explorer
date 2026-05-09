# Quantum Explorer — CLAUDE.md

Interactive quantum mechanics explorer that runs entirely in the browser.
No PDE solvers, no matrix diagonalisers, no time-steppers — eigenfunctions
and eigenvalues are always closed-form. Numerical quadrature and finite-difference
derivatives are used where a closed form would be unwieldy (e.g. expectation
values, norms), but never to find eigenvalues or propagate wavefunctions in time.

## Dev commands

```bash
npm run dev      # dev server at http://localhost:5174
npm test         # vitest run (all tests, currently 250)
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

| Tab label | Key physics |
|---|---|
| Stationary States | ISW + HO eigenfunctions, matrix representation |
| Time Evolution | ISW superposition, HO coherent + squeezed, momentum-space |
| Free Particle | Gaussian wavepacket spreading, exact σ(t) |
| Scattering | Rectangular barrier (transfer matrix) + step potential |
| Spin-½ / Bloch Sphere | Larmor precession, Stern-Gerlach, Bell inequality |
| Hydrogen Atom | Radial/2D/3D orbitals, Grotrian diagram, Z slider |
| Ring & A-B | Aharonov-Bohm energy spectrum, persistent current, wavepacket |

## After implementing a new feature

Update these three files before committing:

- **TODO.md** — mark completed items `[x]`; move any new Phase 2 ideas to the appropriate section
- **CHANGELOG.md** — add an entry under `[Unreleased]` describing what was added
- **README.md** — add or update the module's entry in the Features section; update the test count

## What belongs in the related QM repo instead

Anything requiring a numerical eigensolver or time-stepper (double well,
Gaussian barrier, arbitrary potentials) belongs in
[github.com/mlubinsky/QM](https://github.com/mlubinsky/QM) (Python/FastAPI backend).
