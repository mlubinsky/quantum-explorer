import { describe, it, expect } from 'vitest'
import {
  laguerreL,
  wignerFock,
  wignerCoherent,
  wignerSqueezed,
  wignerCoherentT,
  wignerSqueezedT,
  wignerCat,
  wignerFockSuper,
  computeWignerGrid,
  xMarginal,
  pMarginal,
  wignerNegativity,
} from '../physics/wigner'
import { hoWavefunction } from '../physics/harmonic'

// ── Laguerre ─────────────────────────────────────────────────────────────────

describe('laguerreL', () => {
  it('L_0 = 1', () => expect(laguerreL(0, 2.5)).toBe(1))
  it('L_1(x) = 1 - x', () => expect(laguerreL(1, 3)).toBeCloseTo(-2, 10))
  it('L_2(x) = (x²-4x+2)/2', () => {
    const x = 2
    expect(laguerreL(2, x)).toBeCloseTo((x * x - 4 * x + 2) / 2, 10)
  })
  it('L_3(x) = (-x³+9x²-18x+6)/6', () => {
    const x = 1.5
    const expected = (-x * x * x + 9 * x * x - 18 * x + 6) / 6
    expect(laguerreL(3, x)).toBeCloseTo(expected, 8)
  })
})

// ── Fock Wigner ───────────────────────────────────────────────────────────────

describe('wignerFock n=0', () => {
  it('ground state W(0,0) = 1/π', () => {
    expect(wignerFock(0, 0, 0, 1)).toBeCloseTo(1 / Math.PI, 8)
  })

  it('integrates to 1 over phase space', () => {
    const N = 200
    const xMax = 5, pMax = 5
    const dx = 2 * xMax / N, dp = 2 * pMax / N
    let sum = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      sum += wignerFock(0, -xMax + i * dx, -pMax + j * dp, 1) * dx * dp
    }
    expect(sum).toBeCloseTo(1, 2)
  })

  it('x-marginal matches |ψ₀(x)|²', () => {
    const NP = 200
    const pMax = 8
    for (const x of [-2, 0, 1, 2]) {
      let integral = 0
      const dp = 2 * pMax / NP
      for (let j = 0; j <= NP; j++) {
        const p = -pMax + j * dp
        const w = j === 0 || j === NP ? 0.5 : 1
        integral += w * wignerFock(0, x, p, 1) * dp
      }
      const psi2 = hoWavefunction(0, x, 1) ** 2
      expect(integral).toBeCloseTo(psi2, 2)
    }
  })
})

describe('wignerFock n=1', () => {
  it('W_1(0,0) = -1/π (negative!)', () => {
    expect(wignerFock(1, 0, 0, 1)).toBeCloseTo(-1 / Math.PI, 8)
  })

  it('integrates to 1 over phase space', () => {
    const N = 200
    const xMax = 6, pMax = 6
    const dx = 2 * xMax / N, dp = 2 * pMax / N
    let sum = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      sum += wignerFock(1, -xMax + i * dx, -pMax + j * dp, 1) * dx * dp
    }
    expect(sum).toBeCloseTo(1, 2)
  })
})

describe('wignerFock n=2', () => {
  it('W_2(0,0) = 1/π (positive at origin)', () => {
    expect(wignerFock(2, 0, 0, 1)).toBeCloseTo(1 / Math.PI, 8)
  })
})

describe('wignerFock ω≠1', () => {
  it('integrates to 1 for n=0, ω=2', () => {
    const omega = 2
    const N = 200
    const xMax = 4, pMax = 8
    const dx = 2 * xMax / N, dp = 2 * pMax / N
    let sum = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      sum += wignerFock(0, -xMax + i * dx, -pMax + j * dp, omega) * dx * dp
    }
    expect(sum).toBeCloseTo(1, 2)
  })
})

// ── Coherent state ────────────────────────────────────────────────────────────

