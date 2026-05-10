import { describe, it, expect } from 'vitest'
import {
  landeG, jTerms, mJValues,
  anomalousZeemanEnergy, anomalousSublevels,
  anomalousAllowed, anomalousZeemanLines,
  MU_B, hydrogenEnergy,
} from '../physics/hydrogen'

describe('landeG', () => {
  it('L=0, J=½, S=½: pure spin → g=2', () => {
    expect(landeG(0.5, 0, 0.5)).toBeCloseTo(2, 10)
  })
  it('L=1, J=½, S=½: g=2/3', () => {
    expect(landeG(0.5, 1, 0.5)).toBeCloseTo(2 / 3, 10)
  })
  it('L=1, J=3/2, S=½: g=4/3', () => {
    expect(landeG(1.5, 1, 0.5)).toBeCloseTo(4 / 3, 10)
  })
  it('L=2, J=3/2, S=½: g=4/5', () => {
    expect(landeG(1.5, 2, 0.5)).toBeCloseTo(4 / 5, 10)
  })
  it('L=2, J=5/2, S=½: g=6/5', () => {
    expect(landeG(2.5, 2, 0.5)).toBeCloseTo(6 / 5, 10)
  })
  it('L=3, J=5/2, S=½: g=6/7', () => {
    // g = 1 + (35/4 + 3/4 - 12) / (35/2) = 1 + (38/4 - 48/4) / (35/2) = 1 - 10/70 = 1 - 1/7 = 6/7
    expect(landeG(2.5, 3, 0.5)).toBeCloseTo(6 / 7, 10)
  })
  it('S=0: g=1 for any L (normal Zeeman orbital g-factor)', () => {
    expect(landeG(1, 1, 0)).toBeCloseTo(1, 10)
    expect(landeG(2, 2, 0)).toBeCloseTo(1, 10)
  })
  it('J=0: g=0', () => {
    expect(landeG(0, 0, 0)).toBe(0)
  })
  it('upper term g > lower term g for same L', () => {
    // J = L+½ always has larger g than J = L−½
    for (let L = 1; L <= 3; L++) {
      expect(landeG(L + 0.5, L, 0.5)).toBeGreaterThan(landeG(L - 0.5, L, 0.5))
    }
  })
})

describe('jTerms', () => {
  it('L=0: [½]', () => {
    expect(jTerms(0)).toEqual([0.5])
  })
  it('L=1: [½, 3/2]', () => {
    expect(jTerms(1)).toEqual([0.5, 1.5])
  })
  it('L=2: [3/2, 5/2]', () => {
    expect(jTerms(2)).toEqual([1.5, 2.5])
  })
  it('L=3: [5/2, 7/2]', () => {
    expect(jTerms(3)).toEqual([2.5, 3.5])
  })
  it('always 2 values for L > 0', () => {
    for (let L = 1; L <= 4; L++) expect(jTerms(L)).toHaveLength(2)
  })
  it('J values differ by exactly 1', () => {
    for (let L = 1; L <= 4; L++) {
      const [Jlo, Jhi] = jTerms(L)
      expect(Jhi - Jlo).toBeCloseTo(1, 10)
    }
  })
  it('lower J = L−½, upper J = L+½', () => {
    for (let L = 1; L <= 4; L++) {
      const [Jlo, Jhi] = jTerms(L)
      expect(Jlo).toBeCloseTo(L - 0.5, 10)
      expect(Jhi).toBeCloseTo(L + 0.5, 10)
    }
  })
})

