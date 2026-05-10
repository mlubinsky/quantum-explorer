import { describe, it, expect } from 'vitest'
import {
  transmissionT, reflectionR, wkbT, resonanceEnergies, scatteringPsiSq,
  _testScatteringAmplitudes,
} from '../physics/tunnelling'

const PI = Math.PI

describe('transmissionT', () => {
  it('V0=0: T = 1 for all E (free particle)', () => {
    expect(transmissionT(1.0, 0, 2)).toBeCloseTo(1, 8)
    expect(transmissionT(5.0, 0, 3)).toBeCloseTo(1, 8)
    expect(transmissionT(0.1, 0, 1)).toBeCloseTo(1, 8)
  })

  it('T + R = 1 for above-barrier case', () => {
    // E > V0
    const T = transmissionT(8, 5, 2)
    const R = reflectionR(8, 5, 2)
    expect(T + R).toBeCloseTo(1, 10)
  })

  it('T + R = 1 for tunnelling case', () => {
    // E < V0
    const T = transmissionT(1, 5, 2)
    const R = reflectionR(1, 5, 2)
    expect(T + R).toBeCloseTo(1, 10)
  })

  it('T + R = 1 for negative V0 (well)', () => {
    const T = transmissionT(2, -3, 2)
    const R = reflectionR(2, -3, 2)
    expect(T + R).toBeCloseTo(1, 10)
  })

  it('T in (0, 1] for E < V0 (tunnelling)', () => {
    const T = transmissionT(1, 5, 2)
    expect(T).toBeGreaterThan(0)
    expect(T).toBeLessThanOrEqual(1)
  })

  it('resonance: T = 1 when κL = π (n=1 above barrier)', () => {
    // κ = √(2(E−V0)), κL = π → E = V0 + π²/(2L²)
    const V0 = 3; const L = 2
    const E_res = V0 + (PI * PI) / (2 * L * L)
    expect(transmissionT(E_res, V0, L)).toBeCloseTo(1, 8)
  })

  it('resonance: T = 1 when κL = 2π (n=2 above barrier)', () => {
    const V0 = 2; const L = 3
    const E_res = V0 + (4 * PI * PI) / (2 * L * L)
    expect(transmissionT(E_res, V0, L)).toBeCloseTo(1, 8)
  })

  it('deep tunnelling: T decreases as L increases', () => {
    const T1 = transmissionT(1, 5, 1)
    const T2 = transmissionT(1, 5, 3)
    const T3 = transmissionT(1, 5, 6)
    expect(T1).toBeGreaterThan(T2)
    expect(T2).toBeGreaterThan(T3)
  })

  it('high energy limit: T → 1 as E → ∞', () => {
    expect(transmissionT(1000, 5, 2)).toBeCloseTo(1, 4)
  })

  it('E = V0 (resonance top): T is finite and between 0 and 1', () => {
    const T = transmissionT(5, 5, 2)
    expect(T).toBeGreaterThan(0)
    expect(T).toBeLessThanOrEqual(1)
  })

  it('negative V0 (well): resonances occur, T ≤ 1', () => {
    const V0 = -3; const L = 2
    // κ = √(2(E−V0)) = √(2(E+3)), κL = π → E_res = π²/(2L²) + V0
    const E_res = (PI * PI) / (2 * L * L) + V0
    if (E_res > 0) {
      expect(transmissionT(E_res, V0, L)).toBeCloseTo(1, 8)
    }
    expect(transmissionT(2, V0, L)).toBeLessThanOrEqual(1 + 1e-9)
  })
})

describe('reflectionR', () => {
  it('R = 1 − T for above-barrier', () => {
    const E = 8, V0 = 5, L = 2
    expect(reflectionR(E, V0, L)).toBeCloseTo(1 - transmissionT(E, V0, L), 10)
  })

  it('R = 1 − T for tunnelling', () => {
    const E = 1, V0 = 5, L = 2
    expect(reflectionR(E, V0, L)).toBeCloseTo(1 - transmissionT(E, V0, L), 10)
  })
})

