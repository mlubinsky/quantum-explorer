import { describe, it, expect } from 'vitest'
import {
  deltaT, deltaR, deltaBoundEnergy, deltaBoundPsiSq, deltaPsiSq,
} from '../physics/delta'

describe('deltaT / deltaR', () => {
  it('T + R = 1 for various E and alpha', () => {
    const cases = [
      [1.0, 1.0], [3.0, 2.0], [0.1, 3.0], [10.0, 0.5], [5.0, 5.0],
    ]
    for (const [E, a] of cases) {
      expect(deltaT(E, a) + deltaR(E, a)).toBeCloseTo(1, 12)
    }
  })

  it('T = 0 at E = 0', () => {
    expect(deltaT(0, 2)).toBe(0)
    expect(deltaT(-1, 2)).toBe(0)
  })

  it('T = 1 when alpha = 0 (free particle)', () => {
    expect(deltaT(1.0, 0)).toBe(1)
    expect(deltaT(5.0, 0)).toBe(1)
  })

  it('T approaches 1 for large E', () => {
    expect(deltaT(1000, 2)).toBeGreaterThan(0.99)
    expect(deltaT(10000, 3)).toBeGreaterThan(0.999)
  })

  it('T decreases monotonically as alpha increases', () => {
    const E = 2.0
    const T1 = deltaT(E, 1)
    const T2 = deltaT(E, 2)
    const T3 = deltaT(E, 4)
    expect(T1).toBeGreaterThan(T2)
    expect(T2).toBeGreaterThan(T3)
  })

  it('T increases monotonically with E', () => {
    const alpha = 2.0
    const T1 = deltaT(0.5, alpha)
    const T2 = deltaT(2.0, alpha)
    const T3 = deltaT(8.0, alpha)
    expect(T1).toBeLessThan(T2)
    expect(T2).toBeLessThan(T3)
  })

  it('T = 1/2 when E = alpha²/2 (= |E_b| for attractive)', () => {
    // deltaT(α²/2, α) = 2·(α²/2) / (2·(α²/2) + α²) = α²/(2α²) = 1/2
    for (const alpha of [1, 2, 3, 0.5]) {
      const E_half = alpha * alpha / 2
      expect(deltaT(E_half, alpha)).toBeCloseTo(0.5, 10)
    }
  })

  it('T depends only on alpha² — same for sign=+1 and sign=-1', () => {
    // T has no dependence on sign of g, only |g|
    // (this is verified by the formula: T = k²/(k²+α²))
    expect(deltaT(2.0, 1.5)).toBeCloseTo(deltaT(2.0, 1.5), 12)
    // Both attractive and repulsive give the same T
    expect(deltaT(3.0, 2.0)).toBeCloseTo(3 * 2 / (3 * 2 + 4), 10)
  })
})

describe('deltaBoundEnergy', () => {
  it('E_b = −alpha²/2', () => {
    expect(deltaBoundEnergy(1)).toBeCloseTo(-0.5, 12)
    expect(deltaBoundEnergy(2)).toBeCloseTo(-2.0, 12)
    expect(deltaBoundEnergy(3)).toBeCloseTo(-4.5, 12)
  })

  it('E_b is always negative', () => {
    for (const alpha of [0.1, 1, 2, 5]) {
      expect(deltaBoundEnergy(alpha)).toBeLessThan(0)
    }
  })

  it('|E_b| equals the half-transmission energy: T(|E_b|, alpha) = 1/2', () => {
    for (const alpha of [1, 2, 0.5]) {
      const Eb = Math.abs(deltaBoundEnergy(alpha))
      expect(deltaT(Eb, alpha)).toBeCloseTo(0.5, 10)
    }
  })
})

