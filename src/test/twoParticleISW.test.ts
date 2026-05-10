import { describe, it, expect } from 'vitest'
import {
  isAllowed,
  twoParticlePsi,
  twoParticleDensity,
  twoParticleEnergy,
  singleParticleDensity,
  diagonalDensity,
} from '../physics/twoParticleISW'
import { iswPsi, iswEnergy } from '../physics/isw'

const L = 10

// ── isAllowed ─────────────────────────────────────────────────────────────────

describe('isAllowed', () => {
  it('allows distinguishable m=n', () => expect(isAllowed(2, 2, 'distinguishable')).toBe(true))
  it('allows bosons m=n',         () => expect(isAllowed(3, 3, 'bosons')).toBe(true))
  it('allows fermions m≠n',       () => expect(isAllowed(1, 2, 'fermions')).toBe(true))
  it('forbids fermions m=n',      () => expect(isAllowed(2, 2, 'fermions')).toBe(false))
})

// ── Distinguishable ───────────────────────────────────────────────────────────

describe('twoParticlePsi — distinguishable', () => {
  it('equals ψₘ(x₁)ψₙ(x₂)', () => {
    const [m, n, x1, x2] = [1, 2, 3.0, 7.0]
    expect(twoParticlePsi(m, n, x1, x2, L, 'distinguishable'))
      .toBeCloseTo(iswPsi(m, L, x1) * iswPsi(n, L, x2), 10)
  })

  it('is NOT symmetric under (x₁↔x₂) for m≠n', () => {
    const [m, n, x1, x2] = [1, 2, 2.0, 6.0]
    const p12 = twoParticlePsi(m, n, x1, x2, L, 'distinguishable')
    const p21 = twoParticlePsi(m, n, x2, x1, L, 'distinguishable')
    expect(Math.abs(p12 - p21)).toBeGreaterThan(0.01)
  })
})

// ── Bosons ────────────────────────────────────────────────────────────────────

describe('twoParticlePsi — bosons', () => {
  it('symmetric under swap (m≠n)', () => {
    const [m, n, x1, x2] = [1, 3, 2.0, 7.5]
    expect(twoParticlePsi(m, n, x1, x2, L, 'bosons'))
      .toBeCloseTo(twoParticlePsi(m, n, x2, x1, L, 'bosons'), 10)
  })

  it('m=n equals ψₘ(x₁)ψₘ(x₂)', () => {
    const [m, x1, x2] = [2, 3.0, 6.5]
    expect(twoParticlePsi(m, m, x1, x2, L, 'bosons'))
      .toBeCloseTo(iswPsi(m, L, x1) * iswPsi(m, L, x2), 10)
  })

  it('diagonal enhanced: |ψ_B(x,x)|² = 2ψₘ(x)²ψₙ(x)²', () => {
    const [m, n, x] = [1, 2, 3.5]
    const expected = 2 * iswPsi(m, L, x) ** 2 * iswPsi(n, L, x) ** 2
    expect(diagonalDensity(m, n, x, L, 'bosons')).toBeCloseTo(expected, 10)
  })
})

// ── Fermions ──────────────────────────────────────────────────────────────────

describe('twoParticlePsi — fermions', () => {
  it('antisymmetric under swap (m≠n)', () => {
    const [m, n, x1, x2] = [1, 3, 2.0, 7.5]
    expect(twoParticlePsi(m, n, x1, x2, L, 'fermions'))
      .toBeCloseTo(-twoParticlePsi(m, n, x2, x1, L, 'fermions'), 10)
  })

  it('vanishes on diagonal for all x (Pauli exclusion)', () => {
    const [m, n] = [1, 2]
    for (const x of [1, 2.5, 4, 6, 8.3, 9]) {
      expect(twoParticlePsi(m, n, x, x, L, 'fermions')).toBeCloseTo(0, 10)
    }
  })

  it('m=n returns 0', () => {
    expect(twoParticlePsi(2, 2, 3, 5, L, 'fermions')).toBe(0)
  })
})

// ── Normalisation ─────────────────────────────────────────────────────────────

