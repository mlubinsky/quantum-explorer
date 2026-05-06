# quantum-explorer — Architecture

## Stack

Identical to the QM project frontend — no new dependencies to learn:

- **Framework**: React + TypeScript + Vite
- **Plotting**: Plotly.js + react-plotly.js
- **3D**: Three.js + react-three-fiber
- **Math display**: react-katex
- **Testing**: Vitest + @testing-library/react

`mathjs` is intentionally omitted — all polynomial recurrences (Hermite, Laguerre,
Legendre) are implemented directly as pure TypeScript functions.

## Key architectural difference from QM project

The QM project is **request-driven**: parameter change → solve button → API call →
Python backend → response → render.

quantum-explorer is **reactive**: parameter change (slider) → instant recompute in
browser → render. No solve button, no loading state, no backend.

## What is reused from QM project vs. rewritten

### Copy verbatim (pure JS, no backend dependency)

| Source file | Purpose |
|---|---|
| `utils/spinMath.ts` | Bloch vector, Rodrigues rotation, spin-½ math |
| `utils/matrixElements.ts` | Matrix element calculations |
| `utils/classicalMechanics.ts` | Classical trajectory overlay |
| `utils/units.ts` | Atomic unit conversions |
| `components/BlochSphere.tsx` | Three.js Bloch sphere with precession |
| `components/ParameterSlider.tsx` + `.module.css` | Reusable slider |
| `components/OrbitalIsosurface.tsx` | Three.js 3D orbital renderer |
| `components/GrotrianDiagram.tsx` | Hydrogen energy level diagram |

### Copy and refactor (strip API calls, keep visualization)

| Source file | What to change |
|---|---|
| `components/HydrogenicPanel.tsx` | Replace API calls with pure-JS physics functions |
| `components/SpinPanel.tsx` | Verify no API dependency; likely clean |

### Do not use

- `api/client.ts` — backend HTTP client, not needed
- `types/api.ts` — request/response types for Python backend
- `components/ErrorBanner.tsx` — backend error display
- `components/SolverInfoPanel.tsx` — solver metadata from backend

## Physics layer

All physics lives in `src/physics/` as pure TypeScript functions:

```
src/physics/
  isw.ts          — infinite square well eigenstates, time evolution
  harmonic.ts     — HO eigenstates, coherent states, squeezed states
  hydrogen.ts     — radial/angular wavefunctions, energy levels
  spin.ts         — re-exports from spinMath.ts + Rabi, Bell states
  barrier.ts      — step potential, rectangular barrier T/R coefficients
  morse.ts        — Morse potential eigenstates
  kronigPenney.ts — band structure
  ring.ts         — particle on a ring, AB effect
```

Each module exports only pure functions: `(params) => result`. No global state,
no side effects, no API calls.

## State management

No Redux, no Zustand. React `useState` + `useMemo` is sufficient:
- Sliders update state
- `useMemo` recomputes physics when parameters change
- Components receive computed data as props

## Deployment

`vite build` → static files → GitHub Pages. No server required.