describe('wignerCoherent', () => {
  it('peaks at (xMean, pMean)', () => {
    const W0 = wignerCoherent(1, 2, 1, 2, 1)
    const W1 = wignerCoherent(1.1, 2, 1, 2, 1)
    expect(W0).toBeGreaterThan(W1)
  })

  it('integrates to 1', () => {
    const xMean = 1, pMean = -1
    const N = 200
    const xMax = 6, pMax = 6
    const dx = 2 * xMax / N, dp = 2 * pMax / N
    let sum = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      sum += wignerCoherent(-xMax + i * dx, -pMax + j * dp, xMean, pMean, 1) * dx * dp
    }
    expect(sum).toBeCloseTo(1, 2)
  })

  it('W_coherent(xMean,pMean) = 1/π', () => {
    expect(wignerCoherent(2, -1, 2, -1, 1)).toBeCloseTo(1 / Math.PI, 8)
  })
})

// ── Squeezed state ────────────────────────────────────────────────────────────

describe('wignerSqueezed', () => {
  it('r=0 reduces to coherent', () => {
    const x = 0.5, p = 1.0
    expect(wignerSqueezed(x, p, 0, 0, 1, 0)).toBeCloseTo(wignerCoherent(x, p, 0, 0, 1), 10)
  })

  it('integrates to 1 for r=1', () => {
    const N = 200
    const xMax = 4, pMax = 12
    const dx = 2 * xMax / N, dp = 2 * pMax / N
    let sum = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      sum += wignerSqueezed(-xMax + i * dx, -pMax + j * dp, 0, 0, 1, 1) * dx * dp
    }
    expect(sum).toBeCloseTo(1, 2)
  })

  it('peak at origin = 1/π for any r', () => {
    expect(wignerSqueezed(0, 0, 0, 0, 1, 0.5)).toBeCloseTo(1 / Math.PI, 8)
    expect(wignerSqueezed(0, 0, 0, 0, 1, 1.5)).toBeCloseTo(1 / Math.PI, 8)
  })
})

// ── Cat state ─────────────────────────────────────────────────────────────────

describe('wignerCat', () => {
  it('even cat integrates to 1', () => {
    const alpha = 1.5
    const N = 200
    const xMax = 6, pMax = 6
    const dx = 2 * xMax / N, dp = 2 * pMax / N
    let sum = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      sum += wignerCat(-xMax + i * dx, -pMax + j * dp, alpha, 1, 1) * dx * dp
    }
    expect(sum).toBeCloseTo(1, 2)
  })

  it('odd cat integrates to 1', () => {
    const alpha = 1.5
    const N = 200
    const xMax = 6, pMax = 6
    const dx = 2 * xMax / N, dp = 2 * pMax / N
    let sum = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      sum += wignerCat(-xMax + i * dx, -pMax + j * dp, alpha, 1, -1) * dx * dp
    }
    expect(sum).toBeCloseTo(1, 2)
  })

  it('odd cat at alpha=0 returns Fock-1 Wigner function, not zero', () => {
    // Physical limit: normalized (|α⟩−|−α⟩) → |1⟩ as α→0
    // W₁(x,p) = (1/π)(2(x²+p²)−1)exp(−(x²+p²)) at ω=1
    const alpha = 0
    const omega = 1
    for (const [x, p] of [[0, 0], [1, 0], [0, 1], [1, 1]] as [number,number][]) {
      const s = omega * x * x + p * p / omega
      const w1 = (1 / Math.PI) * (2 * s - 1) * Math.exp(-s)
      expect(wignerCat(x, p, alpha, omega, -1)).toBeCloseTo(w1, 8)
    }
  })

  it('odd cat near alpha=0 integrates to 1 (continuity with Fock-1)', () => {
    const alpha = 1e-6
    const N = 200
    const xMax = 6, pMax = 6
    const dx = 2 * xMax / N, dp = 2 * pMax / N
    let sum = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      sum += wignerCat(-xMax + i * dx, -pMax + j * dp, alpha, 1, -1) * dx * dp
    }
    expect(sum).toBeCloseTo(1, 2)
  })

  it('even cat can go negative (interference fringes)', () => {
    const alpha = 2.0
    let hasNeg = false
    for (let j = 0; j < 30; j++) {
      const p = -6 + j * 0.4
      if (wignerCat(0, p, alpha, 1, 1) < -0.01) { hasNeg = true; break }
    }
    expect(hasNeg).toBe(true)
  })
})

