import { describe, it, expect } from 'vitest'
import {
  MU_B,
  hydrogenEnergy,
  zeemanShift,
  zeemanEnergy,
  zeemanSublevels,
  zeemanAllowed,
  polarization,
  zeemanTriplet,
} from '../physics/hydrogen'

describe('MU_B', () => {
  it('Bohr magneton in atomic units = 1/2', () => {
    expect(MU_B).toBeCloseTo(0.5, 10)
  })
})

describe('zeemanShift', () => {
  it('zero for any m_l at B=0', () => {
    expect(zeemanShift(1, 0)).toBeCloseTo(0, 10)
    expect(zeemanShift(-2, 0)).toBeCloseTo(0, 10)
    expect(zeemanShift(0, 0)).toBeCloseTo(0, 10)
  })
  it('zero for m_l=0 at any B', () => {
    expect(zeemanShift(0, 0.5)).toBe(0)
    expect(zeemanShift(0, 3.0)).toBe(0)
  })
  it('= μ_B · B · m_l = B · m_l / 2', () => {
    expect(zeemanShift(1, 2)).toBeCloseTo(1.0, 10)    // 0.5 * 2 * 1
    expect(zeemanShift(2, 1)).toBeCloseTo(1.0, 10)    // 0.5 * 1 * 2
    expect(zeemanShift(3, 0.4)).toBeCloseTo(0.6, 10)  // 0.5 * 0.4 * 3
    expect(zeemanShift(-1, 0.2)).toBeCloseTo(-0.1, 10) // 0.5 * 0.2 * (-1)
  })
  it('antisymmetric in m_l: shift(-m_l, B) = -shift(m_l, B)', () => {
    expect(zeemanShift(-1, 1.2)).toBeCloseTo(-zeemanShift(1, 1.2), 10)
    expect(zeemanShift(-3, 0.5)).toBeCloseTo(-zeemanShift(3, 0.5), 10)
  })
})

describe('zeemanEnergy', () => {
  it('equals hydrogenEnergy at B=0 for any m_l', () => {
    expect(zeemanEnergy(1, 1, 0, 0)).toBeCloseTo(hydrogenEnergy(1, 1), 10)
    expect(zeemanEnergy(2, 1, 1, 0)).toBeCloseTo(hydrogenEnergy(2, 1), 10)
    expect(zeemanEnergy(3, 1, -2, 0)).toBeCloseTo(hydrogenEnergy(3, 1), 10)
  })
  it('m_l=0 sublevel energy unchanged by B', () => {
    expect(zeemanEnergy(2, 1, 0, 1.0)).toBeCloseTo(hydrogenEnergy(2, 1), 10)
    expect(zeemanEnergy(3, 1, 0, 0.5)).toBeCloseTo(hydrogenEnergy(3, 1), 10)
  })
  it('m_l > 0: energy rises with B', () => {
    const base = hydrogenEnergy(2, 1)
    expect(zeemanEnergy(2, 1, 1, 0.2)).toBeGreaterThan(base)
  })
  it('m_l < 0: energy falls with B', () => {
    const base = hydrogenEnergy(2, 1)
    expect(zeemanEnergy(2, 1, -1, 0.2)).toBeLessThan(base)
  })
  it('exact formula: E = −Z²/(2n²) + μ_B · B · m_l', () => {
    // n=2, Z=1, ml=+1, B=1: −0.125 + 0.5 = 0.375
    expect(zeemanEnergy(2, 1, 1, 1)).toBeCloseTo(0.375, 10)
    // n=2, Z=1, ml=−1, B=1: −0.125 − 0.5 = −0.625
    expect(zeemanEnergy(2, 1, -1, 1)).toBeCloseTo(-0.625, 10)
    // n=3, Z=2, ml=+2, B=0.1: −4/18 + 0.5*0.1*2 = −0.2222 + 0.1 = −0.1222
    expect(zeemanEnergy(3, 2, 2, 0.1)).toBeCloseTo(-4 / 18 + 0.1, 8)
  })
})

describe('zeemanSublevels', () => {
  it('returns 2l+1 sublevels', () => {
    expect(zeemanSublevels(1, 0, 1, 0)).toHaveLength(1)  // l=0
    expect(zeemanSublevels(2, 1, 1, 0)).toHaveLength(3)  // l=1
    expect(zeemanSublevels(3, 2, 1, 0)).toHaveLength(5)  // l=2
    expect(zeemanSublevels(4, 3, 1, 0)).toHaveLength(7)  // l=3
  })
  it('1s (l=0): single sublevel with m_l=0, shift=0 at any B', () => {
    const subs = zeemanSublevels(1, 0, 1, 2.0)
    expect(subs).toHaveLength(1)
    expect(subs[0].ml).toBe(0)
    expect(subs[0].shift).toBeCloseTo(0, 10)
    expect(subs[0].energy).toBeCloseTo(hydrogenEnergy(1, 1), 10)
  })
  it('2p sublevels at B=0: all degenerate at E_2', () => {
    const subs = zeemanSublevels(2, 1, 1, 0)
    for (const s of subs) expect(s.energy).toBeCloseTo(hydrogenEnergy(2, 1), 10)
  })
  it('2p sublevels at B=0.2: spacing = μ_B · B = 0.1 between adjacent m_l', () => {
    const subs = zeemanSublevels(2, 1, 1, 0.2)
    const sorted = [...subs].sort((a, b) => a.ml - b.ml)
    expect(sorted[1].energy - sorted[0].energy).toBeCloseTo(0.1, 8)  // 0.5 * 0.2 = 0.1
    expect(sorted[2].energy - sorted[1].energy).toBeCloseTo(0.1, 8)
  })
  it('m_l values are exactly −l, …, +l', () => {
    const subs = zeemanSublevels(3, 2, 1, 0.1)
    expect(subs.map(s => s.ml)).toEqual([-2, -1, 0, 1, 2])
  })
  it('shifts antisymmetric: shift(m_l) = −shift(−m_l)', () => {
    const subs = zeemanSublevels(3, 2, 1, 0.3)
    const m2    = subs.find(s => s.ml ===  2)!
    const mNeg2 = subs.find(s => s.ml === -2)!
    expect(m2.shift).toBeCloseTo(-mNeg2.shift, 10)
  })
  it('energy and shift fields consistent: energy = hydrogenEnergy + shift', () => {
    const subs = zeemanSublevels(3, 2, 1, 0.25)
    const base = hydrogenEnergy(3, 1)
    for (const s of subs) {
      expect(s.energy).toBeCloseTo(base + s.shift, 10)
    }
  })
})

