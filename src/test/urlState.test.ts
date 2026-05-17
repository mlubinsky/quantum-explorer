import { describe, it, expect } from 'vitest'
import {
  parseHash,
  buildHash,
  getNumericParam,
  getIntParam,
  getStringParam,
} from '../physics/urlState'

// ── parseHash ─────────────────────────────────────────────────────────────────

describe('parseHash', () => {
  it('parses module with params', () => {
    const { moduleId, params } = parseHash('#hydrogen?n=2&l=1&m=0')
    expect(moduleId).toBe('hydrogen')
    expect(params.get('n')).toBe('2')
    expect(params.get('l')).toBe('1')
    expect(params.get('m')).toBe('0')
  })

  it('parses module with no params', () => {
    const { moduleId, params } = parseHash('#stationary')
    expect(moduleId).toBe('stationary')
    expect(params.toString()).toBe('')
  })

  it('handles empty hash', () => {
    const { moduleId, params } = parseHash('#')
    expect(moduleId).toBe('')
    expect(params.toString()).toBe('')
  })

  it('handles bare string without leading #', () => {
    const { moduleId, params } = parseHash('ring?phi=0.5&R=2')
    expect(moduleId).toBe('ring')
    expect(params.get('phi')).toBe('0.5')
    expect(params.get('R')).toBe('2')
  })

  it('handles module with ? but no params', () => {
    const { moduleId, params } = parseHash('#wigner?')
    expect(moduleId).toBe('wigner')
    expect(params.toString()).toBe('')
  })

  it('preserves float values verbatim', () => {
    const { params } = parseHash('#free-particle?k0=1.5&s0=0.25')
    expect(params.get('k0')).toBe('1.5')
    expect(params.get('s0')).toBe('0.25')
  })

  it('handles negative values', () => {
    const { params } = parseHash('#ring?phi=-0.5&n=-3')
    expect(params.get('phi')).toBe('-0.5')
    expect(params.get('n')).toBe('-3')
  })
})

// ── buildHash ─────────────────────────────────────────────────────────────────

describe('buildHash', () => {
  it('builds hash with params', () => {
    const p = new URLSearchParams({ n: '2', l: '1', m: '0' })
    expect(buildHash('hydrogen', p)).toBe('#hydrogen?n=2&l=1&m=0')
  })

  it('builds hash with no params', () => {
    const p = new URLSearchParams()
    expect(buildHash('stationary', p)).toBe('#stationary')
  })

  it('round-trips through parseHash', () => {
    const orig = '#ring?R=2&n=1&phi=0.5'
    const { moduleId, params } = parseHash(orig)
    // URLSearchParams sorts keys alphabetically
    expect(buildHash(moduleId, params)).toBe('#ring?R=2&n=1&phi=0.5')
  })
})

// ── getNumericParam ───────────────────────────────────────────────────────────

describe('getNumericParam', () => {
  function p(obj: Record<string, string>) { return new URLSearchParams(obj) }

  it('returns parsed float', () => {
    expect(getNumericParam(p({ x: '1.5' }), 'x', 0)).toBeCloseTo(1.5)
  })

  it('returns default when key is missing', () => {
    expect(getNumericParam(p({}), 'x', 99)).toBe(99)
  })

  it('returns default for NaN input', () => {
    expect(getNumericParam(p({ x: 'abc' }), 'x', 5)).toBe(5)
  })

  it('clamps to min', () => {
    expect(getNumericParam(p({ x: '-10' }), 'x', 0, 0, 5)).toBe(0)
  })

  it('clamps to max', () => {
    expect(getNumericParam(p({ x: '99' }), 'x', 0, 0, 5)).toBe(5)
  })

  it('passes value within range unchanged', () => {
    expect(getNumericParam(p({ x: '3.7' }), 'x', 0, 0, 5)).toBeCloseTo(3.7)
  })

  it('handles negative range', () => {
    expect(getNumericParam(p({ phi: '-0.5' }), 'phi', 0, -1, 3)).toBeCloseTo(-0.5)
  })

  it('returns default for Infinity input', () => {
    expect(getNumericParam(p({ x: 'Infinity' }), 'x', 2)).toBe(2)
  })
})

// ── getIntParam ───────────────────────────────────────────────────────────────

describe('getIntParam', () => {
  function p(obj: Record<string, string>) { return new URLSearchParams(obj) }

  it('parses and rounds float to int', () => {
    expect(getIntParam(p({ n: '2.9' }), 'n', 1)).toBe(3)
  })

  it('returns integer directly', () => {
    expect(getIntParam(p({ n: '4' }), 'n', 1, 1, 5)).toBe(4)
  })

  it('clamps and rounds', () => {
    expect(getIntParam(p({ n: '10' }), 'n', 1, 1, 5)).toBe(5)
    expect(getIntParam(p({ n: '-3' }), 'n', 1, 0, 5)).toBe(0)
  })

  it('returns default on missing key', () => {
    expect(getIntParam(p({}), 'n', 3, 1, 8)).toBe(3)
  })

  it('returns default on NaN', () => {
    expect(getIntParam(p({ n: 'bad' }), 'n', 2, 1, 8)).toBe(2)
  })
})

// ── getStringParam ────────────────────────────────────────────────────────────

describe('getStringParam', () => {
  function p(obj: Record<string, string>) { return new URLSearchParams(obj) }
  const POTS = ['isw', 'ho'] as const

  it('returns value from allowlist', () => {
    expect(getStringParam(p({ pot: 'ho' }), 'pot', 'isw', POTS)).toBe('ho')
  })

  it('returns default when value not in allowlist', () => {
    expect(getStringParam(p({ pot: 'unknown' }), 'pot', 'isw', POTS)).toBe('isw')
  })

  it('returns default when key is missing', () => {
    expect(getStringParam(p({}), 'pot', 'isw', POTS)).toBe('isw')
  })

  it('returns any string when no allowlist given', () => {
    expect(getStringParam(p({ tab: 'kronig-penney' }), 'tab', 'barrier')).toBe('kronig-penney')
  })

  it('returns default when key missing and no allowlist', () => {
    expect(getStringParam(p({}), 'tab', 'barrier')).toBe('barrier')
  })
})