// ── Fock superposition ────────────────────────────────────────────────────────

describe('wignerFockSuper', () => {
  it('n=n reduces to wignerFock', () => {
    const x = 0.5, p = 0.8
    expect(wignerFockSuper(2, 2, x, p, 1)).toBeCloseTo(wignerFock(2, x, p, 1), 4)
  })

  it('(|0⟩+|1⟩)/√2 integrates to 1', () => {
    const N = 120
    const xMax = 6, pMax = 6
    const dx = 2 * xMax / N, dp = 2 * pMax / N
    let sum = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      sum += wignerFockSuper(0, 1, -xMax + i * dx, -pMax + j * dp, 1) * dx * dp
    }
    expect(sum).toBeCloseTo(1, 1)
  })

  it('(|0⟩+|1⟩)/√2 x-marginal matches |ψ|²', () => {
    const omega = 1
    for (const x of [-1, 0, 1]) {
      const NP = 200, pMax = 8, dp = 2 * pMax / NP
      let integral = 0
      for (let j = 0; j <= NP; j++) {
        const w = j === 0 || j === NP ? 0.5 : 1
        integral += w * wignerFockSuper(0, 1, x, -pMax + j * dp, omega) * dp
      }
      const psi = (hoWavefunction(0, x, omega) + hoWavefunction(1, x, omega)) / Math.SQRT2
      expect(integral).toBeCloseTo(psi * psi, 1)
    }
  })
})

// ── Time-evolved Wigner ───────────────────────────────────────────────────────

describe('wignerCoherentT', () => {
  it('t=0 matches wignerCoherent at displaced centre', () => {
    const [alpha, phi, omega] = [1.5, Math.PI / 4, 1]
    const x0 = alpha * Math.sqrt(2 / omega) * Math.cos(phi)
    const p0 = -alpha * Math.sqrt(2 * omega) * Math.sin(phi)
    for (const [x, p] of [[0, 0], [1, -1], [2, 1]]) {
      expect(wignerCoherentT(x, p, 0, alpha, phi, omega))
        .toBeCloseTo(wignerCoherent(x, p, x0, p0, omega), 8)
    }
  })

  it('integrates to 1 at t = π/(3ω)', () => {
    const [alpha, omega] = [1.5, 1]
    const t = Math.PI / 3
    const N = 150, xMax = 7, pMax = 7
    const dx = 2 * xMax / N, dp = 2 * pMax / N
    let sum = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      sum += wignerCoherentT(-xMax + i * dx, -pMax + j * dp, t, alpha, 0, omega) * dx * dp
    }
    expect(sum).toBeCloseTo(1, 2)
  })

  it('is periodic with T = 2π/ω', () => {
    const [alpha, omega] = [2, 1.5]
    const T = 2 * Math.PI / omega
    const [x, p, t0] = [1, 0.5, 0.7]
    expect(wignerCoherentT(x, p, t0, alpha, 0, omega))
      .toBeCloseTo(wignerCoherentT(x, p, t0 + T, alpha, 0, omega), 6)
  })
})