describe('zeemanAllowed', () => {
  it('|Δl|=1, |Δm_l|=0 are allowed', () => {
    expect(zeemanAllowed( 1, 0)).toBe(true)
    expect(zeemanAllowed(-1, 0)).toBe(true)
  })
  it('|Δl|=1, |Δm_l|=1 are allowed', () => {
    expect(zeemanAllowed( 1,  1)).toBe(true)
    expect(zeemanAllowed(-1, -1)).toBe(true)
    expect(zeemanAllowed( 1, -1)).toBe(true)
    expect(zeemanAllowed(-1,  1)).toBe(true)
  })
  it('Δl=0 is E1 forbidden', () => {
    expect(zeemanAllowed(0, 0)).toBe(false)
    expect(zeemanAllowed(0, 1)).toBe(false)
  })
  it('|Δm_l|=2 is forbidden', () => {
    expect(zeemanAllowed( 1, 2)).toBe(false)
    expect(zeemanAllowed(-1, -2)).toBe(false)
  })
  it('|Δl|=2 is forbidden', () => {
    expect(zeemanAllowed( 2, 0)).toBe(false)
    expect(zeemanAllowed(-2, 1)).toBe(false)
  })
})

describe('polarization', () => {
  it('deltaMl = +1 → sigma+', () => expect(polarization( 1)).toBe('sigma+'))
  it('deltaMl =  0 → pi',     () => expect(polarization( 0)).toBe('pi'))
  it('deltaMl = −1 → sigma-', () => expect(polarization(-1)).toBe('sigma-'))
})

describe('zeemanTriplet', () => {
  it('returns exactly 3 components', () => {
    expect(zeemanTriplet(2, 1, 1, 0.1)).toHaveLength(3)
  })

  it('all three components merge to same energy at B=0', () => {
    const triplet = zeemanTriplet(2, 1, 1, 0)
    const dE0 = triplet[0].dE
    for (const c of triplet) expect(c.dE).toBeCloseTo(dE0, 10)
  })

  it('π component equals unperturbed transition energy ΔE₀ at any B', () => {
    const dE0 = hydrogenEnergy(2, 1) - hydrogenEnergy(1, 1)  // 0.375 Hartree
    const triplet = zeemanTriplet(2, 1, 1, 0.5)
    const pi = triplet.find(t => t.pol === 'pi')!
    expect(pi.dE).toBeCloseTo(dE0, 10)
  })

  it('ordering: σ+ > π > σ− at B > 0', () => {
    const triplet = zeemanTriplet(2, 1, 1, 0.2)
    const sp = triplet.find(t => t.pol === 'sigma+')!.dE
    const pi = triplet.find(t => t.pol === 'pi')!.dE
    const sm = triplet.find(t => t.pol === 'sigma-')!.dE
    expect(sp).toBeGreaterThan(pi)
    expect(pi).toBeGreaterThan(sm)
  })

  it('σ± symmetric about π: dE(σ+) − dE(π) = dE(π) − dE(σ−) = μ_B · B', () => {
    const B = 0.3
    const triplet = zeemanTriplet(3, 2, 1, B)
    const sp = triplet.find(t => t.pol === 'sigma+')!.dE
    const pi = triplet.find(t => t.pol === 'pi')!.dE
    const sm = triplet.find(t => t.pol === 'sigma-')!.dE
    expect(sp - pi).toBeCloseTo(MU_B * B, 10)
    expect(pi - sm).toBeCloseTo(MU_B * B, 10)
  })

  it('deltaMl values are +1, 0, −1 for σ+, π, σ−', () => {
    const triplet = zeemanTriplet(2, 1, 1, 0.1)
    expect(triplet.find(t => t.pol === 'sigma+')!.deltaMl).toBe( 1)
    expect(triplet.find(t => t.pol === 'pi')!.deltaMl).toBe(     0)
    expect(triplet.find(t => t.pol === 'sigma-')!.deltaMl).toBe(-1)
  })

  it('scales with Z: 2p→1s for He+ (Z=2), π = ΔE₀ = 1.5 Hartree', () => {
    const dE0 = hydrogenEnergy(2, 2) - hydrogenEnergy(1, 2)  // −0.5 − (−2) = 1.5
    expect(dE0).toBeCloseTo(1.5, 10)
    const triplet = zeemanTriplet(2, 1, 2, 0.2)
    expect(triplet.find(t => t.pol === 'pi')!.dE).toBeCloseTo(dE0, 10)
  })

  it('splitting = μ_B · B independent of transition (n, l)', () => {
    const B = 0.15
    for (const [nHi, nLo] of [[2, 1], [3, 2], [4, 1]]) {
      const triplet = zeemanTriplet(nHi, nLo, 1, B)
      const sp = triplet.find(t => t.pol === 'sigma+')!.dE
      const pi = triplet.find(t => t.pol === 'pi')!.dE
      expect(sp - pi).toBeCloseTo(MU_B * B, 10)
    }
  })
})