describe('mJValues', () => {
  it('J=½: [−½, +½]', () => {
    expect(mJValues(0.5)).toEqual([-0.5, 0.5])
  })
  it('J=3/2: [−3/2, −½, +½, +3/2]', () => {
    expect(mJValues(1.5)).toEqual([-1.5, -0.5, 0.5, 1.5])
  })
  it('J=5/2: 6 values, −5/2 to +5/2', () => {
    const vals = mJValues(2.5)
    expect(vals).toHaveLength(6)
    expect(vals[0]).toBeCloseTo(-2.5, 10)
    expect(vals[5]).toBeCloseTo(2.5, 10)
  })
  it('count is 2J+1', () => {
    expect(mJValues(0.5)).toHaveLength(2)
    expect(mJValues(1.5)).toHaveLength(4)
    expect(mJValues(2.5)).toHaveLength(6)
    expect(mJValues(3.5)).toHaveLength(8)
  })
  it('values are monotonically increasing in steps of 1', () => {
    const vals = mJValues(2.5)
    for (let i = 1; i < vals.length; i++) {
      expect(vals[i] - vals[i - 1]).toBeCloseTo(1, 10)
    }
  })
})

describe('anomalousZeemanEnergy', () => {
  it('B=0: equals hydrogenEnergy for any L, J, m_J', () => {
    expect(anomalousZeemanEnergy(2, 1, 1, 1.5, 0.5, 0)).toBeCloseTo(hydrogenEnergy(2, 1), 10)
    expect(anomalousZeemanEnergy(2, 1, 1, 0.5, -0.5, 0)).toBeCloseTo(hydrogenEnergy(2, 1), 10)
    expect(anomalousZeemanEnergy(1, 1, 0, 0.5, -0.5, 0)).toBeCloseTo(hydrogenEnergy(1, 1), 10)
  })
  it('exact: L=1, J=3/2, m_J=+3/2, B=0.1 → shift = (4/3)·μ_B·0.1·(3/2)', () => {
    const shift = (4 / 3) * MU_B * 0.1 * 1.5
    expect(anomalousZeemanEnergy(2, 1, 1, 1.5, 1.5, 0.1)).toBeCloseTo(hydrogenEnergy(2, 1) + shift, 10)
  })
  it('exact: L=0, J=½, m_J=+½, B=0.2 → shift = 2·μ_B·0.2·0.5 = 0.1', () => {
    expect(anomalousZeemanEnergy(1, 1, 0, 0.5, 0.5, 0.2)).toBeCloseTo(hydrogenEnergy(1, 1) + 0.1, 10)
  })
  it('antisymmetric in m_J: shift(+m_J) = −shift(−m_J)', () => {
    const base = hydrogenEnergy(2, 1)
    const ePos = anomalousZeemanEnergy(2, 1, 1, 1.5, 1.5, 0.2)
    const eNeg = anomalousZeemanEnergy(2, 1, 1, 1.5, -1.5, 0.2)
    expect(ePos - base).toBeCloseTo(-(eNeg - base), 10)
  })
  it('upper J (g=4/3) splits more than lower J (g=2/3) for L=1', () => {
    const B = 0.1
    const spread32 = anomalousZeemanEnergy(2, 1, 1, 1.5, 1.5, B) - anomalousZeemanEnergy(2, 1, 1, 1.5, -1.5, B)
    const spread12 = anomalousZeemanEnergy(2, 1, 1, 0.5, 0.5, B) - anomalousZeemanEnergy(2, 1, 1, 0.5, -0.5, B)
    expect(spread32).toBeGreaterThan(spread12)
  })
})

