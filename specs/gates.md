# Single-Qubit Gates — Spec

## Goal

A 4th tab ("Gates") in the Spin-½ / Bloch Sphere module. Users click gate
buttons to apply unitary operations to a qubit; the Bloch sphere sweeps from
the old to the new state via a great-circle arc animation, making the
geometric nature of gates concrete.

## Physics — `src/physics/gates.ts`

All functions are pure, no React. FT convention follows Nielsen & Chuang.

### Qubit state

```
type Qubit = { aRe, aIm, bRe, bIm }   // |ψ⟩ = (aRe+i·aIm)|↑⟩ + (bRe+i·bIm)|↓⟩
```

Conversion helpers:
- `blochToQubit(θ, φ)` → `(cos(θ/2), 0, sin(θ/2)cos φ, sin(θ/2)sin φ)`
- `qubitToBloch(q)` → `(rx, ry, rz)` via `rx = 2(aRe·bRe+aIm·bIm)`,
  `ry = 2(aRe·bIm−aIm·bRe)`, `rz = |α|²−|β|²`
- `qubitAngles(q)` → `{ theta, phi }` — arccos(rz), atan2(ry, rx)
- `qubitNorm(q)` → should always be 1

### Gate matrices (standard convention)

| Gate | Matrix | Bloch rotation |
|---|---|---|
| X | [[0,1],[1,0]] | Rx(π): (x,y,z)→(x,−y,−z) |
| Y | [[0,−i],[i,0]] | Ry(π): (x,y,z)→(−x,y,−z) |
| Z | [[1,0],[0,−1]] | Rz(π): (x,y,z)→(−x,−y,z) |
| H | [[1,1],[1,−1]]/√2 | R_{x̂+ẑ}(π): swaps x↔z, flips y |
| S | [[1,0],[0,i]] | Rz(π/2) |
| S† | [[1,0],[0,−i]] | Rz(−π/2) |
| T | [[1,0],[0,e^{iπ/4}]] | Rz(π/4) |
| T† | [[1,0],[0,e^{−iπ/4}]] | Rz(−π/4) |
| Rx(θ) | [[cos θ/2, −i sin θ/2],[−i sin θ/2, cos θ/2]] | rotation by θ around x̂ |
| Ry(θ) | [[cos θ/2, −sin θ/2],[sin θ/2, cos θ/2]] | rotation by θ around ŷ |
| Rz(θ) | [[e^{−iθ/2},0],[0,e^{iθ/2}]] | rotation by −θ around ẑ |

### Animation helper

`blochSlerp(r_old, r_new, nPoints)` — spherical linear interpolation along
the great-circle arc between two Bloch vectors. Returns `nPoints` Vec3 values.
Used to generate the trajectory shown on the sphere after each gate.

## UI — `src/components/GatesPanel.tsx`

### Props

```typescript
interface GatesPanelProps {
  theta: number            // current Bloch polar angle
  phi:   number            // current Bloch azimuthal angle
  onStateChange: (theta: number, phi: number, trail: Vec3[]) => void
}
```

### Layout

**State preset strip** — one-click: |↑⟩ |↓⟩ |+x⟩ |−x⟩ |+y⟩ |−y⟩

**Gate pad** (3 rows):
- Pauli: [X] [Y] [Z]
- Clifford: [H] [S] [S†]
- T-family: [T] [T†]

**Parametric** — axis selector (Rx / Ry / Rz) + angle slider (−2π to 2π) +
[Apply] button

**Gate history** — horizontal scrolling strip of gate labels (max 12 shown)
+ [↩ Undo] button

**State readout** — |ψ⟩ = α|↑⟩ + β|↓⟩ with formatted complex components;
Bloch vector (rx, ry, rz) to 3 d.p.

## SpinExplorer wiring

1. Add `'gates'` to `SpinTab` union and `SPIN_TABS` array
2. Add `gateTheta`, `gatePhi`, `gateTrajectory` state (initialised to θ=π/3, φ=0)
3. Pass to `BlochSphere` when `activeTab === 'gates'`
4. Render `<GatesPanel>` when `activeTab === 'gates'`
5. `handleTabChange` resets gate trajectory when leaving the gates tab

## URL state

`tab=gates` is already encoded by the existing URL state hook.