describe('wignerSqueezedT', () => {
  it('t=0 matches wignerSqueezed at displaced centre (phiAlpha=0)', () => {
    const [alpha, omega, r] = [1.5, 1, 0.8]
    const x0 = alpha * Math.sqrt(2 / omega)
    for (const [x, p] of [[0, 0], [1.5, -0.5], [2, 1]]) {
      expect(wignerSqueezedT(x, p, 0, alpha, 0, omega, r))
        .toBeCloseTo(wignerSqueezed(x, p, x0, 0, omega, r), 8)
    }
  })

  it('r=0 reduces to wignerCoherentT', () => {
    const [alpha, omega, t] = [1.5, 1, 0.9]
    for (const [x, p] of [[0, 0], [1, 1], [-1, 0.5]]) {
      expect(wignerSqueezedT(x, p, t, alpha, 0, omega, 0))
        .toBeCloseTo(wignerCoherentT(x, p, t, alpha, 0, omega), 8)
    }
  })

  it('integrates to 1 at t = π/(4ω) (maximum tilt)', () => {
    const [alpha, omega, r] = [1, 1, 1]
    const t = Math.PI / (4 * omega)
    const N = 150, xMax = 7, pMax = 7
    const dx = 2 * xMax / N, dp = 2 * pMax / N
    let sum = 0
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
      sum += wignerSqueezedT(-xMax + i * dx, -pMax + j * dp, t, alpha, 0, omega, r) * dx * dp
    }
    expect(sum).toBeCloseTo(1, 2)
  })

  it('t=π/(2ω) swaps squeeze axes: narrow ↔ wide', () => {
    const [omega, r] = [1, 1]
    // t=0: x is squeezed → W drops faster in x direction than p direction
    const W0_nearX = wignerSqueezedT(0.1, 0, 0, 0, 0, omega, r)
    const W0_nearP = wignerSqueezedT(0, 0.1, 0, 0, 0, omega, r)
    expect(W0_nearX).toBeLessThan(W0_nearP)   // squeezed (narrow) x falls off faster
    // t=π/(2ω): p is now squeezed → W drops faster in p direction
    const thalf = Math.PI / (2 * omega)
    const Wh_nearX = wignerSqueezedT(0.1, 0, thalf, 0, 0, omega, r)
    const Wh_nearP = wignerSqueezedT(0, 0.1, thalf, 0, 0, omega, r)
    expect(Wh_nearP).toBeLessThan(Wh_nearX)   // squeezed (narrow) p falls off faster
  })

  it('is periodic with T = 2π/ω', () => {
    const [alpha, omega, r] = [1, 1, 0.8]
    const T = 2 * Math.PI / omega
    const [x, p, t0] = [0.5, 0.3, 0.4]
    expect(wignerSqueezedT(x, p, t0, alpha, 0, omega, r))
      .toBeCloseTo(wignerSqueezedT(x, p, t0 + T, alpha, 0, omega, r), 6)
  })
})

// ── Grid + marginals ──────────────────────────────────────────────────────────

describe('computeWignerGrid + marginals', () => {
  it('xMarginal of Fock n=0 approximates |ψ₀|²', () => {
    const omega = 1
    const grid = computeWignerGrid(
      (x, p) => wignerFock(0, x, p, omega),
      -5, 5, 60, -8, 8, 80,
    )
    const xMarg = xMarginal(grid)
    for (let i = 10; i < 50; i++) {
      const x = grid.xVals[i]
      const expected = hoWavefunction(0, x, omega) ** 2
      expect(xMarg[i]).toBeCloseTo(expected, 1)
    }
  })

  it('pMarginal of coherent state is Gaussian in p', () => {
    const omega = 1, xMean = 0, pMean = 0
    const grid = computeWignerGrid(
      (x, p) => wignerCoherent(x, p, xMean, pMean, omega),
      -5, 5, 60, -8, 8, 80,
    )
    const pMarg = pMarginal(grid)
    for (let j = 20; j < 60; j++) {
      const pp = grid.pVals[j]
      const expected = Math.sqrt(1 / (Math.PI * omega)) * Math.exp(-pp * pp / omega)
      expect(pMarg[j]).toBeCloseTo(expected, 1)
    }
  })

  it('Fock n=1 has positive negativity', () => {
    const grid = computeWignerGrid(
      (x, p) => wignerFock(1, x, p, 1),
      -5, 5, 60, -5, 5, 60,
    )
    expect(wignerNegativity(grid)).toBeGreaterThan(0.05)
  })

  it('coherent state has zero negativity', () => {
    const grid = computeWignerGrid(
      (x, p) => wignerCoherent(x, p, 0, 0, 1),
      -5, 5, 40, -5, 5, 40,
    )
    expect(wignerNegativity(grid)).toBeCloseTo(0, 6)
  })
})
