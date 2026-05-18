import { describe, it, expect } from 'vitest'
import {
  chirpedRePsi,
  chirpedImPsi,
  chirpedDeltaK,
  chirpedFTMag2,
  gaussianDeltaX,
  gaussianDeltaK,
  iswDeltaK,
} from '../physics/fourier'
import { fpMomentumDist } from '../physics/freeParticle'

// Numerical integration via trapezoid rule
function trapz(f: (x: number) => number, a: number, b: number, n = 4000): number {
  const h = (b - a) / n
  let sum = 0.5 * (f(a) + f(b))
  for (let i = 1; i < n; i++) sum += f(a + i * h)
  return sum * h
}

// ── gaussianDeltaX / gaussianDeltaK ──────────────────────────────────────────

describe('gaussianDeltaX', () => {
  it('equals sigma', () => {
    expect(gaussianDeltaX(1.0)).toBeCloseTo(1.0)
    expect(gaussianDeltaX(0.5)).toBeCloseTo(0.5)
    expect(gaussianDeltaX(2.3)).toBeCloseTo(2.3)
  })
})

describe('gaussianDeltaK', () => {
  it('equals 1/(2σ)', () => {
    expect(gaussianDeltaK(1.0)).toBeCloseTo(0.5)
    expect(gaussianDeltaK(0.5)).toBeCloseTo(1.0)
    expect(gaussianDeltaK(2.0)).toBeCloseTo(0.25)
  })

  it('uncertainty product is exactly 1/2', () => {
    for (const sigma of [0.3, 1.0, 2.5]) {
      expect(gaussianDeltaX(sigma) * gaussianDeltaK(sigma)).toBeCloseTo(0.5, 10)
    }
  })
})

// ── iswDeltaK ─────────────────────────────────────────────────────────────────

describe('iswDeltaK', () => {
  it('equals nπ/L', () => {
    expect(iswDeltaK(1, Math.PI)).toBeCloseTo(1.0)   // nπ/L = π/π = 1
    expect(iswDeltaK(2, Math.PI)).toBeCloseTo(2.0)
    expect(iswDeltaK(1, 10)).toBeCloseTo(Math.PI / 10)
    expect(iswDeltaK(3, 10)).toBeCloseTo(3 * Math.PI / 10)
  })
})

// ── chirpedDeltaK ─────────────────────────────────────────────────────────────

describe('chirpedDeltaK', () => {
  it('reduces to 1/(2σ) when β=0', () => {
    expect(chirpedDeltaK(1.0, 0)).toBeCloseTo(0.5)
    expect(chirpedDeltaK(0.5, 0)).toBeCloseTo(1.0)
    expect(chirpedDeltaK(2.0, 0)).toBeCloseTo(0.25)
  })

  it('is greater than 1/(2σ) when β≠0', () => {
    for (const beta of [0.5, 1.0, -1.5]) {
      expect(chirpedDeltaK(1.0, beta)).toBeGreaterThan(0.5)
    }
  })

  it('is symmetric in β (|β| matters)', () => {
    expect(chirpedDeltaK(1.0, 1.0)).toBeCloseTo(chirpedDeltaK(1.0, -1.0))
    expect(chirpedDeltaK(0.8, 0.5)).toBeCloseTo(chirpedDeltaK(0.8, -0.5))
  })

  it('satisfies σ_k = √(1/(4σ²)+β²σ²)', () => {
    const sigma = 1.2, beta = 0.8
    const expected = Math.sqrt(1 / (4 * sigma ** 2) + beta ** 2 * sigma ** 2)
    expect(chirpedDeltaK(sigma, beta)).toBeCloseTo(expected)
  })

  it('uncertainty product Δx·Δk ≥ 1/2 with equality at β=0', () => {
    const sigma = 1.5
    expect(sigma * chirpedDeltaK(sigma, 0)).toBeCloseTo(0.5, 10)
    expect(sigma * chirpedDeltaK(sigma, 1.0)).toBeGreaterThan(0.5)
    expect(sigma * chirpedDeltaK(sigma, -0.8)).toBeGreaterThan(0.5)
  })
})

// ── chirpedFTMag2 ─────────────────────────────────────────────────────────────

