import { describe, it, expect } from 'vitest'
import {
  iswPsi,
  iswProb,
  iswExpectX,
  iswExpectP,
  iswExpectX2,
  iswExpectP2,
  iswRevivalPeriod,
  hoCoherentProb,
  hoCoherentExpectX,
  hoCoherentExpectP,
  squeezedFockDist,
} from '../physics/timeEvolution'

const L = 10
const TWO_PI = 2 * Math.PI

// ── ISW ──────────────────────────────────────────────────────────────────────

describe('ISW superposition', () => {
  it('single eigenstate: |ψ₁(x,t)|² is time-independent', () => {
    const coeffs = [1, 0, 0, 0, 0, 0, 0, 0]
    const x = L / 3
    const p0 = iswProb(x, 0, coeffs, L)
    const p1 = iswProb(x, 1.23, coeffs, L)
    const p2 = iswProb(x, 7.77, coeffs, L)
    expect(p0).toBeCloseTo(p1, 10)
    expect(p0).toBeCloseTo(p2, 10)
  })

  it('equal 1+2 mix: ⟨x⟩ at t=0 is real-valued between 0 and L', () => {
    const c = 1 / Math.sqrt(2)
    const coeffs = [c, c, 0, 0, 0, 0, 0, 0]
    const xExp = iswExpectX(0, coeffs, L)
    expect(xExp).toBeGreaterThan(0)
    expect(xExp).toBeLessThan(L)
  })

  it('norm = 1 at t=0 (verified via integration)', () => {
    const c = 1 / Math.sqrt(2)
    const coeffs = [c, c, 0, 0, 0, 0, 0, 0]
    const N = 1000
    const dx = L / N
    let norm = 0
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) * dx
      norm += iswProb(x, 0, coeffs, L) * dx
    }
    expect(norm).toBeCloseTo(1.0, 4)
  })

  it('norm = 1 at t = T_rev/4', () => {
    const c = 1 / Math.sqrt(2)
    const coeffs = [c, c, 0, 0, 0, 0, 0, 0]
    const T = iswRevivalPeriod(L)
    const t = T / 4
    const N = 1000
    const dx = L / N
    let norm = 0
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) * dx
      norm += iswProb(x, t, coeffs, L) * dx
    }
    expect(norm).toBeCloseTo(1.0, 4)
  })

  it('revival: ψ(x, T_rev) ≈ ψ(x, 0) for all x', () => {
    const c = 1 / Math.sqrt(2)
    const coeffs = [c, c, 0, 0, 0, 0, 0, 0]
    const T = iswRevivalPeriod(L)
    const xs = [L * 0.1, L * 0.3, L * 0.5, L * 0.7, L * 0.9]
    for (const x of xs) {
      const p0 = iswProb(x, 0, coeffs, L)
      const pT = iswProb(x, T, coeffs, L)
      expect(pT).toBeCloseTo(p0, 8)
    }
  })

  it('iswRevivalPeriod(L=10) = 4*100/π', () => {
    expect(iswRevivalPeriod(10)).toBeCloseTo(4 * 100 / Math.PI, 8)
  })

  it('⟨x⟩ for ground state = L/2 (exact by symmetry)', () => {
    const coeffs = [1, 0, 0, 0, 0, 0, 0, 0]
    expect(iswExpectX(0, coeffs, L)).toBeCloseTo(L / 2, 6)
    expect(iswExpectX(3.14, coeffs, L)).toBeCloseTo(L / 2, 6)
  })

  it('⟨p⟩ for ground state = 0 (exact by symmetry)', () => {
    const coeffs = [1, 0, 0, 0, 0, 0, 0, 0]
    expect(iswExpectP(0, coeffs, L)).toBeCloseTo(0, 8)
    expect(iswExpectP(2.5, coeffs, L)).toBeCloseTo(0, 8)
  })
})

describe('iswExpectX2 — exact analytical formula', () => {
  it('ground state n=1: ⟨x²⟩ = L²/3 − L²/(2π²) (time-independent)', () => {
    const coeffs = [1, 0, 0, 0, 0, 0, 0, 0]
    const expected = L * L / 3 - L * L / (2 * Math.PI * Math.PI)
    expect(iswExpectX2(0, coeffs, L)).toBeCloseTo(expected, 8)
    expect(iswExpectX2(1.5, coeffs, L)).toBeCloseTo(expected, 8)
  })

  it('n=2: ⟨x²⟩ = L²/3 − L²/(8π²) (time-independent)', () => {
    const coeffs = [0, 1, 0, 0, 0, 0, 0, 0]
    const expected = L * L / 3 - L * L / (8 * Math.PI * Math.PI)
    expect(iswExpectX2(0, coeffs, L)).toBeCloseTo(expected, 8)
  })

  it('matches quadrature for ground state at t=0', () => {
    const coeffs = [1, 0, 0, 0, 0, 0, 0, 0]
    const N = 2000; const dx = L / N
    let quad = 0
    for (let k = 0; k <= N; k++) {
      const x = k * dx
      const w = (k === 0 || k === N) ? 0.5 : 1
      quad += w * x * x * iswProb(x, 0, coeffs, L) * dx
    }
    expect(iswExpectX2(0, coeffs, L)).toBeCloseTo(quad, 4)
  })

  it('matches quadrature for 1+2 mix at t=T_rev/4', () => {
    const c = 1 / Math.sqrt(2)
    const coeffs = [c, c, 0, 0, 0, 0, 0, 0]
    const t = iswRevivalPeriod(L) / 4
    const N = 2000; const dx = L / N
    let quad = 0
    for (let k = 0; k <= N; k++) {
      const x = k * dx
      const w = (k === 0 || k === N) ? 0.5 : 1
      quad += w * x * x * iswProb(x, t, coeffs, L) * dx
    }
    expect(iswExpectX2(t, coeffs, L)).toBeCloseTo(quad, 4)
  })

  it('satisfies Δx ≥ 0 for a generic mix', () => {
    const c = 1 / Math.sqrt(2)
    const coeffs = [c, c, 0, 0, 0, 0, 0, 0]
    const t = 0.7
    const x2 = iswExpectX2(t, coeffs, L)
    const x1 = iswExpectX(t, coeffs, L)
    const deltaX = Math.sqrt(Math.max(0, x2 - x1 * x1))
    expect(deltaX).toBeGreaterThan(0)
  })
})

