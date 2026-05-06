# Spec: Stern-Gerlach / Measurement Tab

## Overview

A second sub-tab **"Measurement"** added to the Spin-½ / Bloch Sphere page alongside the
existing **"Precession"** tab. The Bloch sphere (left column) stays visible for both tabs —
the key pedagogical moment is watching the Bloch vector snap to a pole on the same sphere
the user was just watching precess.

No backend. All physics is exact closed-form (Born rule) plus `Math.random()` for sampling.
All logic lives in `SpinExplorer.tsx`; no new files except `SternGerlachPanel.tsx` (sub-component
to keep the file manageable) and tests.

---

## Physics

### Born rule

Measuring spin along unit axis n̂ = (sin θ_n cos φ_n, sin θ_n sin φ_n, cos θ_n):

```
P(+½) = (1 + n̂ · r̂) / 2
P(−½) = (1 − n̂ · r̂) / 2
```

where r̂ = (sin θ cos φ, sin θ sin φ, cos θ) is the current Bloch vector.

P(+½) is always in [0, 1] since |n̂ · r̂| ≤ 1.

### State collapse

After outcome +½: Bloch vector snaps to +n̂.
After outcome −½: Bloch vector snaps to −n̂.

`collapseState(axis, outcome)` already exists in `src/utils/spinMath.ts` — returns
the (θ, φ) of the collapsed state.

Collapse must update the parent `theta`/`phi` state so the Bloch sphere re-renders
immediately to the collapsed position.

### N-shot simulation

N independent Bernoulli(P(+½)) samples — each draw is `Math.random() < pPlus`.
No repeated collapse: all N shots start from the same preparation state (fixed r̂ at
the moment "Run" is pressed).

---

## UI structure

### Tab strip

Add a two-button tab strip at the top of the right (controls) column in `SpinExplorer.tsx`:

```
[ Precession ]  [ Measurement ]
```

When switching to Measurement, clear the precession trajectory (cone has no meaning in
measurement context).

### Precession tab (existing controls, restructured)

Everything currently in SpinExplorer stays here, grouped into fieldset-style sections:
- Initial state sliders (θ, φ) + presets + ket + Robertson
- Magnetic field B̂ (ω₀, θ_B, φ_B sliders)
- Play / Pause / Reset

### Measurement tab — `SternGerlachPanel`

**Section 1 — Measurement axis**

Three preset buttons `x  y  z` plus `custom`. When `custom` is selected, show:
- θ_n slider (0…π)
- φ_n slider (0…2π)

The current state (θ, φ) feeding the Born rule is read from the parent — it tracks the
Bloch sphere in real time (important: if the user animates precession, stops, and switches
to Measurement, they measure the current animated position, not the initial θ/φ).

**Section 2 — Probability display**

A two-bar probability display, updated live as axis or state changes:

```
+½  [████████░░░░░░░]  62.5%
−½  [░░░░░░░████████]  37.5%
```

**Section 3 — Single measurement**

Button: **Measure once**
- Draw `outcome = Math.random() < pPlus ? '+' : '-'`
- Call `collapseState(axis, outcome)` → update parent `theta`, `phi`
- Append to measurement history

**Measurement history** (shown below the button, scrollable, max ~8 rows visible):
Each row:
```
1.  along z    (P(+½)=63%)  →  +½
2.  along x    (P(+½)=50%)  →  −½
```

Context notes inserted automatically:
- After two consecutive measurements on **different** axes: one-line explanation that
  the intermediate collapse erased the previous spin direction (non-commutativity).
- After ≥ 3 measurements where first and last axis match but middle differs: "spin-filter"
  note — measuring a perpendicular axis between two same-axis measurements randomises
  the outcome of the second same-axis measurement.

Clear button to reset history.

**Section 4 — N-shot statistics**

```
N shots: [slider or number input, 10…5000, default 500]
[ Run N shots ]
```

On click: simulate N independent draws from the fixed current state. Show histogram:

```
+½  [████████████░░]  314 / 500  (exact: 62.5%)
−½  [░░░░████████░░]  186 / 500
```

A one-line note under the histogram: "Each trial starts from the same |ψ⟩ — quantum
randomness is irreducible, not due to ignorance of a hidden variable."

**Section 5 — Identical preparation (lock state)**

Button: **Lock |ψ⟩ as prep state**
- Saves current (θ, φ) as a frozen preparation state
- Shows a small label: `|prep⟩: θ=1.047, φ=0.000`