describe('chirpedFTMag2', () => {
  it('at β=0 equals fpMomentumDist', () => {
    for (const k of [-2, -0.5, 0, 1, 2.5]) {
      expect(chirpedFTMag2(k, 1.0, 0, 0)).toBeCloseTo(fpMomentumDist(k, 0, 1.0), 8)
    }
  })

  it('peak is at k = k₀', () => {
    const sigma = 1.0, k0 = 1.5, beta = 0.8
    const atPeak = chirpedFTMag2(k0, sigma, k0, beta)
    const offPeak = chirpedFTMag2(k0 + 0.5, sigma, k0, beta)
    expect(atPeak).toBeGreaterThan(offPeak)
  })

  it('is non-negative everywhere', () => {
    for (const k of [-5, -2, 0, 1, 3, 5]) {
      expect(chirpedFTMag2(k, 1.0, 0.5, 0.8)).toBeGreaterThanOrEqual(0)
    }
  })

  it('normalises to 1 (Parseval) at β=0', () => {
    const sigma = 1.2, k0 = 0.5
    const norm = trapz(k => chirpedFTMag2(k, sigma, k0, 0), k0 - 10 * sigma, k0 + 10 * sigma)
    expect(norm).toBeCloseTo(1.0, 3)
  })

  it('normalises to 1 (Parseval) at β=1', () => {
    const sigma = 1.0, k0 = 0, beta = 1.0
    const sigmaK = chirpedDeltaK(sigma, beta)
    const norm = trapz(k => chirpedFTMag2(k, sigma, k0, beta), k0 - 8 * sigmaK, k0 + 8 * sigmaK)
    expect(norm).toBeCloseTo(1.0, 3)
  })

  it('is broader for larger |β|', () => {
    const sigma = 1.0, k0 = 0
    const atPeakNone  = chirpedFTMag2(k0, sigma, k0, 0)
    const atPeakChirp = chirpedFTMag2(k0, sigma, k0, 1.0)
    // Broader = lower peak (same total area)
    expect(atPeakChirp).toBeLessThan(atPeakNone)
  })
})

// ── chirpedRePsi / chirpedImPsi ───────────────────────────────────────────────

describe('chirpedRePsi and chirpedImPsi', () => {
  it('Re²+Im² equals Gaussian probability envelope', () => {
    const sigma = 1.0, x0 = 0, k0 = 1.0, beta = 0.8
    const xs = [-2, -1, 0, 1, 2]
    for (const x of xs) {
      const re = chirpedRePsi(x, x0, sigma, k0, beta)
      const im = chirpedImPsi(x, x0, sigma, k0, beta)
      const prob2 = re * re + im * im
      const envelope = Math.pow(2 * Math.PI * sigma * sigma, -0.5) * Math.exp(-((x - x0) ** 2) / (2 * sigma ** 2))
      expect(prob2).toBeCloseTo(envelope, 8)
    }
  })

  it('probability ∫(Re²+Im²) dx normalises to 1', () => {
    const sigma = 1.0, x0 = 0, k0 = 0.5, beta = 1.2
    const norm = trapz(
      x => chirpedRePsi(x, x0, sigma, k0, beta) ** 2 + chirpedImPsi(x, x0, sigma, k0, beta) ** 2,
      x0 - 8 * sigma, x0 + 8 * sigma
    )
    expect(norm).toBeCloseTo(1.0, 3)
  })

  it('at β=0 and k0=0: Im(ψ)=0 at every point (real wavefunction)', () => {
    const sigma = 1.0, x0 = 0
    for (const x of [-2, -1, 0, 1, 2]) {
      expect(chirpedImPsi(x, x0, sigma, 0, 0)).toBeCloseTo(0, 10)
    }
  })

  it('at β=0 matches free-particle ψ at t=0 (envelope × cos(k₀x))', () => {
    const sigma = 1.0, x0 = 2, k0 = 1.5
    const xs = [0, 1, 2, 3, 4]
    for (const x of xs) {
      const envelope = Math.pow(2 * Math.PI * sigma * sigma, -0.25) * Math.exp(-((x - x0) ** 2) / (4 * sigma ** 2))
      expect(chirpedRePsi(x, x0, sigma, k0, 0)).toBeCloseTo(envelope * Math.cos(k0 * x), 8)
      expect(chirpedImPsi(x, x0, sigma, k0, 0)).toBeCloseTo(envelope * Math.sin(k0 * x), 8)
    }
  })
})
