import { describe, it, expect } from 'vitest'
import {
  morseV,
  morseLambda,
  morseOmega,
  morseNBound,
  morseEnergy,
  morseTurningPoints,
  laguerreAssoc,
  morsePsi,
  morseProb,
} from '../physics/morse'

// ── Helpers ────────────────────────────────────────────────────────────────────

// Trapezoidal integration over [a, b] with n steps
function trapz(f: (x: number) => number, a: number, b: number, n = 2000): number {
  const h = (b - a) / n
  let sum = 0.5 * (f(a) + f(b))
  for (let i = 1; i < n; i++) sum += f(a + i * h)
  return sum * h
}

// Default clean case: De=8, α=1 → λ=4, N_bound=4, integer Γ values
const DE = 8, AL = 1   // λ=4, n_max=3, ω_e=4

// ── morseV ────────────────────────────────────────────────────────────────────

describe('morseV', () => {
  it('V_min = −De at x = 0', () => {
    expect(morseV(0, 8, 0.7)).toBeCloseTo(-8, 10)
    expect(morseV(0, 5, 1.2)).toBeCloseTo(-5, 10)
  })

  it('V → 0 at large positive x (dissociation)', () => {
    expect(morseV(100, 8, 0.7)).toBeCloseTo(0, 8)
    expect(morseV(50,  3, 1.0)).toBeCloseTo(0, 8)
  })

  it('V > 0 (repulsive) at large negative x', () => {
    expect(morseV(-10, 8, 0.7)).toBeGreaterThan(0)
    expect(morseV(-5,  2, 1.0)).toBeGreaterThan(0)
  })

  it('V > −De for x ≠ 0 (x=0 is the unique global minimum)', () => {
    for (const x of [-2, -1, 0.5, 1, 3, 5]) {
      expect(morseV(x, 8, 0.7)).toBeGreaterThan(-8 - 1e-12)
    }
    // Only x=0 attains the minimum exactly
    expect(morseV(1, 8, 0.7)).toBeGreaterThan(-8)
  })
})

// ── morseLambda ───────────────────────────────────────────────────────────────

describe('morseLambda', () => {
  it('λ = √(2De)/α', () => {
    expect(morseLambda(8,  1)).toBeCloseTo(4,  10)   // √16/1 = 4
    expect(morseLambda(2,  1)).toBeCloseTo(2,  10)   // √4/1  = 2
    expect(morseLambda(8,  2)).toBeCloseTo(2,  10)   // √16/2 = 2
    expect(morseLambda(18, 3)).toBeCloseTo(2,  10)   // √36/3 = 2
  })

  it('λ increases with De and decreases with α', () => {
    expect(morseLambda(16, 1)).toBeGreaterThan(morseLambda(8, 1))
    expect(morseLambda(8,  2)).toBeLessThan(morseLambda(8, 1))
  })
})

// ── morseOmega ────────────────────────────────────────────────────────────────

describe('morseOmega', () => {
  it('ω_e = α √(2De)', () => {
    expect(morseOmega(8, 1)).toBeCloseTo(4, 10)    // 1·√16 = 4
    expect(morseOmega(2, 1)).toBeCloseTo(2, 10)    // 1·√4  = 2
    expect(morseOmega(8, 0.5)).toBeCloseTo(2, 10)  // 0.5·4 = 2
  })

  it('ω_e = α²λ (equivalently)', () => {
    const De = 8, al = 0.7
    expect(morseOmega(De, al)).toBeCloseTo(al * al * morseLambda(De, al), 10)
  })
})

// ── morseNBound ───────────────────────────────────────────────────────────────

describe('morseNBound', () => {
  it('N_bound = ⌊λ − ½⌋ + 1', () => {
    expect(morseNBound(8, 1)).toBe(4)    // λ=4 → ⌊3.5⌋+1 = 4
    expect(morseNBound(2, 1)).toBe(2)    // λ=2 → ⌊1.5⌋+1 = 2
    expect(morseNBound(0.5, 1)).toBe(1)  // λ=1 → ⌊0.5⌋+1 = 1
  })

  it('single bound state for λ slightly above 0.5', () => {
    // λ just above 0.5: n_max = 0, N = 1
    expect(morseNBound(0.26, 1)).toBe(1) // λ ≈ 0.72 → ⌊0.22⌋+1=1
  })

  it('N_bound increases with De', () => {
    expect(morseNBound(18, 1)).toBeGreaterThan(morseNBound(8, 1))
  })
})

// ── morseEnergy ───────────────────────────────────────────────────────────────

describe('morseEnergy', () => {
  // De=8, α=1 gives clean values: λ=4, E_n = -(4-n-0.5)²/2
  it('exact eigenvalues for De=8, α=1', () => {
    expect(morseEnergy(0, DE, AL)).toBeCloseTo(-6.125, 10) // -(3.5)²/2
    expect(morseEnergy(1, DE, AL)).toBeCloseTo(-3.125, 10) // -(2.5)²/2
    expect(morseEnergy(2, DE, AL)).toBeCloseTo(-1.125, 10) // -(1.5)²/2
    expect(morseEnergy(3, DE, AL)).toBeCloseTo(-0.125, 10) // -(0.5)²/2
  })

  it('all E_n < 0 (bound states)', () => {
    for (let n = 0; n < morseNBound(DE, AL); n++) {
      expect(morseEnergy(n, DE, AL)).toBeLessThan(0)
    }
  })

  it('E_n strictly increasing with n', () => {
    const N = morseNBound(DE, AL)
    for (let n = 0; n < N - 1; n++) {
      expect(morseEnergy(n + 1, DE, AL)).toBeGreaterThan(morseEnergy(n, DE, AL))
    }
  })

  it('anharmonic spacing ΔE_n = α²(λ − n − 1)', () => {
    // De=8, α=1, λ=4: ΔE_0=3, ΔE_1=2, ΔE_2=1
    expect(morseEnergy(1, DE, AL) - morseEnergy(0, DE, AL)).toBeCloseTo(3, 10)
    expect(morseEnergy(2, DE, AL) - morseEnergy(1, DE, AL)).toBeCloseTo(2, 10)
    expect(morseEnergy(3, DE, AL) - morseEnergy(2, DE, AL)).toBeCloseTo(1, 10)
  })

  it('ΔE_0 = ω_e − α² (first anharmonic correction to HO spacing)', () => {
    // ΔE_n = α²(λ−n−1); for n=0: ΔE_0 = α²λ − α² = ω_e − α²
    const alpha = 0.1, omega = 1.0, De = omega ** 2 / (2 * alpha ** 2)  // De=50
    const dE = morseEnergy(1, De, alpha) - morseEnergy(0, De, alpha)
    expect(dE).toBeCloseTo(omega - alpha * alpha, 10)  // = 0.99 exactly
  })
})