describe('anomalousSublevels', () => {
  it('L=0: 2 sublevels (J=½, m_J=±½)', () => {
    expect(anomalousSublevels(1, 0, 1, 0)).toHaveLength(2)
  })
  it('L=1: 6 sublevels (J=½: 2 + J=3/2: 4)', () => {
    expect(anomalousSublevels(2, 1, 1, 0)).toHaveLength(6)
  })
  it('L=2: 10 sublevels (J=3/2: 4 + J=5/2: 6)', () => {
    expect(anomalousSublevels(3, 2, 1, 0)).toHaveLength(10)
  })
  it('total count = 2·(2L+1) for all L', () => {
    for (let L = 0; L <= 3; L++) {
      expect(anomalousSublevels(L + 1, L, 1, 0)).toHaveLength(2 * (2 * L + 1))
    }
  })
  it('all degenerate at B=0', () => {
    const subs = anomalousSublevels(2, 1, 1, 0)
    const e0 = hydrogenEnergy(2, 1)
    for (const s of subs) expect(s.energy).toBeCloseTo(e0, 10)
  })
  it('g values: J=½ → g=2/3, J=3/2 → g=4/3 for L=1', () => {
    const subs = anomalousSublevels(2, 1, 1, 0)
    expect(subs.find(s => s.J === 0.5)!.g).toBeCloseTo(2 / 3, 10)
    expect(subs.find(s => s.J === 1.5)!.g).toBeCloseTo(4 / 3, 10)
  })
  it('L=0: g=2 (pure spin doublet)', () => {
    const subs = anomalousSublevels(1, 0, 1, 0)
    for (const s of subs) expect(s.g).toBeCloseTo(2, 10)
  })
  it('energy spread at B>0 is proportional to g_J·μ_B·B', () => {
    const B = 0.1
    const subs = anomalousSublevels(2, 1, 1, B)
    const s = subs.find(s => s.J === 1.5 && Math.abs(s.mJ - 1.5) < 0.01)!
    expect(s.energy - hydrogenEnergy(2, 1)).toBeCloseTo((4 / 3) * MU_B * B * 1.5, 10)
  })
})

describe('anomalousAllowed', () => {
  it('ΔL=0 forbidden', () => {
    expect(anomalousAllowed(0, 0.5, 0.5, 0)).toBe(false)
    expect(anomalousAllowed(0, 1.5, 1.5, 1)).toBe(false)
  })
  it('|ΔL|=2 forbidden', () => {
    expect(anomalousAllowed(2, 1.5, 0.5, 0)).toBe(false)
    expect(anomalousAllowed(-2, 0.5, 1.5, 0)).toBe(false)
  })
  it('|ΔJ|=2 forbidden', () => {
    expect(anomalousAllowed(1, 2.5, 0.5, 0)).toBe(false)
    expect(anomalousAllowed(-1, 0.5, 2.5, 0)).toBe(false)
  })
  it('|Δm_J|=2 forbidden', () => {
    expect(anomalousAllowed(1, 1.5, 0.5, 2)).toBe(false)
    expect(anomalousAllowed(1, 1.5, 0.5, -2)).toBe(false)
  })
  it('J=0↔J=0 forbidden', () => {
    expect(anomalousAllowed(1, 0, 0, 0)).toBe(false)
  })
  it('ΔL=±1, ΔJ=0, |Δm_J|≤1 allowed', () => {
    expect(anomalousAllowed(1, 1.5, 1.5, 0)).toBe(true)
    expect(anomalousAllowed(-1, 0.5, 0.5, 1)).toBe(true)
    expect(anomalousAllowed(1, 0.5, 0.5, -1)).toBe(true)
  })
  it('ΔL=±1, |ΔJ|=1, |Δm_J|≤1 allowed', () => {
    expect(anomalousAllowed(1, 1.5, 0.5, 0)).toBe(true)
    expect(anomalousAllowed(-1, 0.5, 1.5, -1)).toBe(true)
    expect(anomalousAllowed(1, 0.5, 1.5, 1)).toBe(true)
  })
})

