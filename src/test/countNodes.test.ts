import { describe, it, expect } from 'vitest'
import { iswEigenstate } from '../physics/isw'
import { hoEigenstate } from '../physics/harmonic'
import { countNodes } from '../utils/countNodes'

describe('countNodes — ISW (analytic: n-1 nodes)', () => {
  it('ψ₁ → 0 nodes', () => {
    const { psi } = iswEigenstate(1, 10, 500)
    expect(countNodes(psi)).toBe(0)
  })
  it('ψ₃ → 2 nodes', () => {
    const { psi } = iswEigenstate(3, 10, 500)
    expect(countNodes(psi)).toBe(2)
  })
  it('ψ₅ → 4 nodes', () => {
    const { psi } = iswEigenstate(5, 10, 500)
    expect(countNodes(psi)).toBe(4)
  })
})

describe('countNodes — HO (analytic: n nodes)', () => {
  it('ψ₀ → 0 nodes', () => {
    const { psi } = hoEigenstate(0, 1.0, 500)
    expect(countNodes(psi)).toBe(0)
  })
  it('ψ₂ → 2 nodes', () => {
    const { psi } = hoEigenstate(2, 1.0, 500)
    expect(countNodes(psi)).toBe(2)
  })
  it('ψ₄ → 4 nodes', () => {
    const { psi } = hoEigenstate(4, 1.0, 500)
    expect(countNodes(psi)).toBe(4)
  })
})
