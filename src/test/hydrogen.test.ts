import { describe, it, expect } from 'vitest'
import {
  hydrogenEnergy,
  meanRadius,
  assocLaguerre,
  radialWavefunction,
  radialDensity,
  radialNodes,
  orbitalDensity2D,
  orbitalDensity3D,
} from '../physics/hydrogen'

// Numerical integral ∫₀^∞ f(r) dr via trapezoidal rule on [0, r_max]
function integrate(f: (r: number) => number, rMax: number, n = 4000): number {
  const dr = rMax / n
  let sum = 0
  for (let i = 0; i <= n; i++) {
    const r = i * dr
    const w = i === 0 || i === n ? 0.5 : 1
    sum += w * f(r)
  }
  return sum * dr
}

describe('hydrogenEnergy', () => {
  it('ground state Z=1: E_1 = -0.5', () => {
    expect(hydrogenEnergy(1, 1)).toBeCloseTo(-0.5, 10)
  })
  it('E_2 = -0.125 (Z=1)', () => {
    expect(hydrogenEnergy(2, 1)).toBeCloseTo(-0.125, 10)
  })
  it('E_n scales as -Z²/(2n²)', () => {
    expect(hydrogenEnergy(3, 2)).toBeCloseTo(-4 / (2 * 9), 10)
  })
  it('E_1 for He+ (Z=2) = -2.0', () => {
    expect(hydrogenEnergy(1, 2)).toBeCloseTo(-2.0, 10)
  })
})

describe('meanRadius', () => {
  it('⟨r⟩_10 = 3/2 (Z=1, n=1, l=0)', () => {
    expect(meanRadius(1, 0, 1)).toBeCloseTo(1.5, 10)
  })
  it('⟨r⟩_21 = 5 (Z=1, n=2, l=1)', () => {
    // (3*4 - 1*2)/(2*1) = 10/2 = 5
    expect(meanRadius(2, 1, 1)).toBeCloseTo(5, 10)
  })
  it('⟨r⟩_20 = 6 (Z=1, n=2, l=0)', () => {
    // (3*4 - 0)/(2*1) = 12/2 = 6
    expect(meanRadius(2, 0, 1)).toBeCloseTo(6, 10)
  })
  it('scales inversely with Z', () => {
    expect(meanRadius(1, 0, 2)).toBeCloseTo(meanRadius(1, 0, 1) / 2, 10)
  })
})

describe('assocLaguerre', () => {
  // L_n^alpha(x)
  it('L_0^0(x) = 1', () => {
    expect(assocLaguerre(0, 0, 0)).toBeCloseTo(1, 10)
    expect(assocLaguerre(0, 0, 3)).toBeCloseTo(1, 10)
  })
  it('L_1^0(x) = 1 - x', () => {
    expect(assocLaguerre(1, 0, 0)).toBeCloseTo(1, 10)
    expect(assocLaguerre(1, 0, 1)).toBeCloseTo(0, 10)
    expect(assocLaguerre(1, 0, 2)).toBeCloseTo(-1, 10)
  })
  it('L_2^0(x) = 1 - 2x + x²/2', () => {
    expect(assocLaguerre(2, 0, 0)).toBeCloseTo(1, 10)
    expect(assocLaguerre(2, 0, 2)).toBeCloseTo(1 - 4 + 2, 10)   // -1
  })
  it('L_1^1(x) = 2 - x', () => {
    // L_1^alpha(x) = 1 + alpha - x
    expect(assocLaguerre(1, 1, 0)).toBeCloseTo(2, 10)
    expect(assocLaguerre(1, 1, 2)).toBeCloseTo(0, 10)
  })
  it('L_2^1(x): three-term recurrence check at x=0 equals (n+alpha choose n) = (3 choose 2) = 3', () => {
    // L_2^1(0) = 3
    expect(assocLaguerre(2, 1, 0)).toBeCloseTo(3, 10)
  })
})

describe('radialWavefunction R_nl', () => {
  it('R_10(0) = 2 * Z^(3/2) for Z=1', () => {
    // For n=1, l=0: R_10(r) = 2 exp(-r), R_10(0) = 2
    expect(radialWavefunction(1, 0, 0, 1)).toBeCloseTo(2, 8)
  })
  it('R_10(0) scales as Z^(3/2)', () => {
    expect(radialWavefunction(1, 0, 0, 2)).toBeCloseTo(2 * Math.pow(2, 1.5), 8)
  })
  it('R_20(r) has one radial node', () => {
    // Node at r = 2a₀ for n=2,l=0,Z=1
    // R_20(2) = 0: R_20(r) = (1/√2)(1 - r/2)exp(-r/2), node at r=2
    const r20_near2 = radialWavefunction(2, 0, 2, 1)
    expect(Math.abs(r20_near2)).toBeLessThan(0.01)
  })
  it('R_nl with l=n-1 (no radial nodes) is non-zero and positive at r=n²/Z', () => {
    const r = 4 / 1  // n=2, l=1, peak around r=4
    expect(radialWavefunction(2, 1, r, 1)).toBeGreaterThan(0)
  })
})

