import { describe, it, expect } from 'vitest'
import { bornP, collapseState, blochVector } from '../utils/spinMath'
import type { Vec3 } from '../utils/spinMath'

const PI = Math.PI

// Axis helpers
const Z: Vec3 = [0, 0, 1]
const X: Vec3 = [1, 0, 0]
const Y: Vec3 = [0, 1, 0]

// Standard states as Bloch vectors
const UP   = blochVector(0,      0)       // |↑⟩  → r̂ = ẑ
const DOWN = blochVector(PI,     0)       // |↓⟩  → r̂ = −ẑ
const PX   = blochVector(PI / 2, 0)       // |+x⟩ → r̂ = x̂
const MX   = blochVector(PI / 2, PI)      // |−x⟩ → r̂ = −x̂
const PY   = blochVector(PI / 2, PI / 2)  // |+y⟩ → r̂ = ŷ

describe('bornP — Born rule P(+½) = (1 + n̂·r̂)/2', () => {
  it('P(+½) = 1 when measuring |↑⟩ along z', () => {
    expect(bornP(Z, UP)).toBeCloseTo(1, 10)
  })

  it('P(+½) = 0 when measuring |↓⟩ along z', () => {
    expect(bornP(Z, DOWN)).toBeCloseTo(0, 10)
  })

  it('P(+½) = 0.5 when measuring |+x⟩ along z  (n̂·r̂ = 0)', () => {
    expect(bornP(Z, PX)).toBeCloseTo(0.5, 10)
  })

  it('P(+½) = 0.5 when measuring |↑⟩ along x   (n̂·r̂ = 0)', () => {
    expect(bornP(X, UP)).toBeCloseTo(0.5, 10)
  })

  it('P(+½) = 1 when state and axis are perfectly aligned', () => {
    expect(bornP(X, PX)).toBeCloseTo(1, 10)
    expect(bornP(Y, PY)).toBeCloseTo(1, 10)
  })

  it('P(+½) + P(−½) = 1 for arbitrary axis and state', () => {
    const axis: Vec3 = [
      Math.sin(1.1) * Math.cos(0.7),
      Math.sin(1.1) * Math.sin(0.7),
      Math.cos(1.1),
    ]
    const state = blochVector(0.9, 2.3)
    const p = bornP(axis, state)
    expect(p + (1 - p)).toBeCloseTo(1, 15)
    expect(p).toBeGreaterThanOrEqual(0)
    expect(p).toBeLessThanOrEqual(1)
  })

  it('P(+½) = 0.5 when measuring |−x⟩ along z (orthogonal to −x̂)', () => {
    expect(bornP(Z, MX)).toBeCloseTo(0.5, 10)
  })
})

describe('collapseState — post-measurement Bloch vector', () => {
  it('outcome "+" along z collapses to |↑⟩ (θ=0)', () => {
    const { theta } = collapseState(Z, '+')
    expect(theta).toBeCloseTo(0, 10)
  })

  it('outcome "−" along z collapses to |↓⟩ (θ=π)', () => {
    const { theta } = collapseState(Z, '-')
    expect(theta).toBeCloseTo(PI, 10)
  })

  it('outcome "+" along x collapses to |+x⟩ (θ=π/2, φ=0)', () => {
    const { theta, phi } = collapseState(X, '+')
    expect(theta).toBeCloseTo(PI / 2, 10)
    expect(phi).toBeCloseTo(0, 10)
  })

  it('outcome "−" along x collapses to |−x⟩ (θ=π/2, φ=π)', () => {
    const { theta, phi } = collapseState(X, '-')
    expect(theta).toBeCloseTo(PI / 2, 10)
    expect(phi).toBeCloseTo(PI, 10)
  })

  it('collapsed state always lies on the Bloch sphere (|r̂|=1)', () => {
    const axes: Vec3[] = [Z, X, Y, [1/Math.sqrt(3), 1/Math.sqrt(3), 1/Math.sqrt(3)]]
    for (const axis of axes) {
      for (const outcome of ['+', '-'] as const) {
        const { theta, phi } = collapseState(axis, outcome)
        const r = blochVector(theta, phi)
        const mag = Math.sqrt(r[0]**2 + r[1]**2 + r[2]**2)
        expect(mag).toBeCloseTo(1, 10)
      }
    }
  })
})

describe('N-shot simulation (runShots helper)', () => {
  function runShots(pPlus: number, n: number, seed?: number): { plus: number; minus: number } {
    // Seeded-ish: use a simple LCG so the test is deterministic
    let s = seed ?? 42
    function rand() {
      s = (s * 1664525 + 1013904223) & 0xffffffff
      return (s >>> 0) / 0x100000000
    }
    let plus = 0
    for (let i = 0; i < n; i++) { if (rand() < pPlus) plus++ }
    return { plus, minus: n - plus }
  }

  it('0 shots → counts {plus:0, minus:0}', () => {
    const r = runShots(0.5, 0)
    expect(r.plus).toBe(0)
    expect(r.minus).toBe(0)
  })

  it('pPlus=1 → all shots are "+"', () => {
    const r = runShots(1, 1000)
    expect(r.plus).toBe(1000)
    expect(r.minus).toBe(0)
  })

  it('pPlus=0 → all shots are "−"', () => {
    const r = runShots(0, 1000)
    expect(r.plus).toBe(0)
    expect(r.minus).toBe(1000)
  })

  it('large N: observed fraction within 3σ of pPlus', () => {
    const pPlus = 0.6, n = 10000
    const { plus } = runShots(pPlus, n, 12345)
    const observed = plus / n
    const sigma = Math.sqrt(pPlus * (1 - pPlus) / n)
    expect(Math.abs(observed - pPlus)).toBeLessThan(3 * sigma)
  })
})
