import { describe, it, expect } from 'vitest'
import {
  kpP,
  kpRHS,
  kpAllowed,
  kpBlochKa,
  kpZoneBoundaries,
} from '../physics/kronigPenney'

// Convenience: E at ka = nπ for lattice constant a
function eAtNPi(n: number, a: number): number {
  return (n * Math.PI / a) ** 2 / 2
}

describe('kpP', () => {
  it('P = α × a', () => {
    expect(kpP(1, 4)).toBeCloseTo(4, 10)
    expect(kpP(1.5, 4)).toBeCloseTo(6, 10)
    expect(kpP(2, 3)).toBeCloseTo(6, 10)
  })
  it('P = 0 when α = 0', () => {
    expect(kpP(0, 5)).toBeCloseTo(0, 10)
  })
  it('P = 0 when a = 0', () => {
    expect(kpP(3, 0)).toBeCloseTo(0, 10)
  })
})

describe('kpRHS', () => {
  it('E = 0 → 1 + P (L\'Hôpital limit)', () => {
    expect(kpRHS(0, 3, 4)).toBeCloseTo(4,  8)   // 1 + 3
    expect(kpRHS(0, 0, 4)).toBeCloseTo(1,  8)   // 1 + 0  (free particle limit)
    expect(kpRHS(0, 5, 2)).toBeCloseTo(6,  8)   // 1 + 5
  })

  it('P = 0 → cos(ka) (free particle, no barriers)', () => {
    const a = 4
    // Choose E so ka = π/2: k = π/8 → E = k²/2 = π²/128
    const E = (Math.PI / 8) ** 2 / 2
    expect(kpRHS(E, 0, a)).toBeCloseTo(Math.cos(Math.PI / 2), 8)  // = 0

    // ka = π/3: k = π/12 → E = π²/288
    const E2 = (Math.PI / 12) ** 2 / 2
    expect(kpRHS(E2, 0, a)).toBeCloseTo(Math.cos(Math.PI / 3), 8) // = 0.5
  })

  it('ka = nπ → (−1)^n (sin(nπ) = 0 regardless of P)', () => {
    const a = 4
    // n = 1: ka = π → E = π²/32
    expect(kpRHS(eAtNPi(1, a), 3, a)).toBeCloseTo(-1, 8)
    // n = 2: ka = 2π → E = π²/8
    expect(kpRHS(eAtNPi(2, a), 3, a)).toBeCloseTo( 1, 8)
    // n = 3: ka = 3π → E = 9π²/32
    expect(kpRHS(eAtNPi(3, a), 3, a)).toBeCloseTo(-1, 8)
    // n = 4: ka = 4π → E = π²/2
    expect(kpRHS(eAtNPi(4, a), 3, a)).toBeCloseTo( 1, 8)
  })

  it('exact formula: f = cos(ka) + P·sin(ka)/(ka) at general E', () => {
    // ka = π/2, P = 2, a = 2: k = π/4, E = π²/32
    //   f = cos(π/2) + 2·sin(π/2)/(π/2) = 0 + 2·1/(π/2) = 4/π
    const a = 2, P = 2
    const E = (Math.PI / 4) ** 2 / 2   // k = π/4, ka = π/2
    expect(kpRHS(E, P, a)).toBeCloseTo(4 / Math.PI, 8)
  })

  it('ka = nπ result is independent of P', () => {
    const a = 3
    for (const P of [0, 1, 3, 8]) {
      expect(kpRHS(eAtNPi(1, a), P, a)).toBeCloseTo(-1, 7)
      expect(kpRHS(eAtNPi(2, a), P, a)).toBeCloseTo( 1, 7)
    }
  })
})

describe('kpAllowed', () => {
  it('P = 0 (free particle): always allowed for any E ≥ 0', () => {
    for (const E of [0, 0.1, 1, 5, 10]) {
      expect(kpAllowed(E, 0, 4)).toBe(true)
    }
  })

  it('E = 0, P > 0: forbidden (RHS = 1 + P > 1)', () => {
    expect(kpAllowed(0, 1,   4)).toBe(false)
    expect(kpAllowed(0, 3,   4)).toBe(false)
    expect(kpAllowed(0, 0.1, 4)).toBe(false)
  })

  it('at ka = nπ (RHS = ±1): on the boundary → allowed', () => {
    const a = 4
    expect(kpAllowed(eAtNPi(1, a), 3, a)).toBe(true)  // RHS = -1
    expect(kpAllowed(eAtNPi(2, a), 3, a)).toBe(true)  // RHS = +1
    expect(kpAllowed(eAtNPi(3, a), 5, a)).toBe(true)  // RHS = -1
  })

  it('known forbidden region: E small, P large', () => {
    // P = 5, a = 4. At E ≈ 0.05: ka ≈ 4·√0.1 ≈ 1.265
    // f = cos(1.265) + 5·sin(1.265)/1.265 ≈ 0.298 + 5·0.952/1.265 ≈ 0.298 + 3.76 ≈ 4.06 > 1
    expect(kpAllowed(0.05, 5, 4)).toBe(false)
  })

  it('known allowed region: ka deep in first band', () => {
    // At ka = π (zone boundary), RHS = -1 → allowed
    expect(kpAllowed(eAtNPi(1, 4), 3, 4)).toBe(true)

    // At ka = 2π (zone center of second band), RHS = +1 → allowed
    expect(kpAllowed(eAtNPi(2, 4), 3, 4)).toBe(true)
  })
})

