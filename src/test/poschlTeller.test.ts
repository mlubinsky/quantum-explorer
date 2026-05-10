import { describe, it, expect } from 'vitest'
import {
  ptV0, ptPotential, ptBoundEnergy, ptBoundPsiSqArray,
} from '../physics/poschlTeller'

describe('ptV0', () => {
  it('V₀ = N(N+1)α²/2 for α = 1', () => {
    expect(ptV0(1, 1)).toBeCloseTo(1, 10)    // 1·2/2 = 1
    expect(ptV0(2, 1)).toBeCloseTo(3, 10)    // 2·3/2 = 3
    expect(ptV0(3, 1)).toBeCloseTo(6, 10)    // 3·4/2 = 6
    expect(ptV0(4, 1)).toBeCloseTo(10, 10)   // 4·5/2 = 10
    expect(ptV0(5, 1)).toBeCloseTo(15, 10)   // 5·6/2 = 15
  })

  it('V₀ scales as α²', () => {
    expect(ptV0(1, 2)).toBeCloseTo(4, 10)    // 1·2·4/2 = 4
    expect(ptV0(2, 2)).toBeCloseTo(12, 10)   // 2·3·4/2 = 12
    expect(ptV0(3, 2)).toBeCloseTo(24, 10)   // 3·4·4/2 = 24
  })

  it('V₀ > 0 for all N and α', () => {
    for (const N of [1, 2, 3, 4, 5]) {
      for (const alpha of [0.5, 1.0, 2.0]) {
        expect(ptV0(N, alpha)).toBeGreaterThan(0)
      }
    }
  })
})

describe('ptPotential', () => {
  it('V(0) = −V₀ (bottom of well)', () => {
    for (const N of [1, 2, 3]) {
      for (const alpha of [0.5, 1.0, 2.0]) {
        expect(ptPotential(0, N, alpha)).toBeCloseTo(-ptV0(N, alpha), 10)
      }
    }
  })

  it('V(x) < 0 for all finite x (attractive everywhere)', () => {
    for (const x of [-5, -1, -0.1, 0, 0.1, 1, 5]) {
      expect(ptPotential(x, 3, 1)).toBeLessThan(0)
    }
  })

  it('V(x) → 0 as |x| → large', () => {
    expect(ptPotential(20, 3, 1)).toBeCloseTo(0, 5)
    expect(ptPotential(-20, 3, 1)).toBeCloseTo(0, 5)
  })

  it('V(x) is symmetric: V(−x) = V(x)', () => {
    for (const x of [0.5, 1.0, 2.0, 5.0]) {
      expect(ptPotential(-x, 3, 1)).toBeCloseTo(ptPotential(x, 3, 1), 10)
    }
  })
})

describe('ptBoundEnergy', () => {
  it('E_j = −α²(N−j)²/2', () => {
    expect(ptBoundEnergy(3, 0, 1)).toBeCloseTo(-4.5, 10)   // -1·9/2
    expect(ptBoundEnergy(3, 1, 1)).toBeCloseTo(-2.0, 10)   // -1·4/2
    expect(ptBoundEnergy(3, 2, 1)).toBeCloseTo(-0.5, 10)   // -1·1/2
    expect(ptBoundEnergy(1, 0, 1)).toBeCloseTo(-0.5, 10)   // -1·1/2
    expect(ptBoundEnergy(5, 0, 1)).toBeCloseTo(-12.5, 10)  // -1·25/2
    expect(ptBoundEnergy(5, 4, 1)).toBeCloseTo(-0.5, 10)   // -1·1/2
  })

  it('scales as α²', () => {
    expect(ptBoundEnergy(3, 0, 2)).toBeCloseTo(-18, 10)   // -4·9/2
    expect(ptBoundEnergy(2, 0, 3)).toBeCloseTo(-18, 10)   // -9·4/2
  })

  it('energies are strictly increasing (ground state deepest)', () => {
    for (const N of [2, 3, 4, 5]) {
      for (let j = 0; j < N - 1; j++) {
        expect(ptBoundEnergy(N, j, 1)).toBeLessThan(ptBoundEnergy(N, j + 1, 1))
      }
    }
  })

  it('all bound-state energies are negative', () => {
    for (const N of [1, 2, 3, 4, 5]) {
      for (let j = 0; j < N; j++) {
        expect(ptBoundEnergy(N, j, 1)).toBeLessThan(0)
      }
    }
  })

  it('all bound states are within the well: E_j > −V₀', () => {
    for (const N of [1, 2, 3, 4, 5]) {
      const V0 = ptV0(N, 1)
      for (let j = 0; j < N; j++) {
        expect(ptBoundEnergy(N, j, 1)).toBeGreaterThan(-V0)
      }
    }
  })

  it('top bound state (j=N−1) always has E = −α²/2', () => {
    for (const N of [1, 2, 3, 4, 5]) {
      expect(ptBoundEnergy(N, N - 1, 1)).toBeCloseTo(-0.5, 10)
      expect(ptBoundEnergy(N, N - 1, 2)).toBeCloseTo(-2.0, 10)
    }
  })
})

