import { describe, it, expect } from 'vitest'
import {
  ringEnergy,
  groundStateN,
  isDegenerateGS,
  degenerateGSPair,
  persistentCurrent,
  ringWavefunctionRe,
  ringWavefunctionIm,
  ringPacket,
  ringPacketCoeffs,
} from '../physics/ring'

const TWO_PI = 2 * Math.PI

// Trapezoidal norm ∫₀^{2π} f(θ) dθ
function integrateTwoPi(f: (theta: number) => number, N = 2000): number {
  const dth = TWO_PI / N
  let s = 0
  for (let i = 0; i < N; i++) s += f(i * dth)
  return s * dth
}

// ── ringEnergy ─────────────────────────────────────────────────────────────

describe('ringEnergy', () => {
  it('E_0(φ=0, R=1) = 0', () => {
    expect(ringEnergy(0, 0, 1)).toBeCloseTo(0, 12)
  })
  it('E_1(φ=0, R=1) = 0.5', () => {
    expect(ringEnergy(1, 0, 1)).toBeCloseTo(0.5, 12)
  })
  it('E_{-1}(φ=0, R=1) = 0.5  (symmetric about n=0)', () => {
    expect(ringEnergy(-1, 0, 1)).toBeCloseTo(0.5, 12)
  })
  it('E_1(φ=1, R=1) = 0  (n=1 is ground state at φ=1)', () => {
    expect(ringEnergy(1, 1, 1)).toBeCloseTo(0, 12)
  })
  it('Level crossing at φ=0.5: E_0 = E_1', () => {
    expect(ringEnergy(0, 0.5, 1)).toBeCloseTo(ringEnergy(1, 0.5, 1), 12)
  })
  it('Scales as 1/R²: E_1(φ=0, R=2) = 0.5/4 = 0.125', () => {
    expect(ringEnergy(1, 0, 2)).toBeCloseTo(0.125, 12)
  })
  it('Periodicity: E_n(φ+1, R) = E_{n-1}(φ, R)', () => {
    expect(ringEnergy(2, 0.3 + 1, 1)).toBeCloseTo(ringEnergy(1, 0.3, 1), 10)
    expect(ringEnergy(0, 0.7 + 1, 1)).toBeCloseTo(ringEnergy(-1, 0.7, 1), 10)
  })
  it('E_n ≥ 0 for all n, φ', () => {
    for (let n = -4; n <= 4; n++) {
      for (const phi of [-0.9, -0.5, -0.1, 0, 0.3, 0.5, 0.7, 1, 1.5, 2]) {
        expect(ringEnergy(n, phi, 1)).toBeGreaterThanOrEqual(0)
      }
    }
  })
  it('E_n(φ, R) = (n-φ)²/(2R²)', () => {
    expect(ringEnergy(3, 0.7, 1.5)).toBeCloseTo((3 - 0.7) ** 2 / (2 * 1.5 ** 2), 12)
  })
})

// ── groundStateN ───────────────────────────────────────────────────────────

describe('groundStateN', () => {
  it('φ=0    → n*=0', () => { expect(groundStateN(0)).toBe(0) })
  it('φ=0.4  → n*=0  (closer to 0 than 1)', () => { expect(groundStateN(0.4)).toBe(0) })
  it('φ=0.6  → n*=1  (closer to 1)', () => { expect(groundStateN(0.6)).toBe(1) })
  it('φ=-0.4 → n*=0', () => { expect(groundStateN(-0.4)).toBe(0) })
  it('φ=-0.6 → n*=-1', () => { expect(groundStateN(-0.6)).toBe(-1) })
  it('φ=1.0  → n*=1', () => { expect(groundStateN(1.0)).toBe(1) })
  it('φ=2.3  → n*=2', () => { expect(groundStateN(2.3)).toBe(2) })
  it('Ground state minimises E_n', () => {
    for (const phi of [0.1, 0.7, 1.2, -0.3, 2.8]) {
      const ngs = groundStateN(phi)
      const Egs = ringEnergy(ngs, phi, 1)
      for (let n = -5; n <= 5; n++) {
        expect(ringEnergy(n, phi, 1)).toBeGreaterThanOrEqual(Egs - 1e-12)
      }
    }
  })
})

// ── isDegenerateGS / degenerateGSPair ─────────────────────────────────────

describe('isDegenerateGS', () => {
  it('false away from crossings', () => {
    for (const phi of [0, 0.3, 0.7, 1.0, 1.3, -0.4]) {
      expect(isDegenerateGS(phi)).toBe(false)
    }
  })
  it('true at exact half-integers', () => {
    for (const phi of [0.5, 1.5, -0.5, 2.5]) {
      expect(isDegenerateGS(phi)).toBe(true)
    }
  })
  it('true within default eps=0.005', () => {
    expect(isDegenerateGS(0.503)).toBe(true)
    expect(isDegenerateGS(0.497)).toBe(true)
  })
  it('false just outside eps', () => {
    expect(isDegenerateGS(0.51)).toBe(false)
    expect(isDegenerateGS(0.49)).toBe(false)
  })
})