describe('kpBlochKa', () => {
  it('returns NaN in a forbidden gap (|RHS| > 1)', () => {
    // E = 0, P = 3: RHS = 4 > 1 → NaN
    expect(kpBlochKa(0, 3, 4)).toBeNaN()
  })

  it('returns 0 when RHS = +1 (zone centre Ka = 0)', () => {
    // At ka = 2π: RHS = 1, Ka = acos(1) = 0
    expect(kpBlochKa(eAtNPi(2, 4), 3, 4)).toBeCloseTo(0, 6)
  })

  it('returns π when RHS = −1 (zone boundary Ka = π)', () => {
    // At ka = π: RHS = -1, Ka = acos(-1) = π
    expect(kpBlochKa(eAtNPi(1, 4), 3, 4)).toBeCloseTo(Math.PI, 6)
  })

  it('returns Ka ∈ [0, π] for all allowed energies', () => {
    // Limit to n=1..8: rounding error in (nπ/a)²/2 → sqrt → nπ grows with n
    const a = 4, P = 3
    for (let i = 1; i <= 8; i++) {
      const E = eAtNPi(i, a)
      const Ka = kpBlochKa(E, P, a)
      expect(isNaN(Ka)).toBe(false)
      expect(Ka).toBeGreaterThanOrEqual(0)
      expect(Ka).toBeLessThanOrEqual(Math.PI + 1e-10)
    }
  })

  it('P = 0: Ka = ka for all E (free particle, Ka = ka mod 2π folded)', () => {
    // For P = 0: RHS = cos(ka), so Ka = acos(cos(ka)) = ka (for ka ∈ [0,π])
    const a = 4, P = 0
    // Choose E so ka = π/3: k = π/12, E = π²/288
    const E = (Math.PI / 12) ** 2 / 2
    const ka = a * Math.sqrt(2 * E)          // = π/3
    const Ka = kpBlochKa(E, P, a)
    expect(Ka).toBeCloseTo(ka, 8)             // Ka = ka since ka ∈ [0, π]
  })
})

describe('kpZoneBoundaries', () => {
  it('first boundary: E₁ = (π/a)²/2', () => {
    expect(kpZoneBoundaries(4, 1)[0]).toBeCloseTo((Math.PI / 4) ** 2 / 2, 10)
    expect(kpZoneBoundaries(2, 1)[0]).toBeCloseTo((Math.PI / 2) ** 2 / 2, 10)
    expect(kpZoneBoundaries(1, 1)[0]).toBeCloseTo(Math.PI ** 2 / 2,       10)
  })

  it('second boundary: E₂ = (2π/a)²/2 = 4·E₁', () => {
    const E1 = kpZoneBoundaries(4, 2)[0]
    const E2 = kpZoneBoundaries(4, 2)[1]
    expect(E2).toBeCloseTo(4 * E1, 10)
  })

  it('general: Eₙ = (nπ/a)²/2 = n²·E₁', () => {
    const bounds = kpZoneBoundaries(3, 5)
    const E1 = bounds[0]
    for (let n = 1; n <= 5; n++) {
      expect(bounds[n - 1]).toBeCloseTo(n * n * E1, 8)
    }
  })

  it('returns exactly nMax values', () => {
    expect(kpZoneBoundaries(4, 3)).toHaveLength(3)
    expect(kpZoneBoundaries(4, 6)).toHaveLength(6)
  })

  it('monotonically increasing', () => {
    const bounds = kpZoneBoundaries(4, 5)
    for (let i = 1; i < bounds.length; i++) {
      expect(bounds[i]).toBeGreaterThan(bounds[i - 1])
    }
  })

  it('kpRHS at each zone boundary = ±1 for any P', () => {
    const a = 4, nMax = 4
    const bounds = kpZoneBoundaries(a, nMax)
    for (const P of [0, 2, 5]) {
      for (let n = 0; n < nMax; n++) {
        expect(Math.abs(kpRHS(bounds[n], P, a))).toBeCloseTo(1, 7)
      }
    }
  })
})