describe('anomalousZeemanLines', () => {
  it('2p→1s: exactly 10 allowed transitions', () => {
    expect(anomalousZeemanLines(2, 1, 1, 0, 1, 0.1)).toHaveLength(10)
  })
  it('2p→1s: 3 σ+ (Δm_J=+1), 4 π (Δm_J=0), 3 σ− (Δm_J=−1)', () => {
    const lines = anomalousZeemanLines(2, 1, 1, 0, 1, 0.1)
    expect(lines.filter(l => l.dMJ ===  1)).toHaveLength(3)
    expect(lines.filter(l => l.dMJ ===  0)).toHaveLength(4)
    expect(lines.filter(l => l.dMJ === -1)).toHaveLength(3)
  })
  it('2p→1s: all 10 energies distinct at B>0', () => {
    const lines = anomalousZeemanLines(2, 1, 1, 0, 1, 0.1)
    const unique = new Set(lines.map(l => l.dE.toFixed(8)))
    expect(unique.size).toBe(10)
  })
  it('all lines merge to ΔE_0 at B=0 (no fine structure assumed)', () => {
    const lines = anomalousZeemanLines(2, 1, 1, 0, 1, 0)
    const dE0 = hydrogenEnergy(2, 1) - hydrogenEnergy(1, 1)
    for (const l of lines) expect(l.dE).toBeCloseTo(dE0, 10)
  })
  it('σ+ and σ− patterns antisymmetric about ΔE_0', () => {
    const lines = anomalousZeemanLines(2, 1, 1, 0, 1, 0.2)
    const dE0 = hydrogenEnergy(2, 1) - hydrogenEnergy(1, 1)
    const sp = lines.filter(l => l.dMJ ===  1).map(l => l.dE - dE0).sort((a, b) => a - b)
    const sm = lines.filter(l => l.dMJ === -1).map(l => l.dE - dE0).sort((a, b) => a - b)
    for (let i = 0; i < sp.length; i++) {
      expect(sp[i]).toBeCloseTo(-sm[sm.length - 1 - i], 8)
    }
  })
  it('more lines than normal Zeeman triplet (10 > 3) for 2p→1s', () => {
    expect(anomalousZeemanLines(2, 1, 1, 0, 1, 0.1).length).toBeGreaterThan(3)
  })
  it('scales with Z: He+ (Z=2) 2p→1s, all collapse to 1.5 Hartree at B=0', () => {
    const lines = anomalousZeemanLines(2, 1, 1, 0, 2, 0)
    const dE0 = hydrogenEnergy(2, 2) - hydrogenEnergy(1, 2)
    expect(dE0).toBeCloseTo(1.5, 10)
    for (const l of lines) expect(l.dE).toBeCloseTo(dE0, 10)
  })
  it('sorted by ascending dE', () => {
    const lines = anomalousZeemanLines(2, 1, 1, 0, 1, 0.15)
    for (let i = 1; i < lines.length; i++) {
      expect(lines[i].dE).toBeGreaterThanOrEqual(lines[i - 1].dE - 1e-12)
    }
  })
  it('specific line energies for 2p→1s at B=0.2: offsets in units of μ_B·B = ±1, ±4/3, ±5/3', () => {
    const B = 0.2
    const mu = MU_B * B
    const lines = anomalousZeemanLines(2, 1, 1, 0, 1, B)
    const dE0 = hydrogenEnergy(2, 1) - hydrogenEnergy(1, 1)
    const offsets = lines.map(l => (l.dE - dE0) / mu).map(v => Math.round(v * 30) / 30)
    expect(offsets).toContain(-5 / 3)
    expect(offsets).toContain(-4 / 3)
    expect(offsets).toContain(-1)
    expect(offsets).toContain(1)
    expect(offsets).toContain(4 / 3)
    expect(offsets).toContain(5 / 3)
  })
  it('2p→1s at B=0.3 a.u.: all 10 lines have positive photon energy', () => {
    const lines = anomalousZeemanLines(2, 1, 1, 0, 1, 0.3)
    expect(lines).toHaveLength(10)
    for (const l of lines) expect(l.dE).toBeGreaterThan(0)
  })
  it('high-n small-gap (5g→4f) at B=0.3 a.u.: some lines have negative dE — must be filtered in UI', () => {
    const lines = anomalousZeemanLines(5, 4, 4, 3, 1, 0.3)
    const negative = lines.filter(l => l.dE <= 0)
    expect(negative.length).toBeGreaterThan(0)
  })
  it('lineCount (positive dE only) < totalAllowed for high-n at large B', () => {
    const lines = anomalousZeemanLines(5, 4, 4, 3, 1, 0.3)
    const visible = lines.filter(l => l.dE > 0).length
    expect(visible).toBeLessThan(lines.length)
  })
})