describe('degenerateGSPair', () => {
  it('φ=0.5: pair is [0, 1]', () => {
    expect(degenerateGSPair(0.5)).toEqual([0, 1])
  })
  it('φ=1.5: pair is [1, 2]', () => {
    expect(degenerateGSPair(1.5)).toEqual([1, 2])
  })
  it('φ=-0.5: pair is [-1, 0]', () => {
    expect(degenerateGSPair(-0.5)).toEqual([-1, 0])
  })
  it('both n in pair have equal energy', () => {
    for (const phi of [0.5, 1.5, -0.5, 2.5]) {
      const [n1, n2] = degenerateGSPair(phi)
      expect(ringEnergy(n1, phi, 1)).toBeCloseTo(ringEnergy(n2, phi, 1), 12)
    }
  })
  it('both n in pair are true ground states (no lower energy state)', () => {
    const phi = 0.5
    const [n1, n2] = degenerateGSPair(phi)
    const Egs = ringEnergy(n1, phi, 1)
    for (let n = -5; n <= 5; n++) {
      expect(ringEnergy(n, phi, 1)).toBeGreaterThanOrEqual(Egs - 1e-12)
    }
    expect(ringEnergy(n2, phi, 1)).toBeCloseTo(Egs, 12)
  })
})

// ── persistentCurrent ─────────────────────────────────────────────────────

describe('persistentCurrent', () => {
  it('I_0(φ=0, R=1) = 0', () => {
    expect(persistentCurrent(0, 0, 1)).toBeCloseTo(0, 12)
  })
  it('I_1(φ=0, R=1) = 1/(2π)', () => {
    // I = (n − φ)/(2πR²) = 1/(2π) ≈ 0.15915
    expect(persistentCurrent(1, 0, 1)).toBeCloseTo(1 / (2 * Math.PI), 10)
  })
  it('I_0(φ=0.5) = −1/(4π),  I_1(φ=0.5) = +1/(4π)', () => {
    expect(persistentCurrent(0, 0.5, 1)).toBeCloseTo(-0.5 / (2 * Math.PI), 10)
    expect(persistentCurrent(1, 0.5, 1)).toBeCloseTo( 0.5 / (2 * Math.PI), 10)
  })
  it('Scales as 1/R²: I_1(φ=0, R=2) = 1/(8π)', () => {
    expect(persistentCurrent(1, 0, 2)).toBeCloseTo(1 / (8 * Math.PI), 10)
  })
  it('I_n = −(1/Φ₀)·dE_n/dφ — physical current via Φ-derivative', () => {
    const dPhi = 1e-6
    const Phi0 = 2 * Math.PI
    for (const [n, phi] of [[2, 0.3], [0, 0.8], [-1, 1.2]]) {
      const dEdPhi = (ringEnergy(n, phi + dPhi, 1) - ringEnergy(n, phi - dPhi, 1)) / (2 * dPhi)
      expect(persistentCurrent(n as number, phi as number, 1)).toBeCloseTo(-dEdPhi / Phi0, 6)
    }
  })
})

// ── Wavefunction on ring ────────────────────────────────────────────────────

describe('ringWavefunctionRe / Im', () => {
  it('Norm: ∫|ψ_n(θ)|² dθ = 1 for n = 0,1,2,3', () => {
    for (const n of [0, 1, 2, 3]) {
      const norm = integrateTwoPi(theta =>
        ringWavefunctionRe(n, theta) ** 2 + ringWavefunctionIm(n, theta) ** 2)
      expect(norm).toBeCloseTo(1, 4)
    }
  })
  it('Re(ψ_0(θ)) = 1/√(2π) constant', () => {
    const expected = 1 / Math.sqrt(TWO_PI)
    expect(ringWavefunctionRe(0, 0)).toBeCloseTo(expected, 10)
    expect(ringWavefunctionRe(0, 1)).toBeCloseTo(expected, 10)
    expect(ringWavefunctionRe(0, Math.PI)).toBeCloseTo(expected, 10)
  })
  it('Im(ψ_0(θ)) = 0', () => {
    expect(ringWavefunctionIm(0, 0)).toBeCloseTo(0, 10)
    expect(ringWavefunctionIm(0, Math.PI)).toBeCloseTo(0, 10)
  })
  it('Re(ψ_1(0)) = 1/√(2π)', () => {
    expect(ringWavefunctionRe(1, 0)).toBeCloseTo(1 / Math.sqrt(TWO_PI), 10)
  })
  it('Re(ψ_1(π)) = -1/√(2π)', () => {
    expect(ringWavefunctionRe(1, Math.PI)).toBeCloseTo(-1 / Math.sqrt(TWO_PI), 10)
  })
  it('Im(ψ_1(π/2)) = 1/√(2π)', () => {
    expect(ringWavefunctionIm(1, Math.PI / 2)).toBeCloseTo(1 / Math.sqrt(TWO_PI), 10)
  })
})

// ── Wavepacket on ring ─────────────────────────────────────────────────────

describe('ringPacketCoeffs', () => {
  it('Coefficients are real and non-negative', () => {
    const coeffs = ringPacketCoeffs(0, 1.5, 5)
    expect(coeffs.every(c => c >= 0)).toBe(true)
  })
  it('Normalised: Σ|c_n|² = 1', () => {
    const coeffs = ringPacketCoeffs(0, 1.5, 5)
    const norm = coeffs.reduce((s, c) => s + c * c, 0)
    expect(norm).toBeCloseTo(1, 6)
  })
})

describe('ringPacket', () => {
  it('Probability density integrates to 1 at t=0', () => {
    const coeffs = ringPacketCoeffs(0, 1.5, 5)
    const norm = integrateTwoPi(theta => ringPacket(theta, 0, coeffs, 0, 1) ** 2)
    expect(norm).toBeCloseTo(1, 3)
  })
  it('Probability density integrates to 1 at t=T_rev/4', () => {
    const R = 1, Trev = 4 * Math.PI * R * R
    const coeffs = ringPacketCoeffs(0, 1.5, 5)
    const norm = integrateTwoPi(theta => ringPacket(theta, Trev / 4, coeffs, 0, R) ** 2)
    expect(norm).toBeCloseTo(1, 3)
  })
})
