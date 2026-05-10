import { describe, it, expect } from 'vitest'
import {
  laguerreL,
  wignerFock,
  wignerCoherent,
  wignerSqueezed,
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