describe('wkbT', () => {
  it('equals exp(−2κ̃L) exactly for E < V0', () => {
    const E = 1, V0 = 5, L = 2
    const kappa = Math.sqrt(2 * (V0 - E))
    expect(wkbT(E, V0, L)).toBeCloseTo(Math.exp(-2 * kappa * L), 10)
  })

  it('returns NaN for E = V0 (formula undefined above barrier)', () => {
    expect(wkbT(5, 5, 2)).toBeNaN()
  })

  it('returns NaN for E > V0', () => {
    expect(wkbT(8, 5, 2)).toBeNaN()
  })

  it('WKB approximates exact T, is less than exact T for finite barrier', () => {
    const E = 1, V0 = 5, L = 2
    const Texact = transmissionT(E, V0, L)
    const Twkb  = wkbT(E, V0, L)
    expect(Twkb).toBeGreaterThan(0)
    expect(Twkb).toBeLessThanOrEqual(1)
    expect(Texact).toBeGreaterThanOrEqual(Twkb - 1e-9)
  })

  it('WKB → 0 as L → ∞', () => {
    expect(wkbT(1, 5, 20)).toBeCloseTo(0, 8)
  })
})

describe('resonanceEnergies', () => {
  it('first resonance = V0 + π²/(2L²)', () => {
    const V0 = 3, L = 2
    const res = resonanceEnergies(V0, L, 5)
    expect(res[0]).toBeCloseTo(V0 + PI * PI / (2 * L * L), 10)
  })

  it('nth resonance = V0 + n²π²/(2L²)', () => {
    const V0 = 2, L = 3
    const res = resonanceEnergies(V0, L, 5)
    for (let n = 1; n <= Math.min(res.length, 4); n++) {
      expect(res[n - 1]).toBeCloseTo(V0 + (n * n * PI * PI) / (2 * L * L), 10)
    }
  })

  it('returns only energies above V0', () => {
    const V0 = 5, L = 2
    const res = resonanceEnergies(V0, L, 5)
    for (const E of res) {
      expect(E).toBeGreaterThan(V0)
    }
  })
})

describe('scatteringPsiSq', () => {
  it('right of barrier: |ψ|² = T (constant transmitted wave)', () => {
    const E = 8, V0 = 5, L = 2
    const T = transmissionT(E, V0, L)
    // sample several x values well to the right
    for (const x of [L / 2 + 1, L / 2 + 2, L / 2 + 3]) {
      expect(scatteringPsiSq(x, E, V0, L)).toBeCloseTo(T, 8)
    }
  })

  it('V0=0: |ψ|² = 1 everywhere (no reflection)', () => {
    const E = 2, V0 = 0, L = 2
    for (const x of [-5, -2, 0, 2, 5]) {
      expect(scatteringPsiSq(x, E, V0, L)).toBeCloseTo(1, 6)
    }
  })

  it('tunnelling: |ψ|² decays inside barrier', () => {
    const E = 1, V0 = 5, L = 4
    const psiAtLeft  = scatteringPsiSq(-L / 2 - 0.01, E, V0, L)
    const psiInside  = scatteringPsiSq(0, E, V0, L)
    // evanescent wave decays; interior should be smaller than entrance
    expect(psiInside).toBeLessThan(psiAtLeft)
  })

  it('evanescent: |ψ|² is continuous at right barrier boundary', () => {
    const E = 1, V0 = 5, L = 2
    const T = transmissionT(E, V0, L)
    const eps = 1e-6
    const psiInsideRight = scatteringPsiSq(L / 2 - eps, E, V0, L)
    expect(psiInsideRight).toBeCloseTo(T, 4)
  })

  it('evanescent: |ψ|² is continuous at left barrier boundary', () => {
    const E = 1, V0 = 5, L = 2
    const eps = 1e-6
    const psiLeft  = scatteringPsiSq(-L / 2 - eps, E, V0, L)
    const psiInside = scatteringPsiSq(-L / 2 + eps, E, V0, L)
    expect(psiInside).toBeCloseTo(psiLeft, 4)
  })

  it('oscillatory: |ψ|² is continuous at left barrier boundary', () => {
    const E = 8, V0 = 3, L = 2
    const eps = 1e-6
    const psiLeft   = scatteringPsiSq(-L / 2 - eps, E, V0, L)
    const psiInside = scatteringPsiSq(-L / 2 + eps, E, V0, L)
    expect(psiInside).toBeCloseTo(psiLeft, 4)
  })

  it('oscillatory: |ψ|² is continuous at right barrier boundary', () => {
    const E = 8, V0 = 3, L = 2
    const T = transmissionT(E, V0, L)
    const eps = 1e-6
    const psiInsideRight = scatteringPsiSq(L / 2 - eps, E, V0, L)
    expect(psiInsideRight).toBeCloseTo(T, 4)
  })

  it('E = V0: |ψ|² is continuous at both barrier boundaries (linear inside solution)', () => {
    const V0 = 4, L = 2, E = V0
    const eps = 1e-5
    const psiLeftOut  = scatteringPsiSq(-L / 2 - eps, E, V0, L)
    const psiLeftIn   = scatteringPsiSq(-L / 2 + eps, E, V0, L)
    const psiRightIn  = scatteringPsiSq( L / 2 - eps, E, V0, L)
    const psiRightOut = scatteringPsiSq( L / 2 + eps, E, V0, L)
    expect(psiLeftIn).toBeCloseTo(psiLeftOut, 3)
    expect(psiRightIn).toBeCloseTo(psiRightOut, 3)
  })

  it('E = V0: inside |ψ|² varies with x (not constant)', () => {
    const V0 = 4, L = 2, E = V0
    const psiCenter = scatteringPsiSq(0, E, V0, L)
    const psiEdge   = scatteringPsiSq(L / 2 - 1e-4, E, V0, L)
    // Linear solution — centre and edge differ
    expect(Math.abs(psiCenter - psiEdge)).toBeGreaterThan(1e-6)
  })
})

