import { describe, it, expect } from 'vitest'
import { buildEnergyLevels, EnergyLevelRow } from '../utils/energyLevels'

describe('buildEnergyLevels — ISW L=10', () => {
  const rows: EnergyLevelRow[] = buildEnergyLevels('isw', 10, 1.0, 8)

  it('returns 8 rows', () => expect(rows).toHaveLength(8))

  it('E₁ = π²/200', () => {
    expect(rows[0].energy).toBeCloseTo(Math.PI ** 2 / 200, 8)
  })
  it('E₂ = 4 × E₁', () => {
    expect(rows[1].energy).toBeCloseTo(4 * rows[0].energy, 8)
  })
  it('E₃ = 9 × E₁', () => {
    expect(rows[2].energy).toBeCloseTo(9 * rows[0].energy, 8)
  })
  it('ratio Eₙ/E₁ = n²', () => {
    for (let i = 0; i < 8; i++) {
      expect(rows[i].ratio).toBeCloseTo((i + 1) ** 2, 6)
    }
  })
  it('ΔE₁ is undefined (no previous level)', () => {
    expect(rows[0].delta).toBeUndefined()
  })
  it('ΔE₂ = 3 × E₁', () => {
    expect(rows[1].delta).toBeCloseTo(3 * rows[0].energy, 8)
  })
})

describe('buildEnergyLevels — HO ω=1', () => {
  const rows: EnergyLevelRow[] = buildEnergyLevels('ho', 10, 1.0, 8)

  it('E₀ = 0.5', () => expect(rows[0].energy).toBeCloseTo(0.5, 10))
  it('E₁ = 1.5', () => expect(rows[1].energy).toBeCloseTo(1.5, 10))
  it('E₂ = 2.5', () => expect(rows[2].energy).toBeCloseTo(2.5, 10))
  it('all ΔE = ω = 1', () => {
    for (let i = 1; i < 8; i++) {
      expect(rows[i].delta).toBeCloseTo(1.0, 10)
    }
  })
})
