import { describe, it, expect } from 'vitest'
import {
  hoSqueezedProb, hoSqueezedDeltaX, hoSqueezedDeltaP, hoSqueezedSigmaX,
  hoCoherentProb, hoCoherentRePsi, hoCoherentImPsi,
  hoSqueezedRePsi, hoSqueezedImPsi,
} from '../physics/timeEvolution'
import { hoSqueezedMomentumProb, hoCoherentMomentumProb } from '../physics/momentumSpace'

const omega = 1.0
const alpha = 1.5
const phi = 0
const r = 1.0

describe('hoSqueezedProb', () => {
  it('r=0 matches hoCoherentProb exactly', () => {
    for (const x of [-2, 0, 1.5, 3]) {
      for (const t of [0, 0.5, 1.2]) {
        expect(hoSqueezedProb(x, t, alpha, phi, omega, 0))
          .toBeCloseTo(hoCoherentProb(x, t, alpha, phi, omega), 10)
      }
    }
  })

  it('peak at ⟨x(t=0)⟩ = |α|√(2/ω)', () => {
    const xPeak = alpha * Math.sqrt(2 / omega)
    const N = 400
    const xMax = 8
    const dx = 2 * xMax / N
    let bestX = -xMax, bestVal = 0
    for (let i = 0; i <= N; i++) {
      const x = -xMax + i * dx
      const p = hoSqueezedProb(x, 0, alpha, phi, omega, r)
      if (p > bestVal) { bestVal = p; bestX = x }
    }
    expect(bestX).toBeCloseTo(xPeak, 1)
  })

  it('integrates to 1 at t=0', () => {
    const N = 2000; const xMax = 10; const dx = 2 * xMax / N
    let norm = 0
    for (let i = 0; i <= N; i++) {
      const x = -xMax + i * dx
      const w = (i === 0 || i === N) ? 0.5 : 1
      norm += w * hoSqueezedProb(x, 0, alpha, phi, omega, r) * dx
    }
    expect(norm).toBeCloseTo(1.0, 3)
  })

  it('integrates to 1 at t=π/(4ω)', () => {
    const t = Math.PI / (4 * omega)
    const N = 2000; const xMax = 10; const dx = 2 * xMax / N
    let norm = 0
    for (let i = 0; i <= N; i++) {
      const x = -xMax + i * dx
      const w = (i === 0 || i === N) ? 0.5 : 1
      norm += w * hoSqueezedProb(x, t, alpha, phi, omega, r) * dx
    }
    expect(norm).toBeCloseTo(1.0, 3)
  })

  it('width at t=0 = e^{−r}/√ω (squeezed)', () => {
    const sigmaExpected = Math.exp(-r) / Math.sqrt(omega)
    expect(hoSqueezedSigmaX(0, omega, r)).toBeCloseTo(sigmaExpected, 8)
  })

  it('width at t=π/(2ω) = e^r/√ω (anti-squeezed — widest)', () => {
    const t = Math.PI / (2 * omega)
    const sigmaExpected = Math.exp(r) / Math.sqrt(omega)
    expect(hoSqueezedSigmaX(t, omega, r)).toBeCloseTo(sigmaExpected, 8)
  })
})

describe('hoSqueezedDeltaX / DeltaP', () => {
  it('Δx(0) = e^{−r}/√(2ω)', () => {
    expect(hoSqueezedDeltaX(0, omega, r)).toBeCloseTo(Math.exp(-r) / Math.sqrt(2 * omega), 8)
  })

  it('Δp(0) = e^r · √(ω/2)', () => {
    expect(hoSqueezedDeltaP(0, omega, r)).toBeCloseTo(Math.exp(r) * Math.sqrt(omega / 2), 8)
  })

  it('Δx(π/(2ω)) = e^r/√(2ω) (anti-squeezed — widest)', () => {
    const t = Math.PI / (2 * omega)
    expect(hoSqueezedDeltaX(t, omega, r)).toBeCloseTo(Math.exp(r) / Math.sqrt(2 * omega), 8)
  })

  it('Δx(t)·Δp(t) = 1/2 at t=0 (minimum uncertainty)', () => {
    const dx = hoSqueezedDeltaX(0, omega, r)
    const dp = hoSqueezedDeltaP(0, omega, r)
    expect(dx * dp).toBeCloseTo(0.5, 8)
  })

  it('Δx(t)·Δp(t) = cosh(2r)/2 at t=π/(4ω) (maximum — squeeze axis at 45°)', () => {
    const t = Math.PI / (4 * omega)
    const dx = hoSqueezedDeltaX(t, omega, r)
    const dp = hoSqueezedDeltaP(t, omega, r)
    expect(dx * dp).toBeCloseTo(Math.cosh(2 * r) / 2, 6)
  })

  it('r=0: Δx·Δp = 0.5 for all t (coherent limit)', () => {
    for (const t of [0, 0.5, 1.0, Math.PI]) {
      const dx = hoSqueezedDeltaX(t, omega, 0)
      const dp = hoSqueezedDeltaP(t, omega, 0)
      expect(dx * dp).toBeCloseTo(0.5, 8)
    }
  })
})

