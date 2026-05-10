import { describe, it, expect } from 'vitest'
import {
  hydrogenEnergy,
  starkLinearShift,
  starkN2Sublevels,
  starkIonizationField,
} from '../physics/hydrogen'

// ─── starkLinearShift ──────────────────────────────────────────────────────────

describe('starkLinearShift', () => {
  it('zero for any (n, n1, n2) when F=0', () => {
    expect(starkLinearShift(2, 1, 0, 0, 1)).toBeCloseTo(0, 10)
    expect(starkLinearShift(2, 0, 1, 0, 1)).toBeCloseTo(0, 10)
    expect(starkLinearShift(3, 2, 0, 0, 1)).toBeCloseTo(0, 10)
  })

  it('zero when n1 = n2 (symmetric parabolic state) at any F', () => {
    expect(starkLinearShift(3, 1, 1, 0.5, 1)).toBeCloseTo(0, 10)
    expect(starkLinearShift(4, 0, 0, 0.3, 1)).toBeCloseTo(0, 10)
  })

  it('negative for n1 > n2 at F > 0 (downward-displaced state, lower energy)', () => {
    expect(starkLinearShift(2, 1, 0, 0.01, 1)).toBeLessThan(0)
    expect(starkLinearShift(3, 2, 0, 0.01, 1)).toBeLessThan(0)
  })

  it('positive for n1 < n2 at F > 0 (upward-displaced state, higher energy)', () => {
    expect(starkLinearShift(2, 0, 1, 0.01, 1)).toBeGreaterThan(0)
    expect(starkLinearShift(3, 0, 2, 0.01, 1)).toBeGreaterThan(0)
  })

  it('antisymmetric: shift(n,n1,n2,F,Z) = −shift(n,n2,n1,F,Z)', () => {
    const F = 0.02
    expect(starkLinearShift(2, 1, 0, F, 1)).toBeCloseTo(-starkLinearShift(2, 0, 1, F, 1), 12)
    expect(starkLinearShift(3, 2, 1, F, 1)).toBeCloseTo(-starkLinearShift(3, 1, 2, F, 1), 12)
  })

  it('exact value: n=2, n1=1, n2=0, F=1, Z=1 → −3', () => {
    // ΔE = −(3/2)(2)(1)(1)/1 = −3
    expect(starkLinearShift(2, 1, 0, 1, 1)).toBeCloseTo(-3, 10)
  })

  it('exact value: n=2, n1=0, n2=1, F=0.01, Z=1 → +0.03', () => {
    // ΔE = −(3/2)(2)(−1)(0.01)/1 = +0.03
    expect(starkLinearShift(2, 0, 1, 0.01, 1)).toBeCloseTo(0.03, 10)
  })

  it('Z scaling: doubling Z halves the shift magnitude', () => {
    const F = 0.05
    const shiftZ1 = starkLinearShift(2, 1, 0, F, 1)
    const shiftZ2 = starkLinearShift(2, 1, 0, F, 2)
    expect(shiftZ1 / shiftZ2).toBeCloseTo(2, 10)
  })

  it('n scaling: larger n gives larger shift for same (n1−n2)', () => {
    // n=3, n1=1,n2=0: ΔE = −(3/2)(3)(1)F = −4.5F
    // n=2, n1=1,n2=0: ΔE = −(3/2)(2)(1)F = −3F
    const F = 0.01
    const sh3 = Math.abs(starkLinearShift(3, 1, 0, F, 1))
    const sh2 = Math.abs(starkLinearShift(2, 1, 0, F, 1))
    expect(sh3).toBeGreaterThan(sh2)
  })

  it('linear in F: doubling F doubles the shift', () => {
    const sh1 = starkLinearShift(2, 1, 0, 0.01, 1)
    const sh2 = starkLinearShift(2, 1, 0, 0.02, 1)
    expect(sh2 / sh1).toBeCloseTo(2, 10)
  })
})

// ─── starkN2Sublevels ─────────────────────────────────────────────────────────

