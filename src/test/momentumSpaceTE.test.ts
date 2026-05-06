import { describe, it, expect } from 'vitest'
import { iswMomentumDist } from '../physics/momentumSpace'
import {
  iswMomentumAmplitude,
  iswMomentumProbTE,
  hoCoherentMomentumProb,
} from '../physics/momentumSpace'
import { iswRevivalPeriod } from '../physics/timeEvolution'

const L = 10

// ── iswMomentumAmplitude ─────────────────────────────────────────────────────

describe('iswMomentumAmplitude', () => {
  it('|amplitude|² matches iswMomentumDist for n=1 at several k values', () => {
    for (const k of [-0.8, 0.3, 0.6, 1.2, 2.5]) {
      const { re, im } = iswMomentumAmplitude(1, L, k)
      const mag2 = re * re + im * im
      expect(mag2).toBeCloseTo(iswMomentumDist(1, L, k), 8)
    }
  })

  it('|amplitude|² matches iswMomentumDist for n=2', () => {
    for (const k of [-1.5, -0.4, 0.9, 1.8]) {
      const { re, im } = iswMomentumAmplitude(2, L, k)
      expect(re * re + im * im).toBeCloseTo(iswMomentumDist(2, L, k), 8)
    }
  })

  it('|amplitude|² matches iswMomentumDist for n=3', () => {
    for (const k of [-0.5, 0.7, 1.1, 2.0]) {
      const { re, im } = iswMomentumAmplitude(3, L, k)
      expect(re * re + im * im).toBeCloseTo(iswMomentumDist(3, L, k), 8)
    }
  })

  it('is real-valued at k=0 for all n (sin is real)', () => {
    for (const n of [1, 2, 3, 4]) {
      const { im } = iswMomentumAmplitude(n, L, 0)
      expect(im).toBeCloseTo(0, 10)
    }
  })
})

// ── iswMomentumProbTE ────────────────────────────────────────────────────────

describe('iswMomentumProbTE', () => {
  it('single eigenstate (c₁=1): time-independent for all t', () => {
    const coeffs = [1, 0, 0, 0, 0, 0, 0, 0]
    const k = 0.5
    const p0 = iswMomentumProbTE(k, 0, coeffs, L)
    expect(iswMomentumProbTE(k, 1.5, coeffs, L)).toBeCloseTo(p0, 8)
    expect(iswMomentumProbTE(k, 4.2, coeffs, L)).toBeCloseTo(p0, 8)
  })

  it('single eigenstate: matches iswMomentumDist', () => {
    const coeffs = [1, 0, 0, 0, 0, 0, 0, 0]
    for (const k of [-1.0, 0.0, 0.5, 1.2]) {
      expect(iswMomentumProbTE(k, 0, coeffs, L)).toBeCloseTo(iswMomentumDist(1, L, k), 8)
    }
  })

  it('norm ≈ 1 for equal 1+2 mix at t=0', () => {
    const c = 1 / Math.SQRT2
    const coeffs = [c, c, 0, 0, 0, 0, 0, 0]
    const kMax = 20 / L
    const N = 2000
    const dk = 2 * kMax / N
    let norm = 0
    for (let i = 0; i <= N; i++) {
      const k = -kMax + i * dk
      const w = (i === 0 || i === N) ? 0.5 : 1
      norm += w * iswMomentumProbTE(k, 0, coeffs, L) * dk
    }
    expect(norm).toBeCloseTo(1.0, 2)
  })

  it('norm ≈ 1 for equal 1+2 mix at t=T_rev/4', () => {
    const c = 1 / Math.SQRT2
    const coeffs = [c, c, 0, 0, 0, 0, 0, 0]
    const t = iswRevivalPeriod(L) / 4
    const kMax = 20 / L
    const N = 2000
    const dk = 2 * kMax / N
    let norm = 0
    for (let i = 0; i <= N; i++) {
      const k = -kMax + i * dk
      const w = (i === 0 || i === N) ? 0.5 : 1
      norm += w * iswMomentumProbTE(k, t, coeffs, L) * dk
    }
    expect(norm).toBeCloseTo(1.0, 2)
  })

  it('symmetry: |φ(k,t)|² = |φ(−k,t)|² for real coefficients (odd-n states)', () => {
    const coeffs = [1, 0, 0, 0, 0, 0, 0, 0]
    for (const k of [0.3, 0.8, 1.5]) {
      const pos = iswMomentumProbTE(k, 1.0, coeffs, L)
      const neg = iswMomentumProbTE(-k, 1.0, coeffs, L)
      expect(pos).toBeCloseTo(neg, 8)
    }
  })
})

// ── hoCoherentMomentumProb ───────────────────────────────────────────────────

describe('hoCoherentMomentumProb', () => {
  const omega = 1.0
  const alpha = 1.5
  const phi = 0

  it('at t=0 with φ=0: peak at k=0 (zero initial momentum)', () => {
    const kGrid = Array.from({ length: 200 }, (_, i) => -5 + i * 0.05)
    let peakK = 0, peakVal = 0
    for (const k of kGrid) {
      const v = hoCoherentMomentumProb(k, 0, alpha, phi, omega)
      if (v > peakVal) { peakVal = v; peakK = k }
    }
    expect(peakK).toBeCloseTo(0, 1)
  })

  it('at t=π/(2ω): peak at −|α|√(2ω) (maximum negative momentum)', () => {
    const t = Math.PI / (2 * omega)
    const expectedPeak = -alpha * Math.sqrt(2 * omega)
    const kGrid = Array.from({ length: 400 }, (_, i) => -8 + i * 0.04)
    let peakK = 0, peakVal = 0
    for (const k of kGrid) {
      const v = hoCoherentMomentumProb(k, t, alpha, phi, omega)
      if (v > peakVal) { peakVal = v; peakK = k }
    }
    expect(peakK).toBeCloseTo(expectedPeak, 1)
  })

  it('integrates to 1', () => {
    const kMax = 10
    const N = 2000
    const dk = 2 * kMax / N
    let norm = 0
    for (let i = 0; i <= N; i++) {
      const k = -kMax + i * dk
      const w = (i === 0 || i === N) ? 0.5 : 1
      norm += w * hoCoherentMomentumProb(k, 0.5, alpha, phi, omega) * dk
    }
    expect(norm).toBeCloseTo(1.0, 3)
  })

  it('r=0, α=0: ground state has Gaussian width Δk = √(ω/2)', () => {
    const kHalf = Math.sqrt(omega / 2)
    const atPeak = hoCoherentMomentumProb(0, 0, 0, 0, omega)
    const atSigma = hoCoherentMomentumProb(kHalf, 0, 0, 0, omega)
    expect(atSigma / atPeak).toBeCloseTo(Math.exp(-0.5), 3)
  })
})