describe('radialDensity P(r) = r² R_nl²', () => {
  it('P(r) ≥ 0 everywhere for several states', () => {
    const states = [[1, 0], [2, 1], [3, 2]]
    for (const [n, l] of states) {
      for (let r = 0; r <= 20; r += 0.5) {
        expect(radialDensity(n, l, r, 1)).toBeGreaterThanOrEqual(0)
      }
    }
  })
  it('norm ∫₀^∞ P(r) dr = 1 for (1,0)', () => {
    const norm = integrate(r => radialDensity(1, 0, r, 1), 30)
    expect(norm).toBeCloseTo(1, 3)
  })
  it('norm = 1 for (2,0)', () => {
    const norm = integrate(r => radialDensity(2, 0, r, 1), 50)
    expect(norm).toBeCloseTo(1, 3)
  })
  it('norm = 1 for (2,1)', () => {
    const norm = integrate(r => radialDensity(2, 1, r, 1), 50)
    expect(norm).toBeCloseTo(1, 3)
  })
  it('norm = 1 for (3,2)', () => {
    const norm = integrate(r => radialDensity(3, 2, r, 1), 80)
    expect(norm).toBeCloseTo(1, 3)
  })
  it('norm = 1 for (4,3)', () => {
    const norm = integrate(r => radialDensity(4, 3, r, 1), 150)
    expect(norm).toBeCloseTo(1, 3)
  })
  it('norm = 1 for (5,4)', () => {
    const norm = integrate(r => radialDensity(5, 4, r, 1), 250)
    expect(norm).toBeCloseTo(1, 3)
  })
})

describe('radialNodes', () => {
  it('1s has 0 radial nodes', () => {
    expect(radialNodes(1, 0)).toBe(0)
  })
  it('2s has 1 radial node', () => {
    expect(radialNodes(2, 0)).toBe(1)
  })
  it('2p has 0 radial nodes', () => {
    expect(radialNodes(2, 1)).toBe(0)
  })
  it('3d has 0 radial nodes', () => {
    expect(radialNodes(3, 2)).toBe(0)
  })
  it('3s has 2 radial nodes', () => {
    expect(radialNodes(3, 0)).toBe(2)
  })
  it('5s has 4 radial nodes', () => {
    expect(radialNodes(5, 0)).toBe(4)
  })
})

describe('Quantum number validity (sanity checks)', () => {
  it('all states n=1..4, l=0..n-1 norm to 1', () => {
    for (let n = 1; n <= 4; n++) {
      for (let l = 0; l < n; l++) {
        const rMax = 2 * n * n * (n + 3)
        const norm = integrate(r => radialDensity(n, l, r, 1), rMax)
        expect(norm).toBeCloseTo(1, 2)
      }
    }
  })
})

describe('orbitalDensity2D (xz cross-section)', () => {
  it('1s: density at origin is non-zero (maximum for s orbitals)', () => {
    const atOrigin = orbitalDensity2D(1, 0, 0, 0, 0, 1)
    expect(atOrigin).toBeGreaterThan(0)
    // should equal R_10(0)²/(4π) = 4/(4π) = 1/π
    const expected = radialWavefunction(1, 0, 0, 1) ** 2 / (4 * Math.PI)
    expect(atOrigin).toBeCloseTo(expected, 6)
  })

  it('2p (l=1): density at origin is zero', () => {
    expect(orbitalDensity2D(2, 1, 0, 0, 0, 1)).toBeCloseTo(0, 10)
  })

  it('m=+1 and m=-1 give different densities in xz-plane (not identical)', () => {
    const x = 1.5, z = 0.5
    const plus1  = orbitalDensity2D(2, 1,  1, x, z, 1)
    const minus1 = orbitalDensity2D(2, 1, -1, x, z, 1)
    expect(plus1).toBeGreaterThan(0)
    expect(minus1).toBeCloseTo(0, 8)  // m<0 sin-type → zero in xz-plane (y=0)
  })

  it('m=0 orbital is symmetric in x (left-right symmetric in xz-plane)', () => {
    const z = 2.0, x = 1.5
    const right = orbitalDensity2D(2, 1, 0,  x, z, 1)
    const left  = orbitalDensity2D(2, 1, 0, -x, z, 1)
    expect(right).toBeCloseTo(left, 8)
  })

  it('equals orbitalDensity3D at y=0 for several points and states', () => {
    const cases: [number, number, number, number, number][] = [
      [1, 0,  0, 0.5, 0.3],
      [2, 1,  1, 1.0, 2.0],
      [2, 1,  0, 1.5, 1.0],
      [3, 2,  2, 2.0, 1.5],
      [3, 1, -1, 1.0, 1.0],
    ]
    for (const [n, l, m, x, z] of cases) {
      const d2d = orbitalDensity2D(n, l, m, x, z, 1)
      const d3d = orbitalDensity3D(n, l, m, x, 0, z, 1)
      expect(d2d).toBeCloseTo(d3d, 10)
    }
  })
})