describe('starkN2Sublevels', () => {
  it('returns exactly 4 levels', () => {
    expect(starkN2Sublevels(0, 1)).toHaveLength(4)
    expect(starkN2Sublevels(0.01, 1)).toHaveLength(4)
  })

  it('at F=0 all 4 levels degenerate at E₂', () => {
    const E2 = hydrogenEnergy(2, 1)
    const levels = starkN2Sublevels(0, 1)
    for (const lv of levels) {
      expect(lv.energy).toBeCloseTo(E2, 10)
      expect(lv.shift).toBeCloseTo(0, 10)
    }
  })

  it('at F>0 two levels are shifted ±3F/Z and two are unshifted', () => {
    const F = 0.02
    const Z = 1
    const levels = starkN2Sublevels(F, Z)
    const shifts = levels.map(lv => lv.shift).sort((a, b) => a - b)
    // Sorted ascending: −3F/Z, 0, 0, +3F/Z
    expect(shifts[0]).toBeCloseTo(-3 * F / Z, 10)
    expect(shifts[1]).toBeCloseTo(0, 10)
    expect(shifts[2]).toBeCloseTo(0, 10)
    expect(shifts[3]).toBeCloseTo(+3 * F / Z, 10)
  })

  it('levels are sorted ascending by energy', () => {
    const levels = starkN2Sublevels(0.02, 1)
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i].energy).toBeGreaterThanOrEqual(levels[i - 1].energy)
    }
  })

  it('m=±1 levels always have shift = 0', () => {
    const F = 0.05
    const levels = starkN2Sublevels(F, 1)
    const mPm1 = levels.filter(lv => Math.abs(lv.m) === 1)
    expect(mPm1).toHaveLength(2)
    for (const lv of mPm1) expect(lv.shift).toBeCloseTo(0, 10)
  })

  it('n1=1,n2=0,m=0 level has shift = −3F/Z', () => {
    const F = 0.01
    const Z = 1
    const levels = starkN2Sublevels(F, Z)
    const lv = levels.find(l => l.n1 === 1 && l.n2 === 0 && l.m === 0)!
    expect(lv).toBeDefined()
    expect(lv.shift).toBeCloseTo(-3 * F / Z, 10)
  })

  it('n1=0,n2=1,m=0 level has shift = +3F/Z', () => {
    const F = 0.01
    const Z = 1
    const levels = starkN2Sublevels(F, Z)
    const lv = levels.find(l => l.n1 === 0 && l.n2 === 1 && l.m === 0)!
    expect(lv).toBeDefined()
    expect(lv.shift).toBeCloseTo(+3 * F / Z, 10)
  })

  it('energy = hydrogenEnergy(2, Z) + shift for every level', () => {
    const F = 0.02
    const Z = 1
    const E2 = hydrogenEnergy(2, Z)
    for (const lv of starkN2Sublevels(F, Z)) {
      expect(lv.energy).toBeCloseTo(E2 + lv.shift, 10)
    }
  })

  it('energy fields consistent with starkLinearShift', () => {
    const F = 0.015
    const Z = 2
    const E2 = hydrogenEnergy(2, Z)
    const levels = starkN2Sublevels(F, Z)
    for (const lv of levels) {
      const expected = E2 + starkLinearShift(2, lv.n1, lv.n2, F, Z)
      expect(lv.energy).toBeCloseTo(expected, 10)
    }
  })

  it('parabolic quantum numbers satisfy n1+n2+|m|=1 for every level', () => {
    const levels = starkN2Sublevels(0.01, 1)
    for (const lv of levels) {
      expect(lv.n1 + lv.n2 + Math.abs(lv.m)).toBe(1)
    }
  })

  it('total splitting between highest and lowest levels = 6F/Z', () => {
    const F = 0.025
    const Z = 1
    const levels = starkN2Sublevels(F, Z)
    const top    = levels[levels.length - 1].energy
    const bottom = levels[0].energy
    expect(top - bottom).toBeCloseTo(6 * F / Z, 10)
  })

  it('Z=2 gives half the splitting compared to Z=1 at same F', () => {
    const F = 0.02
    const split1 = starkN2Sublevels(F, 1)[3].energy - starkN2Sublevels(F, 1)[0].energy
    const split2 = starkN2Sublevels(F, 2)[3].energy - starkN2Sublevels(F, 2)[0].energy
    expect(split1 / split2).toBeCloseTo(2, 10)
  })

  it('label strings are non-empty for all levels', () => {
    const levels = starkN2Sublevels(0.01, 1)
    for (const lv of levels) {
      expect(typeof lv.label).toBe('string')
      expect(lv.label.length).toBeGreaterThan(0)
    }
  })
})

// ─── starkIonizationField ─────────────────────────────────────────────────────

describe('starkIonizationField', () => {
  it('formula: F_ion = Z³/(16n⁴)', () => {
    expect(starkIonizationField(2, 1)).toBeCloseTo(1 / (16 * 16), 10)  // 1/256
    expect(starkIonizationField(1, 1)).toBeCloseTo(1 / 16, 10)
    expect(starkIonizationField(3, 1)).toBeCloseTo(1 / (16 * 81), 10)
  })

  it('n=2, Z=1 ≈ 0.00391 a.u.', () => {
    expect(starkIonizationField(2, 1)).toBeCloseTo(1 / 256, 8)
    expect(starkIonizationField(2, 1)).toBeCloseTo(0.00390625, 8)
  })

  it('Z scaling: F_ion(n, 2Z) = 8 × F_ion(n, Z)', () => {
    expect(starkIonizationField(2, 2)).toBeCloseTo(8 * starkIonizationField(2, 1), 10)
    expect(starkIonizationField(3, 2)).toBeCloseTo(8 * starkIonizationField(3, 1), 10)
  })

  it('n scaling: F_ion(2n, Z) = F_ion(n, Z) / 16', () => {
    expect(starkIonizationField(2, 1)).toBeCloseTo(starkIonizationField(1, 1) / 16, 10)
    expect(starkIonizationField(4, 1)).toBeCloseTo(starkIonizationField(2, 1) / 16, 10)
  })
})
