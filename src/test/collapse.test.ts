import { describe, it, expect } from 'vitest'
import {
  sampleGaussian,
  bornProbDensityX,
  bornProbDensityK,
  collapsePosition,
  collapseMomentum,
} from '../physics/collapse'

const EPS = 1e-10
const close = (a: number, b: number, e = EPS) => Math.abs(a - b) < e

// ── sampleGaussian ────────────────────────────────────────────────────────────

describe('sampleGaussian', () => {
  it('returns a finite number', () => {
    const x = sampleGaussian(0, 1)
    expect(isFinite(x)).toBe(true)
  })

  it('with deterministic rand=0.5 produces finite value', () => {
    // Box-Muller: u1 = u2 = 0.5, so R = √(−2 ln 0.5) = √(2 ln 2), θ = 2π·0.5 = π
    // z = R·cos(π) = −R = −√(2 ln 2) ≈ −1.1774
    const x = sampleGaussian(0, 1, () => 0.5)
    expect(isFinite(x)).toBe(true)
    expect(close(x, -Math.sqrt(2 * Math.log(2)), 1e-9)).toBe(true)
  })

  it('shift by mean', () => {
    const x = sampleGaussian(5, 1, () => 0.5)
    const base = sampleGaussian(0, 1, () => 0.5)
    expect(close(x, base + 5, 1e-9)).toBe(true)
  })

  it('scaled by sigma', () => {
    const x2 = sampleGaussian(0, 2, () => 0.5)
    const x1 = sampleGaussian(0, 1, () => 0.5)
    expect(close(x2, 2 * x1, 1e-9)).toBe(true)
  })

  it('statistical mean within 0.05 over 10 000 samples', () => {
    let sum = 0
    const N = 10_000
    for (let i = 0; i < N; i++) sum += sampleGaussian(3, 1)
    expect(Math.abs(sum / N - 3)).toBeLessThan(0.05)
  })

  it('statistical std within 0.05 over 10 000 samples', () => {
    const N = 10_000
    const mean = 0
    const sigma = 2
    let sumSq = 0
    for (let i = 0; i < N; i++) {
      const x = sampleGaussian(mean, sigma)
      sumSq += (x - mean) ** 2
    }
    const std = Math.sqrt(sumSq / N)
    expect(Math.abs(std - sigma)).toBeLessThan(0.05)
  })
})

// ── bornProbDensityX ──────────────────────────────────────────────────────────

describe('bornProbDensityX', () => {
  it('peak equals 1/(sigma·√2π)', () => {
    const sigma = 1.5
    const mean  = 2.0
    const peak  = bornProbDensityX(mean, mean, sigma)
    expect(close(peak, 1 / (sigma * Math.sqrt(2 * Math.PI)), 1e-10)).toBe(true)
  })

  it('is symmetric around mean', () => {
    const mean = 3.0
    const sigma = 0.8
    const left  = bornProbDensityX(mean - 1, mean, sigma)
    const right = bornProbDensityX(mean + 1, mean, sigma)
    expect(close(left, right, 1e-12)).toBe(true)
  })

  it('decays away from mean', () => {
    const mean = 0; const sigma = 1
    expect(bornProbDensityX(0, mean, sigma)).toBeGreaterThan(bornProbDensityX(1, mean, sigma))
    expect(bornProbDensityX(1, mean, sigma)).toBeGreaterThan(bornProbDensityX(2, mean, sigma))
  })

  it('is always positive', () => {
    for (const x of [-5, -1, 0, 1, 3]) {
      expect(bornProbDensityX(x, 0, 1)).toBeGreaterThan(0)
    }
  })

  it('integrates to ~1 numerically (trapezoidal)', () => {
    const sigma = 0.8; const mean = 1.0
    const N = 2000; const L = 10 * sigma
    const dx = 2 * L / N
    let s = 0
    for (let i = 0; i <= N; i++) {
      const x = mean - L + i * dx
      const w = i === 0 || i === N ? 0.5 : 1
      s += w * bornProbDensityX(x, mean, sigma) * dx
    }
    expect(Math.abs(s - 1)).toBeLessThan(0.001)
  })
})

// ── bornProbDensityK ──────────────────────────────────────────────────────────