describe('ptBoundPsiSqArray', () => {
  function makeXArr(alpha: number, N_pts = 600): number[] {
    const xMax = 8 / alpha
    return Array.from({ length: N_pts }, (_, i) => -xMax + 2 * xMax * i / (N_pts - 1))
  }

  function trapz(y: number[], dx: number): number {
    let s = 0
    for (let i = 0; i < y.length; i++) {
      s += (i === 0 || i === y.length - 1 ? 0.5 : 1) * y[i]
    }
    return s * dx
  }

  it('normalises to 1 for all N and j', () => {
    for (const N of [1, 2, 3]) {
      for (let j = 0; j < N; j++) {
        const xArr = makeXArr(1.0)
        const dx = xArr[1] - xArr[0]
        const psiSq = ptBoundPsiSqArray(xArr, N, j, 1.0)
        expect(trapz(psiSq, dx)).toBeCloseTo(1, 2)
      }
    }
  })

  it('all values are non-negative', () => {
    const xArr = makeXArr(1.0)
    for (const N of [1, 2, 3]) {
      for (let j = 0; j < N; j++) {
        const psiSq = ptBoundPsiSqArray(xArr, N, j, 1.0)
        expect(psiSq.every(v => v >= -1e-14)).toBe(true)
      }
    }
  })

  it('ground state (j=0) peaks near x=0 and is symmetric', () => {
    // xArr is symmetric: xArr[i] = -xArr[N-1-i], so psiSq[i] = psiSq[N-1-i]
    const xArr = makeXArr(1.0)
    const n = xArr.length
    for (const N of [1, 2, 3, 4, 5]) {
      const psiSq = ptBoundPsiSqArray(xArr, N, 0, 1.0)
      // Peak is near centre (within 5 indices of true centre)
      const maxIdx = psiSq.indexOf(Math.max(...psiSq))
      expect(maxIdx).toBeGreaterThan(n / 2 - 5)
      expect(maxIdx).toBeLessThan(n / 2 + 5)
      // Symmetric: psiSq[i] = psiSq[n-1-i]
      for (const i of [50, 100, 150, 200]) {
        expect(psiSq[i]).toBeCloseTo(psiSq[n - 1 - i], 5)
      }
    }
  })

  it('j=1 state has symmetric |ψ|² with minimum near x=0 (one node)', () => {
    const xArr = makeXArr(1.0)
    const n = xArr.length
    for (const N of [2, 3, 4, 5]) {
      const psiSq = ptBoundPsiSqArray(xArr, N, 1, 1.0)
      // |ψ|² symmetric: psiSq[i] = psiSq[n-1-i]
      for (const i of [50, 100, 150, 200]) {
        expect(psiSq[i]).toBeCloseTo(psiSq[n - 1 - i], 4)
      }
      // Minimum (node) near x=0 — value much smaller than peak
      const peak = Math.max(...psiSq)
      const nearZero = Math.min(psiSq[n / 2 - 1], psiSq[n / 2])
      expect(nearZero).toBeLessThan(peak * 0.01)
    }
  })

  it('j=2 state is symmetric with centre peak (even ψ, two nodes)', () => {
    const xArr = makeXArr(1.0)
    const n = xArr.length
    for (const N of [3, 4, 5]) {
      const psiSq = ptBoundPsiSqArray(xArr, N, 2, 1.0)
      // Symmetric
      for (const i of [50, 100, 150]) {
        expect(psiSq[i]).toBeCloseTo(psiSq[n - 1 - i], 4)
      }
      // Centre lobe is non-zero (ψ is even: central peak exists)
      const centreVal = (psiSq[n / 2 - 1] + psiSq[n / 2]) / 2
      expect(centreVal).toBeGreaterThan(0)
    }
  })

  it('scales correctly with α (narrower for larger α)', () => {
    const xArr = makeXArr(1.0)
    const psi1 = ptBoundPsiSqArray(xArr, 2, 0, 1.0)
    const psi2 = ptBoundPsiSqArray(xArr, 2, 0, 2.0)
    // With larger α, peak is higher (wavefunction more confined)
    const peak1 = Math.max(...psi1)
    const peak2 = Math.max(...psi2)
    expect(peak2).toBeGreaterThan(peak1)
  })
})
