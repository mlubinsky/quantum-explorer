import { describe, it, expect } from 'vitest'
import { buildH, buildX, buildP, heisenbergRe, heisenbergReFromIm } from '../utils/matrixElements'
import { iswEigenstate, iswEnergy } from '../physics/isw'
import { hoEnergy, hoWavefunction, hoTurningPoint } from '../physics/harmonic'

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

describe('heisenbergReFromIm', () => {
  const P = buildP(wavefunctions, dx)

  it('at t=0 all elements are zero (sin(0)=0)', () => {
    const Pt = heisenbergReFromIm(P, energies, 0)
    for (let m = 0; m < nStates; m++)
      for (let n = 0; n < nStates; n++)
        expect(Pt[m][n]).toBeCloseTo(0, 10)
  })

  it('diagonal is always zero (sin(0·t)=0)', () => {
    for (const t of [0, 1.5, 3.7]) {
      const Pt = heisenbergReFromIm(P, energies, t)
      for (let i = 0; i < nStates; i++)
        expect(Pt[i][i]).toBeCloseTo(0, 10)
    }
  })

  it('Re[P_mn(t)] = -Im[P_mn]·sin(ωmn·t)', () => {
    const t = 2.3
    const Pt = heisenbergReFromIm(P, energies, t)
    for (let m = 0; m < nStates; m++)
      for (let n = 0; n < nStates; n++) {
        const expected = -P[m][n] * Math.sin((energies[m] - energies[n]) * t)
        expect(Pt[m][n]).toBeCloseTo(expected, 10)
      }
  })
})

describe('HO matrix elements on common grid', () => {
  const nLevels = 4
  const omega = 1.0
  const nPoints = 400
  const xMax = hoTurningPoint(nLevels - 1, omega) * 1.8 + 1.5
  const hoGrid = Array.from({ length: nPoints }, (_, i) => -xMax + (2 * xMax * i) / (nPoints - 1))
  const hoDx = hoGrid[1] - hoGrid[0]
  const hoEnergies = Array.from({ length: nLevels }, (_, i) => hoEnergy(i, omega))
  const hoWavefunctions = Array.from({ length: nLevels }, (_, i) => hoGrid.map(x => hoWavefunction(i, x, omega)))

  it('⟨ψₙ|x|ψₙ⟩ = 0 for all n (HO symmetry: ⟨x⟩ = 0)', () => {
    const X = buildX(hoWavefunctions, hoGrid, hoDx)
    for (let i = 0; i < nLevels; i++)
      expect(X[i][i]).toBeCloseTo(0, 2)
  })

  it('off-diagonal X is non-zero only for adjacent levels (Δn = ±1)', () => {
    const X = buildX(hoWavefunctions, hoGrid, hoDx)
    // ⟨0|x|2⟩ should be ≈ 0 (Δn=2, forbidden by selection rule)
    expect(Math.abs(X[0][2])).toBeLessThan(0.01)
    // ⟨0|x|1⟩ should be non-zero
    expect(Math.abs(X[0][1])).toBeGreaterThan(0.1)
  })
})
