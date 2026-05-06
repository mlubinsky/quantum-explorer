import { describe, it, expect } from 'vitest'
import { stepT, stepR, stepPsiSq, stepPenetrationDepth } from '../physics/step'

describe('stepT', () => {
  it('V0=0: T = 1 for all E (no step)', () => {
    expect(stepT(1.0, 0)).toBeCloseTo(1, 10)
    expect(stepT(5.0, 0)).toBeCloseTo(1, 10)
    expect(stepT(0.1, 0)).toBeCloseTo(1, 10)
  })

  it('E < V0: T = 0 (total reflection)', () => {
    expect(stepT(1.0, 5.0)).toBeCloseTo(0, 10)
    expect(stepT(0.5, 3.0)).toBeCloseTo(0, 10)
    expect(stepT(2.0, 10.0)).toBeCloseTo(0, 10)
  })

  it('E = V0: T = 0 (limiting case at step top)', () => {
    expect(stepT(5.0, 5.0)).toBeCloseTo(0, 8)
    expect(stepT(3.0, 3.0)).toBeCloseTo(0, 8)
  })

  it('T + R = 1 for E > V0', () => {
    expect(stepT(8, 5) + stepR(8, 5)).toBeCloseTo(1, 10)
    expect(stepT(10, 3) + stepR(10, 3)).toBeCloseTo(1, 10)
    expect(stepT(2, 1) + stepR(2, 1)).toBeCloseTo(1, 10)
  })

  it('T = 4k₁k₂/(k₁+k₂)² for E > V0', () => {
    const E = 8, V0 = 3
    const k1 = Math.sqrt(2 * E)
    const k2 = Math.sqrt(2 * (E - V0))
    const expected = 4 * k1 * k2 / Math.pow(k1 + k2, 2)
    expect(stepT(E, V0)).toBeCloseTo(expected, 10)
  })

  it('T → 1 as E → ∞', () => {
    expect(stepT(1000, 5)).toBeCloseTo(1, 4)
  })

  it('negative V0 (downward step): T ≤ 1 and T + R = 1', () => {
    const T = stepT(2, -3)
    const R = stepR(2, -3)
    expect(T).toBeLessThanOrEqual(1 + 1e-10)
    expect(T + R).toBeCloseTo(1, 10)
  })

  it('downward step V0 < 0: T = 4k₁k₂/(k₁+k₂)² (same formula)', () => {
    const E = 2, V0 = -3
    const k1 = Math.sqrt(2 * E)
    const k2 = Math.sqrt(2 * (E - V0))
    const expected = 4 * k1 * k2 / Math.pow(k1 + k2, 2)
    expect(stepT(E, V0)).toBeCloseTo(expected, 10)
  })
})

describe('stepR', () => {
  it('R = 1 for E < V0', () => {
    expect(stepR(1, 5)).toBeCloseTo(1, 10)
    expect(stepR(2, 10)).toBeCloseTo(1, 10)
  })

  it('R = 1 − T for E > V0', () => {
    const E = 8, V0 = 5
    expect(stepR(E, V0)).toBeCloseTo(1 - stepT(E, V0), 10)
  })

  it('R = ((k₁−k₂)/(k₁+k₂))² for E > V0', () => {
    const E = 8, V0 = 3
    const k1 = Math.sqrt(2 * E)
    const k2 = Math.sqrt(2 * (E - V0))
    const expected = Math.pow((k1 - k2) / (k1 + k2), 2)
    expect(stepR(E, V0)).toBeCloseTo(expected, 10)
  })
})

describe('stepPsiSq', () => {
  it('V0=0: |ψ|² = 1 everywhere (free particle)', () => {
    for (const x of [-5, -2, 0, 2, 5]) {
      expect(stepPsiSq(x, 2, 0)).toBeCloseTo(1, 6)
    }
  })

  it('right of step (E > V0): |ψ|² = T·(k₁/k₂) constant', () => {
    const E = 8, V0 = 3
    const k1 = Math.sqrt(2 * E)
    const k2 = Math.sqrt(2 * (E - V0))
    const T = stepT(E, V0)
    const expected = T * (k1 / k2)
    for (const x of [0.5, 1, 2, 5]) {
      expect(stepPsiSq(x, E, V0)).toBeCloseTo(expected, 6)
    }
  })

  it('E < V0: right of step shows exponential decay (larger x → smaller |ψ|²)', () => {
    const E = 1, V0 = 5
    const psi1 = stepPsiSq(0.1, E, V0)
    const psi2 = stepPsiSq(1.0, E, V0)
    const psi3 = stepPsiSq(3.0, E, V0)
    expect(psi1).toBeGreaterThan(psi2)
    expect(psi2).toBeGreaterThan(psi3)
  })

  it('continuity at x=0: left and right values match', () => {
    // Above step
    const E = 8, V0 = 3
    const psiLeft  = stepPsiSq(-1e-6, E, V0)
    const psiRight = stepPsiSq( 1e-6, E, V0)
    expect(psiLeft).toBeCloseTo(psiRight, 3)

    // Below step
    const E2 = 1, V02 = 5
    const psiLeft2  = stepPsiSq(-1e-6, E2, V02)
    const psiRight2 = stepPsiSq( 1e-6, E2, V02)
    expect(psiLeft2).toBeCloseTo(psiRight2, 3)
  })
})

describe('stepPenetrationDepth', () => {
  it('δ = 1/√(2(V0-E))', () => {
    const E = 1, V0 = 5
    const expected = 1 / Math.sqrt(2 * (V0 - E))
    expect(stepPenetrationDepth(E, V0)).toBeCloseTo(expected, 10)
  })

  it('δ increases as E approaches V0 from below', () => {
    const V0 = 5
    const d1 = stepPenetrationDepth(1, V0)
    const d2 = stepPenetrationDepth(3, V0)
    const d3 = stepPenetrationDepth(4.5, V0)
    expect(d2).toBeGreaterThan(d1)
    expect(d3).toBeGreaterThan(d2)
  })
})
