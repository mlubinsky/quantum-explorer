import { describe, it, expect } from 'vitest'
import { bellCorrelation, chshS, simulatePairs } from '../physics/bell'

describe('bellCorrelation', () => {
  it('E(0) = −1 (perfectly anti-correlated)', () => {
    expect(bellCorrelation(0)).toBeCloseTo(-1, 10)
  })

  it('E(π/2) = 0 (uncorrelated)', () => {
    expect(bellCorrelation(Math.PI / 2)).toBeCloseTo(0, 10)
  })

  it('E(π) = 1 (perfectly correlated)', () => {
    expect(bellCorrelation(Math.PI)).toBeCloseTo(1, 10)
  })

  it('E(π/4) = −1/√2', () => {
    expect(bellCorrelation(Math.PI / 4)).toBeCloseTo(-1 / Math.sqrt(2), 10)
  })

  it('E(3π/4) = 1/√2', () => {
    expect(bellCorrelation(3 * Math.PI / 4)).toBeCloseTo(1 / Math.sqrt(2), 10)
  })
})

describe('chshS', () => {
  it('optimal angles (0, π/2, π/4, 3π/4) → S = 2√2', () => {
    const s = chshS(0, Math.PI / 2, Math.PI / 4, 3 * Math.PI / 4)
    expect(s).toBeCloseTo(2 * Math.sqrt(2), 10)
  })

  it('all-zero angles → S = 2 (all E=−1, cancellation gives |−2|=2)', () => {
    expect(chshS(0, 0, 0, 0)).toBeCloseTo(2, 10)
  })

  it('S ≤ 2√2 for (0, π/4, π/8, 3π/8)', () => {
    const s = chshS(0, Math.PI / 4, Math.PI / 8, 3 * Math.PI / 8)
    expect(s).toBeLessThanOrEqual(2 * Math.sqrt(2) + 1e-9)
  })

  it('S ≤ 2√2 for (0.1, 1.0, 0.5, 1.5)', () => {
    const s = chshS(0.1, 1.0, 0.5, 1.5)
    expect(s).toBeLessThanOrEqual(2 * Math.sqrt(2) + 1e-9)
  })

  it('symmetric: chshS(a,aP,b,bP) is non-negative', () => {
    expect(chshS(0, Math.PI / 2, Math.PI / 4, 3 * Math.PI / 4)).toBeGreaterThanOrEqual(0)
    expect(chshS(0.3, 1.2, 0.6, 1.9)).toBeGreaterThanOrEqual(0)
  })
})

describe('simulatePairs', () => {
  it('n=0 → samePairs=0, oppositePairs=0, eEstimate=0', () => {
    const r = simulatePairs(Math.PI / 4, 0)
    expect(r.samePairs).toBe(0)
    expect(r.oppositePairs).toBe(0)
    expect(r.eEstimate).toBe(0)
  })

  it('θ=0 → all pairs opposite (eEstimate ≈ −1)', () => {
    const r = simulatePairs(0, 10000)
    expect(r.oppositePairs).toBe(10000)
    expect(r.samePairs).toBe(0)
    expect(r.eEstimate).toBeCloseTo(-1, 10)
  })

  it('θ=π → all pairs same (eEstimate ≈ 1)', () => {
    const r = simulatePairs(Math.PI, 10000)
    expect(r.samePairs).toBe(10000)
    expect(r.oppositePairs).toBe(0)
    expect(r.eEstimate).toBeCloseTo(1, 10)
  })

  it('θ=π/2 → long-run eEstimate ≈ 0 (within 4σ)', () => {
    const r = simulatePairs(Math.PI / 2, 10000)
    const sigma = 1 / Math.sqrt(10000)
    expect(Math.abs(r.eEstimate)).toBeLessThan(4 * sigma)
  })

  it('samePairs + oppositePairs = n', () => {
    const n = 500
    const r = simulatePairs(Math.PI / 4, n)
    expect(r.samePairs + r.oppositePairs).toBe(n)
  })

  it('eEstimate = (samePairs − oppositePairs) / n', () => {
    const r = simulatePairs(Math.PI / 3, 200)
    const expected = (r.samePairs - r.oppositePairs) / 200
    expect(r.eEstimate).toBeCloseTo(expected, 10)
  })
})
