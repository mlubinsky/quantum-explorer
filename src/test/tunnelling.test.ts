import { describe, it, expect } from 'vitest'
import {
  transmissionT, reflectionR, wkbT, resonanceEnergies, scatteringPsiSq,
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
  it('equals exp(−2κ̃L) exactly', () => {
    const E = 1, V0 = 5, L = 2
    const kappa = Math.sqrt(2 * (V0 - E))
    expect(wkbT(E, V0, L)).toBeCloseTo(Math.exp(-2 * kappa * L), 10)
  })

  it('WKB approximates exact T, is less than exact T for finite barrier', () => {
    // For moderate κ̃L, WKB underestimates T (ignores pre-factor)
    const E = 1, V0 = 5, L = 2
    const Texact = transmissionT(E, V0, L)
    const Twkb  = wkbT(E, V0, L)
    // Both should be between 0 and 1
    expect(Twkb).toBeGreaterThan(0)
    expect(Twkb).toBeLessThanOrEqual(1)
    // For this case exact T > WKB (prefactor > 1)
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
})
