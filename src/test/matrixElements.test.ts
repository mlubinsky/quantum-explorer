import { describe, it, expect } from 'vitest'
import { buildH, buildX, buildP, heisenbergRe } from '../utils/matrixElements'
import { iswEigenstate, iswEnergy } from '../physics/isw'

// Build a small ISW basis (n=1..4, L=10) for all matrix tests
const L = 10
const nStates = 4
const nPoints = 500
const dx = L / (nPoints - 1)

const energies = Array.from({ length: nStates }, (_, i) => iswEnergy(i + 1, L))
const wavefunctions = Array.from({ length: nStates }, (_, i) => {
  const { psi } = iswEigenstate(i + 1, L, nPoints)
  return psi
})
const grid_x = Array.from({ length: nPoints }, (_, i) => i * dx)

describe('buildH', () => {
  it('diagonal = energies', () => {
    const H = buildH(energies)
    energies.forEach((E, i) => expect(H[i]).toBeCloseTo(E, 10))
  })
})

describe('buildX', () => {
  const X = buildX(wavefunctions, grid_x, dx)

  it('is symmetric', () => {
    for (let m = 0; m < nStates; m++)
      for (let n = 0; n < nStates; n++)
        expect(X[m][n]).toBeCloseTo(X[n][m], 6)
  })

  it('diagonal ⟨ψₙ|x|ψₙ⟩ ≈ L/2 (centre of well)', () => {
    for (let i = 0; i < nStates; i++)
      expect(X[i][i]).toBeCloseTo(L / 2, 1)
  })

  it('selection rule: same-parity off-diagonal ≈ 0 (n=1,3 both odd)', () => {
    // n=1 (odd parity) and n=3 (odd parity) → ⟨ψ₁|x|ψ₃⟩ ≈ 0
    expect(Math.abs(X[0][2])).toBeLessThan(0.01)
  })
})

describe('buildP', () => {
  const P = buildP(wavefunctions, dx)

  it('diagonal = 0 (antisymmetry)', () => {
    for (let i = 0; i < nStates; i++)
      expect(Math.abs(P[i][i])).toBeLessThan(1e-10)
  })

  it('is antisymmetric: P[m][n] = -P[n][m]', () => {
    for (let m = 0; m < nStates; m++)
      for (let n = 0; n < nStates; n++)
        expect(P[m][n]).toBeCloseTo(-P[n][m], 6)
  })
})

describe('heisenbergRe', () => {
  const X = buildX(wavefunctions, grid_x, dx)

  it('at t=0 returns matrix unchanged', () => {
    const Xt = heisenbergRe(X, energies, 0)
    for (let m = 0; m < nStates; m++)
      for (let n = 0; n < nStates; n++)
        expect(Xt[m][n]).toBeCloseTo(X[m][n], 10)
  })

  it('diagonal is time-invariant (ωₙₙ = 0)', () => {
    const t = 3.7
    const Xt = heisenbergRe(X, energies, t)
    for (let i = 0; i < nStates; i++)
      expect(Xt[i][i]).toBeCloseTo(X[i][i], 10)
  })
})
