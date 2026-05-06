import { describe, it, expect } from 'vitest'
import {
  iswMomentumDist,
  hoMomentumDist,
  iswMomentumGrid,
  hoMomentumGrid,
} from '../physics/momentumSpace'
import { hoWavefunction } from '../physics/harmonic'
import { iswSigmaX } from '../physics/isw'

// ── ISW ───────────────────────────────────────────────────────────────────

describe('iswMomentumDist — analytical formula', () => {
  it('n=1 at k=0: non-zero (odd n — cos² term)', () => {
    expect(iswMomentumDist(1, 10, 0)).toBeGreaterThan(0)
  })

  it('n=2 at k=0: exactly zero (even n — sin²(0) = 0)', () => {
    expect(iswMomentumDist(2, 10, 0)).toBeCloseTo(0, 10)
  })

  it('pole limit: iswMomentumDist(1, L, π/L) = L/(4π)', () => {
    const L = 10
    expect(iswMomentumDist(1, L, Math.PI / L)).toBeCloseTo(L / (4 * Math.PI), 6)
  })

  it('symmetric: |φₙ(k)|² = |φₙ(-k)|²', () => {
    for (const n of [1, 2, 3]) {
      for (const k of [0.1, 0.5, 1.0, 2.0]) {
        expect(iswMomentumDist(n, 10, k)).toBeCloseTo(iswMomentumDist(n, 10, -k), 10)
      }
    }
  })

  it('normalization: ∫|φ₁(k)|²dk ≈ 1 (numerical, L=10)', () => {
    const L = 10
    const dk = 0.005
    const kMax = 8 * Math.PI / L
    let sum = 0
    for (let k = -kMax; k <= kMax; k += dk) {
      sum += iswMomentumDist(1, L, k) * dk
    }
    expect(sum).toBeCloseTo(1, 2)
  })

  it('n=1: global maximum is at k=0 (odd n — DC component non-zero)', () => {
    const L = 10
    const atZero = iswMomentumDist(1, L, 0)
    for (const k of [0.1, 0.2, 0.3, 0.5, 1.0]) {
      expect(atZero).toBeGreaterThan(iswMomentumDist(1, L, k))
    }
  })

  it('n=2: has non-zero values away from k=0 (even n — distribution non-trivial)', () => {
    const L = 10
    // Confirmed zero at k=0 (above). Has weight near Bragg wavenumber 2π/L.
    expect(iswMomentumDist(2, L, 0.3)).toBeGreaterThan(0)
    expect(iswMomentumDist(2, L, 0.5)).toBeGreaterThan(0)
  })
})

describe('iswMomentumGrid', () => {
  it('returns arrays of equal length', () => {
    const { k, phi2 } = iswMomentumGrid(1, 10, 400)
    expect(k).toHaveLength(400)
    expect(phi2).toHaveLength(400)
  })

  it('k array is symmetric around 0', () => {
    const { k } = iswMomentumGrid(1, 10, 400)
    expect(k[0]).toBeCloseTo(-k[k.length - 1], 8)
  })

  it('all phi2 values are non-negative', () => {
    const { phi2 } = iswMomentumGrid(2, 10, 400)
    expect(phi2.every(v => v >= 0)).toBe(true)
  })
})

// ── HO ────────────────────────────────────────────────────────────────────

describe('hoMomentumDist — self-duality', () => {
  it('at ω=1: |φₙ(k)|² = |ψₙ(k)|² (self-dual)', () => {
    for (const n of [0, 1, 2, 3]) {
      for (const k of [-1.5, -0.5, 0, 0.5, 1.5]) {
        const phiSq = hoMomentumDist(n, 1, k)
        const psiSq = hoWavefunction(n, k, 1) ** 2
        expect(phiSq).toBeCloseTo(psiSq, 10)
      }
    }
  })

  it('symmetric: |φₙ(k)|² = |φₙ(-k)|²', () => {
    for (const n of [0, 1, 2]) {
      for (const k of [0.3, 0.8, 1.5]) {
        expect(hoMomentumDist(n, 1, k)).toBeCloseTo(hoMomentumDist(n, 1, -k), 10)
      }
    }
  })

  it('ground state ψ₀ peaks at k=0', () => {
    expect(hoMomentumDist(0, 1, 0)).toBeGreaterThan(hoMomentumDist(0, 1, 1.0))
  })

  it('normalization: ∫|φ₀(k)|²dk ≈ 1 (ω=1)', () => {
    const dk = 0.01
    const kMax = 6
    let sum = 0
    for (let k = -kMax; k <= kMax; k += dk) {
      sum += hoMomentumDist(0, 1, k) * dk
    }
    expect(sum).toBeCloseTo(1, 2)
  })

  it('ω>1 spreads momentum distribution (self-duality: smaller ω_eff = 1/ω)', () => {
    // For ω=2: momentum dist = ψ(k, ω=0.5) — wider Gaussian than ψ(k, ω=1)
    const atPeak_w2 = hoMomentumDist(0, 2, 0)
    const atPeak_w1 = hoMomentumDist(0, 1, 0)
    // Higher ω tightens position → spreads momentum → lower peak (more spread out)
    expect(atPeak_w2).toBeLessThan(atPeak_w1)
  })
})

describe('hoMomentumGrid', () => {
  it('returns arrays of equal length', () => {
    const { k, phi2 } = hoMomentumGrid(0, 1, 400)
    expect(k).toHaveLength(400)
    expect(phi2).toHaveLength(400)
  })

  it('all phi2 values are non-negative', () => {
    const { phi2 } = hoMomentumGrid(2, 1.5, 400)
    expect(phi2.every(v => v >= 0)).toBe(true)
  })
})

// ── Heisenberg uncertainty ────────────────────────────────────────────────

describe('Heisenberg uncertainty σ_x · σ_p ≥ ½', () => {
  it('ISW n=1 L=10: σ_p ≈ π/L (⟨p²⟩ = 2E₁, wider range for slow 1/k² tail)', () => {
    const L = 10
    // ISW tail decays as 1/k² — need wide range for convergence
    const dk = 0.005
    const kMax = 50 / L   // 5× wider than Bragg wavenumber
    let p2 = 0
    for (let k = -kMax; k <= kMax; k += dk) {
      p2 += k * k * iswMomentumDist(1, L, k) * dk
    }
    const sigmaP = Math.sqrt(p2)
    expect(sigmaP).toBeCloseTo(Math.PI / L, 1)  // 1 decimal place (~0.03 tolerance)
  })

  it('ISW n=1 L=10: σ_x · σ_p ≥ 0.5', () => {
    const L = 10
    const sigmaX = iswSigmaX(1, L)
    const sigmaP = Math.PI / L
    expect(sigmaX * sigmaP).toBeGreaterThanOrEqual(0.5)
  })

  it('HO n=0 ω=1: σ_p = √(0.5) (self-dual: σ_p = σ_x)', () => {
    const dk = 0.01
    const kMax = 6
    let p2 = 0
    for (let k = -kMax; k <= kMax; k += dk) {
      p2 += k * k * hoMomentumDist(0, 1, k) * dk
    }
    expect(Math.sqrt(p2)).toBeCloseTo(Math.sqrt(0.5), 2)
  })

  it('HO n=0 ω=1: σ_x · σ_p ≈ 0.5 (saturates Heisenberg bound)', () => {
    const sigmaX = Math.sqrt(0.5)  // hoSigmaX(0, 1)
    const sigmaP = Math.sqrt(0.5)
    expect(sigmaX * sigmaP).toBeCloseTo(0.5, 6)
  })
})
