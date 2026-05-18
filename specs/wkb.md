# WKB Wavefunction Overlay — Spec

## Context

`wkbT` (T_WKB = exp(−2κ̃L)) and the T vs E overlay already exist in
`tunnelling.ts` and `BarrierExplorer.tsx`.  This spec adds the missing piece:
a position-space WKB wavefunction overlaid on the exact |ψ(x)|² plot, so
users see *where* and *how much* WKB deviates from the exact solution.

## Physics — new function in `src/physics/tunnelling.ts`

```typescript
export function wkbPsiSq(x: number, E: number, V0: number, L: number): number
```

The WKB "crude" approximation ignores reflections at the barrier edges entirely
and propagates the probability flux through the barrier.

### Piecewise definition (barrier centred at origin, edges at ±L/2)

Let  k = √(2E),  half = L/2.

**Left region  x < −half:**  
`wkbPsiSq = 1`  
(incident amplitude = 1, no reflected wave in WKB)

**Inside barrier  −half ≤ x ≤ half:**

| Regime | κ̃ or κ′ | wkbPsiSq(x) |
|--------|-----------|-------------|
| E < V0 (tunnelling) | κ̃ = √(2(V0−E)) | exp(−2κ̃(x + half)) |
| E > V0 (over barrier) | κ′ = √(2(E−V0)) | k / κ′ |
| E = V0 (barrier top) | — | 1 |

The E < V0 formula decays from 1 at x = −half to T_WKB = exp(−2κ̃L) at x = +half.  
The E > V0 formula is a constant = k/κ′ (from flux conservation j = k·1 = κ′·A² → A² = k/κ′).

**Right region  x > half:**

| Regime | wkbPsiSq |
|--------|----------|
| E < V0 | T_WKB = exp(−2κ̃L) |
| E > V0 | 1  (WKB predicts T = 1 above barrier) |
| E = V0 | 1 |

### The pedagogical contrast

- **Tunnelling (E < V0):** WKB shows a smooth exponential decay; exact solution
  shows oscillatory ripple due to multiple internal reflections.  
- **Above barrier (E > V0):** WKB says T = 1 (no reflection); exact has
  resonances T = 1 and anti-resonances T < 1.  Inside, WKB is flat; exact
  oscillates.  
- **Barrier edges:** WKB has discontinuities in |ψ|² at x = ±half; exact
  solution is smooth.

## Tests — additions to `src/test/tunnelling.test.ts`

All new tests go in a new `describe('wkbPsiSq', ...)` block.

- Left of barrier: `wkbPsiSq(−L/2 − 1, E, V0, L) = 1` for E < V0 and E > V0
- Right of barrier (E < V0): equals `wkbT(E, V0, L)` 
- Right of barrier (E > V0): equals 1
- Inside, E < V0: value at left edge = 1; value at right edge = T_WKB
- Inside, E < V0: monotonically decreasing with x
- Inside, E > V0: constant = k/κ′ = √(E/(E−V0))
- E = V0 limit: returns 1 everywhere
- Positive everywhere
- Continuity at x = −L/2 (left boundary)
- Continuity at x = +L/2 (right boundary) for E < V0
- Deep tunnelling (large κ̃L): right side ≈ 0, inside decays strongly

## UI — `src/components/BarrierExplorer.tsx`

1. Import `wkbPsiSq` from `'../physics/tunnelling'`
2. Compute `wkbPsiSqVals = xVals.map(x => wkbPsiSq(x, E, V0, L))` inside the
   existing `useMemo` that computes `psiSqVals` (same deps: `[E, V0, L]`)
3. Add a WKB trace to `psiTraces`:
   ```
   { x: xVals, y: wkbPsiSqVals, type: 'scatter', mode: 'lines',
     name: 'WKB |ψ|²',
     line: { color: DARK.orange, width: 1.5, dash: 'dash' } }
   ```
4. No new sliders or help modals needed — the existing ScatteringInfoPanel
   `'wavefunction'` topic can be updated with a one-sentence WKB note.
