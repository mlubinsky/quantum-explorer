import { describe, it, expect } from 'vitest'
import { HARTREE_TO_EV, auToEv } from '../utils/units'
import { iswEnergy } from '../physics/isw'
import { hoEnergy } from '../physics/harmonic'

describe('auToEv — unit conversion for energy labels', () => {
  it('1 Hartree = 27.2114 eV (constant)', () => {
    expect(HARTREE_TO_EV).toBeCloseTo(27.2114, 4)
  })
  it('auToEv(1.0) returns "27.21"', () => {
    expect(auToEv(1.0)).toBe('27.21')
  })
  it('auToEv(0) returns "0.00"', () => {
    expect(auToEv(0)).toBe('0.00')
  })
  it('ISW ground state L=10 ≈ 1.34 eV', () => {
    // E₁ = π²/200 ≈ 0.04935 a.u. → × 27.2114 ≈ 1.34 eV
    expect(auToEv(iswEnergy(1, 10))).toBe('1.34')
  })
  it('HO ground state ω=1 = 13.61 eV', () => {
    // E₀ = 0.5 a.u. → × 27.2114 ≈ 13.61 eV
    expect(auToEv(hoEnergy(0, 1))).toBe('13.61')
  })
  it('ISW n=2 has 4× the eV value of n=1', () => {
    const e1 = iswEnergy(1, 10) * HARTREE_TO_EV
    const e2 = iswEnergy(2, 10) * HARTREE_TO_EV
    expect(e2).toBeCloseTo(4 * e1, 8)
  })
})