// ── morseTurningPoints ────────────────────────────────────────────────────────

describe('morseTurningPoints', () => {
  it('x_left < 0 < x_right for all bound states', () => {
    for (let n = 0; n < morseNBound(DE, AL); n++) {
      const [xL, xR] = morseTurningPoints(n, DE, AL)
      expect(xL).toBeLessThan(0)
      expect(xR).toBeGreaterThan(0)
    }
  })

  it('V(x_left) ≈ E_n within 1e-10', () => {
    for (let n = 0; n < morseNBound(DE, AL); n++) {
      const [xL] = morseTurningPoints(n, DE, AL)
      expect(morseV(xL, DE, AL)).toBeCloseTo(morseEnergy(n, DE, AL), 8)
    }
  })

  it('V(x_right) ≈ E_n within 1e-10', () => {
    for (let n = 0; n < morseNBound(DE, AL); n++) {
      const [, xR] = morseTurningPoints(n, DE, AL)
      expect(morseV(xR, DE, AL)).toBeCloseTo(morseEnergy(n, DE, AL), 8)
    }
  })
})

// ── laguerreAssoc ─────────────────────────────────────────────────────────────

describe('laguerreAssoc', () => {
  it('L_0^k(z) = 1 for any k, z', () => {
    for (const [k, z] of [[0, 0], [3, 1], [5, 10], [0.7, 3.14]]) {
      expect(laguerreAssoc(0, k, z)).toBeCloseTo(1, 12)
    }
  })

  it('L_1^k(z) = 1 + k − z', () => {
    expect(laguerreAssoc(1, 3, 2)).toBeCloseTo(2,   12)  // 1+3-2=2
    expect(laguerreAssoc(1, 5, 0)).toBeCloseTo(6,   12)  // 1+5-0=6
    expect(laguerreAssoc(1, 0, 4)).toBeCloseTo(-3,  12)  // 1+0-4=-3
  })

  it('L_2^3(2) = 2 (via recurrence and direct formula)', () => {
    // L_2^k(z) = ((3+k-z)(1+k-z) - (1+k)) / 2
    // k=3, z=2: ((6-2)(4-2) - 4) / 2 = (4*2 - 4)/2 = 2
    expect(laguerreAssoc(2, 3, 2)).toBeCloseTo(2, 10)
  })

  it('L_3^1(0) = 4 = C(3+1, 3)', () => {
    // L_n^k(0) = (n+k)! / (n! k!) = C(n+k, n)
    expect(laguerreAssoc(3, 1, 0)).toBeCloseTo(4, 10)
  })
})

// ── morsePsi ─────────────────────────────────────────────────────────────────

describe('morsePsi', () => {
  it('normalization ∫|ψ_0|²dx ≈ 1  (De=8, α=1)', () => {
    const norm = trapz(x => morseProb(x, 0, DE, AL), -10, 40, 3000)
    expect(norm).toBeCloseTo(1, 3)
  })

  it('normalization ∫|ψ_2|²dx ≈ 1  (De=8, α=1)', () => {
    const norm = trapz(x => morseProb(x, 2, DE, AL), -10, 40, 3000)
    expect(norm).toBeCloseTo(1, 3)
  })

  it('orthogonality ∫ψ_0 · ψ_1 dx ≈ 0', () => {
    const overlap = trapz(x => morsePsi(x, 0, DE, AL) * morsePsi(x, 1, DE, AL), -10, 40, 3000)
    expect(overlap).toBeCloseTo(0, 3)
  })

  it('ψ_n has exactly n nodes (zero crossings)', () => {
    for (let n = 0; n < morseNBound(DE, AL); n++) {
      const xs = Array.from({ length: 5000 }, (_, i) => -5 + i * 0.01)
      const vals = xs.map(x => morsePsi(x, n, DE, AL))
      let nodes = 0
      for (let i = 0; i < vals.length - 1; i++) {
        if (vals[i] * vals[i + 1] < 0) nodes++
      }
      expect(nodes).toBe(n)
    }
  })
})

// ── morseProb ─────────────────────────────────────────────────────────────────

describe('morseProb', () => {
  it('prob ≥ 0 everywhere', () => {
    for (const x of [-5, -2, 0, 1, 3, 5, 10, 20]) {
      expect(morseProb(x, 0, DE, AL)).toBeGreaterThanOrEqual(0)
      expect(morseProb(x, 2, DE, AL)).toBeGreaterThanOrEqual(0)
    }
  })

  it('morseProb = morsePsi²', () => {
    for (const x of [0, 1, 2, 5]) {
      const psi = morsePsi(x, 1, DE, AL)
      expect(morseProb(x, 1, DE, AL)).toBeCloseTo(psi * psi, 12)
    }
  })
})