// ── HO coherent state ─────────────────────────────────────────────────────────

describe('HO coherent state', () => {
  const omega = 1.0
  const alpha = 1.5
  const phi = 0

  it('is Gaussian: peak is at ⟨x(t)⟩ at t=0', () => {
    const xPeak = hoCoherentExpectX(0, alpha, phi, omega)
    const N = 200
    const xMax = 6
    const dx = (2 * xMax) / N
    let peakX = -xMax
    let peakVal = 0
    for (let i = 0; i <= N; i++) {
      const x = -xMax + i * dx
      const p = hoCoherentProb(x, 0, alpha, phi, omega)
      if (p > peakVal) { peakVal = p; peakX = x }
    }
    expect(peakX).toBeCloseTo(xPeak, 1)
  })

  it('⟨x(t=0)⟩ = |α|√(2/ω) cos(φ)', () => {
    const expected = alpha * Math.sqrt(2 / omega) * Math.cos(phi)
    expect(hoCoherentExpectX(0, alpha, phi, omega)).toBeCloseTo(expected, 8)
  })

  it('⟨x(t=π/ω)⟩ = −|α|√(2/ω) (half period)', () => {
    const t = Math.PI / omega
    const expected = alpha * Math.sqrt(2 / omega) * Math.cos(omega * t + phi)
    expect(hoCoherentExpectX(t, alpha, phi, omega)).toBeCloseTo(expected, 8)
  })

  it('⟨p(t=0)⟩ = −|α|√(2ω) sin(φ) = 0 when φ=0', () => {
    expect(hoCoherentExpectP(0, alpha, 0, omega)).toBeCloseTo(0, 8)
  })

  it('⟨p(t=π/(2ω))⟩ = −|α|√(2ω) (quarter period)', () => {
    const t = Math.PI / (2 * omega)
    const expected = -alpha * Math.sqrt(2 * omega) * Math.sin(omega * t + phi)
    expect(hoCoherentExpectP(t, alpha, phi, omega)).toBeCloseTo(expected, 8)
  })

  it('α=0 (ground state): ⟨x⟩=0 for all t', () => {
    expect(hoCoherentExpectX(0, 0, 0, omega)).toBeCloseTo(0, 10)
    expect(hoCoherentExpectX(Math.PI, 0, 0, omega)).toBeCloseTo(0, 10)
  })

  it('hoCoherentProb integrates to 1', () => {
    const N = 2000
    const xMax = 8
    const dx = (2 * xMax) / N
    let norm = 0
    for (let i = 0; i <= N; i++) {
      const x = -xMax + i * dx
      norm += hoCoherentProb(x, 0.5, alpha, phi, omega) * dx
    }
    expect(norm).toBeCloseTo(1.0, 3)
  })
})

// ── Squeezed Fock distribution ────────────────────────────────────────────────

describe('squeezedFockDist', () => {
  const omega = 1.0
  const nMax = 16

  it('sums to 1 (normalisation) for squeezed vacuum r=1, α=0', () => {
    const weights = squeezedFockDist(0, 0, omega, 1.0, nMax)
    const sum = weights.reduce((s, w) => s + w, 0)
    expect(sum).toBeCloseTo(1.0, 2)
  })

  it('sums to 1 for displaced squeezed state α=2, r=0.5', () => {
    const weights = squeezedFockDist(2, 0, omega, 0.5, nMax)
    const sum = weights.reduce((s, w) => s + w, 0)
    expect(sum).toBeCloseTo(1.0, 2)
  })

  it('r=0 matches Poisson distribution for coherent state', () => {
    const alpha = 1.5
    const weights = squeezedFockDist(alpha, 0, omega, 0, nMax)
    // Poisson: P(n) = e^{-α²} α^{2n} / n!
    const a2 = alpha * alpha
    let pow = 1, fac = 1
    for (let n = 0; n < nMax; n++) {
      if (n > 0) { pow *= a2; fac *= n }
      const poisson = Math.exp(-a2) * pow / fac
      expect(weights[n]).toBeCloseTo(poisson, 2)
    }
  })

  it('squeezed vacuum (α=0, r>0) only has even-n contributions', () => {
    const weights = squeezedFockDist(0, 0, omega, 0.8, nMax)
    // Odd Fock states must vanish by parity
    for (let n = 1; n < nMax; n += 2) {
      expect(weights[n]).toBeLessThan(1e-4)
    }
  })

  it('r=0, α=0 gives pure ground state (P(0)≈1)', () => {
    const weights = squeezedFockDist(0, 0, omega, 0, nMax)
    expect(weights[0]).toBeCloseTo(1.0, 3)
    expect(weights[1]).toBeLessThan(1e-4)
  })

  it('all weights are non-negative', () => {
    const weights = squeezedFockDist(1.5, 0.3, omega, 0.6, nMax)
    weights.forEach(w => expect(w).toBeGreaterThanOrEqual(0))
  })
})