function integrate2D(
  fn: (x1: number, x2: number) => number,
  L: number, N = 200,
): number {
  const dx = L / N
  let sum = 0
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < N; j++) {
      sum += fn((i + 0.5) * dx, (j + 0.5) * dx) * dx * dx
    }
  }
  return sum
}

describe('normalisation ∫∫|ψ|²=1', () => {
  it('distinguishable m=1 n=2', () => {
    expect(integrate2D((x1, x2) => twoParticleDensity(1, 2, x1, x2, L, 'distinguishable'), L))
      .toBeCloseTo(1, 1)
  })
  it('distinguishable m=2 n=2', () => {
    expect(integrate2D((x1, x2) => twoParticleDensity(2, 2, x1, x2, L, 'distinguishable'), L))
      .toBeCloseTo(1, 1)
  })
  it('bosons m=1 n=2', () => {
    expect(integrate2D((x1, x2) => twoParticleDensity(1, 2, x1, x2, L, 'bosons'), L))
      .toBeCloseTo(1, 1)
  })
  it('bosons m=3 n=3', () => {
    expect(integrate2D((x1, x2) => twoParticleDensity(3, 3, x1, x2, L, 'bosons'), L))
      .toBeCloseTo(1, 1)
  })
  it('fermions m=1 n=2', () => {
    expect(integrate2D((x1, x2) => twoParticleDensity(1, 2, x1, x2, L, 'fermions'), L))
      .toBeCloseTo(1, 1)
  })
  it('fermions m=2 n=4', () => {
    expect(integrate2D((x1, x2) => twoParticleDensity(2, 4, x1, x2, L, 'fermions'), L))
      .toBeCloseTo(1, 1)
  })
})

// ── Single-particle density ───────────────────────────────────────────────────

function integrate1D(fn: (x: number) => number, L: number, N = 400): number {
  const dx = L / N
  let sum = 0
  for (let i = 0; i < N; i++) sum += fn((i + 0.5) * dx) * dx
  return sum
}

describe('singleParticleDensity', () => {
  it('integrates to 1 for all stats (m=1, n=2)', () => {
    for (const stat of ['distinguishable', 'bosons', 'fermions'] as const) {
      const result = integrate1D(x => singleParticleDensity(1, 2, x, L, stat), L)
      expect(result).toBeCloseTo(1, 2)
    }
  })

  it('bosons and fermions have identical marginal (m≠n)', () => {
    for (const x of [1.5, 3.0, 5.5, 8.0]) {
      const rhoB = singleParticleDensity(1, 3, x, L, 'bosons')
      const rhoF = singleParticleDensity(1, 3, x, L, 'fermions')
      expect(rhoB).toBeCloseTo(rhoF, 10)
    }
  })

  it('equals |ψₘ|² for distinguishable', () => {
    for (const x of [2.0, 5.0, 8.0]) {
      expect(singleParticleDensity(1, 2, x, L, 'distinguishable'))
        .toBeCloseTo(iswPsi(1, L, x) ** 2, 10)
    }
  })
})

// ── Diagonal density ──────────────────────────────────────────────────────────

describe('diagonalDensity', () => {
  it('fermions: exactly 0 everywhere', () => {
    for (const x of [1, 2.5, 4, 6, 8.3]) {
      expect(diagonalDensity(1, 2, x, L, 'fermions')).toBeCloseTo(0, 10)
    }
  })

  it('bosons: 2× distinguishable (HBT bunching)', () => {
    for (const x of [2.0, 4.5, 7.0]) {
      const dB = diagonalDensity(1, 2, x, L, 'bosons')
      const dD = diagonalDensity(1, 2, x, L, 'distinguishable')
      expect(dB).toBeCloseTo(2 * dD, 10)
    }
  })
})

// ── Energy ────────────────────────────────────────────────────────────────────

describe('twoParticleEnergy', () => {
  it('E(1,2) = E₁+E₂', () => {
    expect(twoParticleEnergy(1, 2, L)).toBeCloseTo(iswEnergy(1, L) + iswEnergy(2, L), 10)
  })
  it('E(m,n) = E(n,m)', () => {
    expect(twoParticleEnergy(2, 3, L)).toBeCloseTo(twoParticleEnergy(3, 2, L), 10)
  })
})