Button (appears after locking): **Measure N times from |prep⟩**
- Runs N shots from the locked state, regardless of what the Bloch sphere
  currently shows (state may have collapsed from a prior single measurement).
- Same histogram display as Section 4.
- One-line note: "Starting from the same prepared state each time — observe that
  P(+½) converges to the exact value as N grows."

---

## New file: `src/components/SternGerlachPanel.tsx`

```ts
interface Props {
  /** Current Bloch vector angles — from SpinExplorer (tracks animation) */
  theta: number
  phi: number
  /** Called when a measurement collapses the state */
  onCollapse: (theta: number, phi: number) => void
}

export function SternGerlachPanel({ theta, phi, onCollapse }: Props)
```

All state local to this component (axis preset, nShots, history, shotResult, prepState).

---

## Changes to `SpinExplorer.tsx`

1. Add `type SpinTab = 'precession' | 'measurement'` and `activeTab` state.
2. Tab strip buttons above the controls.
3. When switching to `'measurement'`: clear trajectory (`setTrajectory([])`), stop animation.
4. When `activeTab === 'precession'`: render current controls.
5. When `activeTab === 'measurement'`: render `<SternGerlachPanel theta={currentTheta} phi={currentPhi} onCollapse={(t,p) => { setTheta(t); setPhi(p) }} />`.
   Note: pass `currentTheta`/`currentPhi` (animated position), not the raw `theta`/`phi` sliders,
   so the user can precess to a position and then measure from there.

---

## Tests: `src/test/sternGerlach.test.ts`

```
Born rule
  ✓ P(+½) = 1 when measuring |↑⟩ along z  (n̂ = ẑ, r̂ = ẑ → P = 1)
  ✓ P(+½) = 0 when measuring |↓⟩ along z  (r̂ = −ẑ → P = 0)
  ✓ P(+½) = 0.5 when measuring |+x⟩ along z  (r̂·ẑ = 0 → P = 0.5)
  ✓ P(+½) = 0.5 when measuring |↑⟩ along x   (n̂·ẑ = 0 → P = 0.5)
  ✓ P(+½) = 1 when state and axis are aligned
  ✓ P(+½) + P(−½) = 1 for arbitrary axis and state

collapseState (already in spinMath, test covers new usage patterns)
  ✓ outcome '+' along z collapses to |↑⟩  (θ=0)
  ✓ outcome '−' along z collapses to |↓⟩  (θ=π)
  ✓ outcome '+' along x collapses to |+x⟩ (θ=π/2, φ=0)
  ✓ outcome '−' along x collapses to |−x⟩ (θ=π/2, φ=π)
  ✓ collapsed state always has |r̂| = 1

N-shot simulation (pure math helper)
  ✓ 0 shots → counts {plus:0, minus:0}
  ✓ pPlus=1 → all shots are '+'
  ✓ pPlus=0 → all shots are '−'
  ✓ large N: observed fraction within 3σ of pPlus  (probabilistic, seed fixed)
```

---

## Physics helper: `bornP`

A tiny pure function extracted to make tests clean:

```ts
/** P(+½) = (1 + n̂ · r̂) / 2 — exact Born rule for spin-½ */
export function bornP(axis: Vec3, bloch: Vec3): number {
  const dot = axis[0]*bloch[0] + axis[1]*bloch[1] + axis[2]*bloch[2]
  return Math.max(0, Math.min(1, (1 + dot) / 2))
}
```

Add to `src/utils/spinMath.ts`. Used by both `SternGerlachPanel` and tests.

---

## Help modal update: `SpinInfoPanel.tsx`

Add a new **"Stern-Gerlach measurement"** section after the Robertson section:

- Born rule formula P(+½) = (1 + n̂·r̂)/2
- State collapse: post-measurement state = eigenstate of n̂·σ
- Non-commutativity: measuring x then z then x again gives 50/50 on the last z
  even if the first z gave definite +½
- Irreducible randomness: no hidden variable determines outcome in advance

---

## Implementation order

1. `bornP` in `spinMath.ts` + failing tests in `sternGerlach.test.ts`
2. Physics passes — all tests green
3. `SternGerlachPanel.tsx` — axis selector + probability bar
4. Single measurement + history + collapse
5. N-shot run + histogram
6. Lock prep state + measure from prep
7. Tab strip in `SpinExplorer.tsx`, pass `currentTheta`/`currentPhi` to panel
8. `SpinInfoPanel.tsx` — Stern-Gerlach section
9. CHANGELOG + TODO update