describe('scatteringAmplitudes (internal)', () => {
  it('oscillatory: |r|² + |t|² = 1 exactly', () => {
    for (const [E, V0, L] of [[8, 3, 2], [5, 2, 1.5], [10, 4, 3]] as [number, number, number][]) {
      const { rRe, rIm, tRe, tIm } = _testScatteringAmplitudes(E, V0, L)
      const sum = rRe*rRe + rIm*rIm + tRe*tRe + tIm*tIm
      expect(sum).toBeCloseTo(1, 10)
    }
  })

  it('evanescent: |r|² + |t|² = 1 exactly', () => {
    for (const [E, V0, L] of [[1, 5, 2], [2, 8, 1], [0.5, 3, 3]] as [number, number, number][]) {
      const { rRe, rIm, tRe, tIm } = _testScatteringAmplitudes(E, V0, L)
      const sum = rRe*rRe + rIm*rIm + tRe*tRe + tIm*tIm
      expect(sum).toBeCloseTo(1, 10)
    }
  })

  it('|t|² matches transmissionT for oscillatory case', () => {
    const E = 8, V0 = 3, L = 2
    const { tRe, tIm } = _testScatteringAmplitudes(E, V0, L)
    expect(tRe*tRe + tIm*tIm).toBeCloseTo(transmissionT(E, V0, L), 10)
  })

  it('|t|² matches transmissionT for evanescent case', () => {
    const E = 1, V0 = 5, L = 2
    const { tRe, tIm } = _testScatteringAmplitudes(E, V0, L)
    expect(tRe*tRe + tIm*tIm).toBeCloseTo(transmissionT(E, V0, L), 10)
  })

  it('V0=0: r = 0, t = e^{−ikL}', () => {
    const E = 3, V0 = 0, L = 2
const { rRe, rIm, tRe, tIm } = _testScatteringAmplitudes(E, V0, L)
    expect(rRe).toBeCloseTo(0, 10)
    expect(rIm).toBeCloseTo(0, 10)
    expect(tRe*tRe + tIm*tIm).toBeCloseTo(1, 10)
  })

  it('resonance: r = 0 when κL = nπ (above barrier)', () => {
    const V0 = 3, L = 2
    const E_res = V0 + (PI * PI) / (2 * L * L)
    const { rRe, rIm } = _testScatteringAmplitudes(E_res, V0, L)
    expect(rRe*rRe + rIm*rIm).toBeCloseTo(0, 6)
  })
})