describe('bornProbDensityK', () => {
  it('peak equals 1/(sigmaK·√2π)', () => {
    const sigmaK = 0.5; const k0 = 1.0
    const peak = bornProbDensityK(k0, k0, sigmaK)
    expect(close(peak, 1 / (sigmaK * Math.sqrt(2 * Math.PI)), 1e-10)).toBe(true)
  })

  it('is symmetric around k0', () => {
    const k0 = 2; const sigmaK = 0.4
    expect(close(
      bornProbDensityK(k0 - 0.5, k0, sigmaK),
      bornProbDensityK(k0 + 0.5, k0, sigmaK),
      1e-12,
    )).toBe(true)
  })

  it('integrates to ~1 numerically', () => {
    const sigmaK = 0.6; const k0 = 0
    const N = 2000; const L = 10 * sigmaK
    const dk = 2 * L / N
    let s = 0
    for (let i = 0; i <= N; i++) {
      const k = k0 - L + i * dk
      const w = i === 0 || i === N ? 0.5 : 1
      s += w * bornProbDensityK(k, k0, sigmaK) * dk
    }
    expect(Math.abs(s - 1)).toBeLessThan(0.001)
  })
})

// ── collapsePosition ──────────────────────────────────────────────────────────

describe('collapsePosition', () => {
  it('x0 = xMeas', () => {
    const { x0 } = collapsePosition(2.5, 1.0, 0.3)
    expect(close(x0, 2.5)).toBe(true)
  })

  it('k0 unchanged', () => {
    const { k0 } = collapsePosition(0, 1.5, 0.3)
    expect(close(k0, 1.5)).toBe(true)
  })

  it('sigma0 = sigmaDet', () => {
    const { sigma0 } = collapsePosition(0, 0, 0.4)
    expect(close(sigma0, 0.4)).toBe(true)
  })

  it('preserves sign of k0', () => {
    expect(close(collapsePosition(0, -2, 0.3).k0, -2)).toBe(true)
  })

  it('various sigma_det values', () => {
    for (const sd of [0.1, 0.5, 1.0, 2.0]) {
      expect(close(collapsePosition(0, 0, sd).sigma0, sd)).toBe(true)
    }
  })
})

// ── collapseMomentum ──────────────────────────────────────────────────────────

describe('collapseMomentum', () => {
  it('x0 = xAtMeas', () => {
    const { x0 } = collapseMomentum(3.0, 1.0, 0.5)
    expect(close(x0, 3.0)).toBe(true)
  })

  it('k0 = kMeas', () => {
    const { k0 } = collapseMomentum(0, 2.3, 0.5)
    expect(close(k0, 2.3)).toBe(true)
  })

  it('sigma0 = 1/(2·sigmaK)', () => {
    const sigmaK = 0.5
    const { sigma0 } = collapseMomentum(0, 0, sigmaK)
    expect(close(sigma0, 1 / (2 * sigmaK), 1e-10)).toBe(true)
  })

  it('sharp momentum → wide position', () => {
    // small sigmaK → large sigma0
    const { sigma0: s1 } = collapseMomentum(0, 0, 0.1)
    const { sigma0: s2 } = collapseMomentum(0, 0, 1.0)
    expect(s1).toBeGreaterThan(s2)
  })

  it('HUP: sigma0 · sigmaK = 0.5 (minimum uncertainty)', () => {
    for (const sigmaK of [0.2, 0.5, 1.0, 2.0]) {
      const { sigma0 } = collapseMomentum(0, 0, sigmaK)
      expect(close(sigma0 * sigmaK, 0.5, 1e-10)).toBe(true)
    }
  })

  it('preserves sign of kMeas', () => {
    expect(close(collapseMomentum(0, -1.5, 0.5).k0, -1.5)).toBe(true)
  })
})

// ── HUP on position collapse ──────────────────────────────────────────────────

describe('HUP after position collapse', () => {
  it('sigma0 · Δp ≥ 0.5 for various sigma_det', () => {
    // After position collapse: σ₀_new = σ_det, Δp = 1/(2σ_det) → product = 0.5
    for (const sd of [0.1, 0.3, 0.5, 1.0, 1.5, 2.0]) {
      const { sigma0 } = collapsePosition(0, 0, sd)
      const deltaP = 1 / (2 * sd)   // Δp for a Gaussian with σ₀ = σ_det
      expect(sigma0 * deltaP).toBeGreaterThanOrEqual(0.5 - 1e-10)
    }
  })
})