describe('hoCoherentRePsi / hoCoherentImPsi', () => {
  it('Re² + Im² = hoCoherentProb at various (x, t)', () => {
    for (const x of [-2, 0, 1, 2.5]) {
      for (const t of [0, 0.5, Math.PI / 2, 1.7]) {
        const re = hoCoherentRePsi(x, t, alpha, phi, omega)
        const im = hoCoherentImPsi(x, t, alpha, phi, omega)
        const prob = hoCoherentProb(x, t, alpha, phi, omega)
        expect(re * re + im * im).toBeCloseTo(prob, 10)
      }
    }
  })

  it('Im = 0 at x = ⟨x⟩ when t = 0 and φ_α = 0 (real state)', () => {
    const xMean = alpha * Math.sqrt(2 / omega)
    const im = hoCoherentImPsi(xMean, 0, alpha, 0, omega)
    expect(im).toBeCloseTo(0, 10)
  })

  it('integrates Re²+Im² to 1', () => {
    const t = 0.8
    const N = 2000; const xMax = 10; const dx = 2 * xMax / N
    let norm = 0
    for (let i = 0; i <= N; i++) {
      const x = -xMax + i * dx
      const w = (i === 0 || i === N) ? 0.5 : 1
      const re = hoCoherentRePsi(x, t, alpha, phi, omega)
      const im = hoCoherentImPsi(x, t, alpha, phi, omega)
      norm += w * (re * re + im * im) * dx
    }
    expect(norm).toBeCloseTo(1.0, 3)
  })
})

describe('hoSqueezedRePsi / hoSqueezedImPsi', () => {
  it('Re² + Im² = hoSqueezedProb at various (x, t)', () => {
    for (const x of [-3, 0, 1, 2.5]) {
      for (const t of [0, 0.5, Math.PI / (2 * omega), 1.7]) {
        const re = hoSqueezedRePsi(x, t, alpha, phi, omega, r)
        const im = hoSqueezedImPsi(x, t, alpha, phi, omega, r)
        const prob = hoSqueezedProb(x, t, alpha, phi, omega, r)
        expect(re * re + im * im).toBeCloseTo(prob, 10)
      }
    }
  })

  it('chirp = 0 at t = 0: Im = 0 at x = ⟨x⟩ (state is real at t=0 for φ_α=0)', () => {
    const xMean = alpha * Math.sqrt(2 / omega)
    const im = hoSqueezedImPsi(xMean, 0, alpha, 0, omega, r)
    expect(im).toBeCloseTo(0, 10)
  })

  it('chirp = 0 at t = π/ω: Re = 0 at x = ⟨x⟩ (global phase −π/2 → purely imaginary)', () => {
    const t = Math.PI / omega
    const xMean = -alpha * Math.sqrt(2 / omega)
    const re = hoSqueezedRePsi(xMean, t, alpha, 0, omega, r)
    expect(re).toBeCloseTo(0, 10)
  })

  it('integrates Re²+Im² to 1 at t=π/(4ω)', () => {
    const t = Math.PI / (4 * omega)
    const N = 2000; const xMax = 12; const dx = 2 * xMax / N
    let norm = 0
    for (let i = 0; i <= N; i++) {
      const x = -xMax + i * dx
      const w = (i === 0 || i === N) ? 0.5 : 1
      const re = hoSqueezedRePsi(x, t, alpha, phi, omega, r)
      const im = hoSqueezedImPsi(x, t, alpha, phi, omega, r)
      norm += w * (re * re + im * im) * dx
    }
    expect(norm).toBeCloseTo(1.0, 3)
  })

  it('r=0: matches hoCoherentRePsi and hoCoherentImPsi', () => {
    for (const x of [-1, 0, 2]) {
      for (const t of [0, 0.7]) {
        expect(hoSqueezedRePsi(x, t, alpha, phi, omega, 0))
          .toBeCloseTo(hoCoherentRePsi(x, t, alpha, phi, omega), 8)
        expect(hoSqueezedImPsi(x, t, alpha, phi, omega, 0))
          .toBeCloseTo(hoCoherentImPsi(x, t, alpha, phi, omega), 8)
      }
    }
  })
})

describe('hoSqueezedMomentumProb', () => {
  it('r=0 matches hoCoherentMomentumProb signature (same width)', () => {
    for (const k of [-1.5, 0, 1.0]) {
      expect(hoSqueezedMomentumProb(k, 0, alpha, phi, omega, 0))
        .toBeCloseTo(hoCoherentMomentumProb(k, 0, alpha, phi, omega), 8)
    }
  })

  it('width at t=0 is anti-squeezed: e^r·√(ω/2)·√2 = e^r·√ω', () => {
    const pMean = 0  // phi=0, t=0 → ⟨p⟩=0
    const sigmaP = Math.exp(r) / Math.sqrt(omega)   // σ_p = e^r/√ω
    const atCenter = hoSqueezedMomentumProb(pMean, 0, 0, 0, omega, r)
    const atSigma = hoSqueezedMomentumProb(pMean + sigmaP, 0, 0, 0, omega, r)
    expect(atSigma / atCenter).toBeCloseTo(Math.exp(-1), 3)
  })

  it('integrates to 1', () => {
    const kMax = 12; const N = 2000; const dk = 2 * kMax / N
    let norm = 0
    for (let i = 0; i <= N; i++) {
      const k = -kMax + i * dk
      const w = (i === 0 || i === N) ? 0.5 : 1
      norm += w * hoSqueezedMomentumProb(k, 0, alpha, phi, omega, r) * dk
    }
    expect(norm).toBeCloseTo(1.0, 3)
  })
})