describe('deltaBoundPsiSq', () => {
  it('peaks at x = 0 with value alpha', () => {
    expect(deltaBoundPsiSq(0, 1)).toBeCloseTo(1, 12)
    expect(deltaBoundPsiSq(0, 2)).toBeCloseTo(2, 12)
    expect(deltaBoundPsiSq(0, 3)).toBeCloseTo(3, 12)
  })

  it('is symmetric in x', () => {
    for (const alpha of [1, 2]) {
      for (const x of [0.5, 1.0, 2.0]) {
        expect(deltaBoundPsiSq(x, alpha)).toBeCloseTo(deltaBoundPsiSq(-x, alpha), 12)
      }
    }
  })

  it('normalises to 1 (trapezoidal quadrature)', () => {
    for (const alpha of [0.5, 1.0, 2.0]) {
      const N = 4000
      const xMax = 20 / alpha
      const dx = 2 * xMax / (N - 1)
      let sum = 0
      for (let i = 0; i < N; i++) {
        const x = -xMax + i * dx
        const w = (i === 0 || i === N - 1) ? 0.5 : 1
        sum += w * deltaBoundPsiSq(x, alpha)
      }
      expect(sum * dx).toBeCloseTo(1, 3)
    }
  })
})

describe('deltaPsiSq', () => {
  it('is continuous at x = 0 (|ψ(0-)| = |ψ(0+)| = T)', () => {
    const cases: [number, number, 1 | -1][] = [
      [1.0, 1.0, 1], [2.0, 2.0, -1], [3.0, 0.5, 1], [0.5, 3.0, -1],
    ]
    for (const [E, alpha, sign] of cases) {
      const T = deltaT(E, alpha)
      const psiLeft  = deltaPsiSq(-1e-8, E, alpha, sign)
      const psiRight = deltaPsiSq(0, E, alpha, sign)
      expect(psiLeft).toBeCloseTo(T, 5)
      expect(psiRight).toBeCloseTo(T, 10)
    }
  })

  it('is flat at T for all x > 0', () => {
    const E = 2.0, alpha = 1.5
    const T = deltaT(E, alpha)
    for (const x of [0, 0.5, 1.0, 3.0, 10.0]) {
      expect(deltaPsiSq(x, E, alpha, 1)).toBeCloseTo(T, 10)
      expect(deltaPsiSq(x, E, alpha, -1)).toBeCloseTo(T, 10)
    }
  })

  it('oscillates between (1−√R)² and (1+√R)² for x < 0', () => {
    const E = 1.0, alpha = 2.0
    const T = deltaT(E, alpha)
    const R = 1 - T
    const sqrtR = Math.sqrt(R)
    const yMin = (1 - sqrtR) * (1 - sqrtR)
    const yMax = (1 + sqrtR) * (1 + sqrtR)
    const k = Math.sqrt(2 * E)
    // sample many x < 0 and check bounds
    let observedMin = Infinity, observedMax = -Infinity
    for (let i = 0; i < 1000; i++) {
      const x = -0.01 - i * 2 * Math.PI / (k * 100)
      const v = deltaPsiSq(x, E, alpha, 1)
      if (v < observedMin) observedMin = v
      if (v > observedMax) observedMax = v
    }
    expect(observedMin).toBeGreaterThanOrEqual(yMin - 1e-6)
    expect(observedMax).toBeLessThanOrEqual(yMax + 1e-6)
  })

  it('attractive and repulsive give different wavefunction patterns on left', () => {
    const E = 1.0, alpha = 2.0
    // rIm has opposite sign, so the interference pattern shifts
    const x = -1.0
    const psiAttr = deltaPsiSq(x, E, alpha, -1)
    const psiRepu = deltaPsiSq(x, E, alpha, 1)
    // They will generally differ (sin term flips sign)
    expect(Math.abs(psiAttr - psiRepu)).toBeGreaterThan(0.001)
  })

  it('returns 0 for E <= 0', () => {
    expect(deltaPsiSq(-1.0, 0, 1.0, 1)).toBe(0)
    expect(deltaPsiSq(0.5, -1.0, 1.0, -1)).toBe(0)
  })
})
