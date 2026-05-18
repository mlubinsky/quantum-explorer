import { describe, it, expect } from 'vitest'
import {
  blochToQubit, qubitToBloch, qubitAngles, qubitNorm,
  applyX, applyY, applyZ, applyH, applyS, applySDag, applyT, applyTDag,
  applyRx, applyRy, applyRz,
  blochSlerp,
} from '../physics/gates'

const EPS = 1e-10
const close = (a: number, b: number, e = EPS) => Math.abs(a - b) < e

// ── Helpers ──────────────────────────────────────────────────────────────────

// |↑⟩ = (1,0,0,0), Bloch = (0,0,1)
const up   = () => ({ aRe: 1, aIm: 0, bRe: 0, bIm: 0 })
// |↓⟩ = (0,0,1,0), Bloch = (0,0,-1)
const down = () => ({ aRe: 0, aIm: 0, bRe: 1, bIm: 0 })
// |+x⟩ = (1,1)/√2, Bloch = (1,0,0)
const plusX  = () => ({ aRe: 1/Math.SQRT2, aIm: 0, bRe:  1/Math.SQRT2, bIm: 0 })
// |−x⟩ = (1,-1)/√2, Bloch = (-1,0,0)
const minusX = () => ({ aRe: 1/Math.SQRT2, aIm: 0, bRe: -1/Math.SQRT2, bIm: 0 })
// |+y⟩ = (1,i)/√2, Bloch = (0,1,0)
const plusY  = () => ({ aRe: 1/Math.SQRT2, aIm: 0, bRe: 0, bIm:  1/Math.SQRT2 })
// |−y⟩ = (1,-i)/√2, Bloch = (0,-1,0)
const minusY = () => ({ aRe: 1/Math.SQRT2, aIm: 0, bRe: 0, bIm: -1/Math.SQRT2 })

// ── blochToQubit ─────────────────────────────────────────────────────────────

describe('blochToQubit', () => {
  it('θ=0 → |↑⟩', () => {
    const q = blochToQubit(0, 0)
    expect(close(q.aRe, 1)).toBe(true)
    expect(close(q.aIm, 0)).toBe(true)
    expect(close(q.bRe, 0)).toBe(true)
    expect(close(q.bIm, 0)).toBe(true)
  })

  it('θ=π → |↓⟩', () => {
    const q = blochToQubit(Math.PI, 0)
    expect(close(q.aRe, 0)).toBe(true)
    expect(close(q.aIm, 0)).toBe(true)
    expect(close(Math.abs(q.bRe), 1)).toBe(true) // global phase ok
    expect(close(q.bIm, 0)).toBe(true)
  })

  it('θ=π/2 φ=0 → |+x⟩', () => {
    const q = blochToQubit(Math.PI / 2, 0)
    expect(close(q.aRe, 1/Math.SQRT2)).toBe(true)
    expect(close(q.bRe, 1/Math.SQRT2)).toBe(true)
  })

  it('θ=π/2 φ=π/2 → |+y⟩', () => {
    const q = blochToQubit(Math.PI / 2, Math.PI / 2)
    expect(close(q.aRe, 1/Math.SQRT2)).toBe(true)
    expect(close(q.bIm, 1/Math.SQRT2, 1e-9)).toBe(true)
  })
})

// ── qubitToBloch ─────────────────────────────────────────────────────────────

describe('qubitToBloch', () => {
  it('|↑⟩ → (0,0,1)', () => {
    const r = qubitToBloch(up())
    expect(close(r.rx, 0)).toBe(true)
    expect(close(r.ry, 0)).toBe(true)
    expect(close(r.rz, 1)).toBe(true)
  })

  it('|↓⟩ → (0,0,-1)', () => {
    const r = qubitToBloch(down())
    expect(close(r.rx, 0)).toBe(true)
    expect(close(r.ry, 0)).toBe(true)
    expect(close(r.rz, -1)).toBe(true)
  })

  it('|+x⟩ → (1,0,0)', () => {
    const r = qubitToBloch(plusX())
    expect(close(r.rx, 1)).toBe(true)
    expect(close(r.ry, 0)).toBe(true)
    expect(close(r.rz, 0)).toBe(true)
  })

  it('|+y⟩ → (0,1,0)', () => {
    const r = qubitToBloch(plusY())
    expect(close(r.rx, 0)).toBe(true)
    expect(close(r.ry, 1)).toBe(true)
    expect(close(r.rz, 0)).toBe(true)
  })

  it('|−y⟩ → (0,-1,0)', () => {
    const r = qubitToBloch(minusY())
    expect(close(r.rx, 0)).toBe(true)
    expect(close(r.ry, -1)).toBe(true)
    expect(close(r.rz, 0)).toBe(true)
  })
})

// ── round-trip ────────────────────────────────────────────────────────────────

describe('blochToQubit / qubitToBloch round-trip', () => {
  const cases: [number, number][] = [
    [0, 0], [Math.PI, 0], [Math.PI/2, 0], [Math.PI/2, Math.PI/2],
    [Math.PI/3, Math.PI/4], [2*Math.PI/3, 5*Math.PI/6],
  ]
  cases.forEach(([theta, phi]) => {
    it(`θ=${theta.toFixed(3)} φ=${phi.toFixed(3)}`, () => {
      const q = blochToQubit(theta, phi)
      const { rx, ry, rz } = qubitToBloch(q)
      const expected = {
        rx: Math.sin(theta) * Math.cos(phi),
        ry: Math.sin(theta) * Math.sin(phi),
        rz: Math.cos(theta),
      }
      expect(close(rx, expected.rx, 1e-9)).toBe(true)
      expect(close(ry, expected.ry, 1e-9)).toBe(true)
      expect(close(rz, expected.rz, 1e-9)).toBe(true)
    })
  })
})

// ── qubitNorm ─────────────────────────────────────────────────────────────────

describe('qubitNorm', () => {
  it('|↑⟩ norm = 1', () => expect(close(qubitNorm(up()), 1)).toBe(true))
  it('|↓⟩ norm = 1', () => expect(close(qubitNorm(down()), 1)).toBe(true))
  it('|+x⟩ norm = 1', () => expect(close(qubitNorm(plusX()), 1)).toBe(true))
  it('|+y⟩ norm = 1', () => expect(close(qubitNorm(plusY()), 1)).toBe(true))
})

// ── Pauli X ───────────────────────────────────────────────────────────────────

describe('applyX', () => {
  it('X|↑⟩ → Bloch (0,0,-1)', () => {
    const r = qubitToBloch(applyX(up()))
    expect(close(r.rx, 0)).toBe(true)
    expect(close(r.ry, 0)).toBe(true)
    expect(close(r.rz, -1)).toBe(true)
  })

  it('X|↓⟩ → Bloch (0,0,1)', () => {
    const r = qubitToBloch(applyX(down()))
    expect(close(r.rz, 1)).toBe(true)
  })

  it('X is self-inverse on |↑⟩', () => {
    const r = qubitToBloch(applyX(applyX(up())))
    expect(close(r.rz, 1)).toBe(true)
  })

  it('X preserves norm', () => expect(close(qubitNorm(applyX(plusY())), 1)).toBe(true))
})

// ── Pauli Y ───────────────────────────────────────────────────────────────────

describe('applyY', () => {
  it('Y|↑⟩ → Bloch (0,0,-1)', () => {
    const r = qubitToBloch(applyY(up()))
    expect(close(r.rz, -1)).toBe(true)
  })

  it('Y|+x⟩ → Bloch (-1,0,0)', () => {
    const r = qubitToBloch(applyY(plusX()))
    expect(close(r.rx, -1, 1e-9)).toBe(true)
    expect(close(r.rz, 0)).toBe(true)
  })

  it('Y is self-inverse on |↑⟩', () => {
    const r = qubitToBloch(applyY(applyY(up())))
    expect(close(r.rz, 1)).toBe(true)
  })

  it('Y preserves norm', () => expect(close(qubitNorm(applyY(plusX())), 1)).toBe(true))
})

// ── Pauli Z ───────────────────────────────────────────────────────────────────

describe('applyZ', () => {
  it('Z|↑⟩ → Bloch (0,0,1) unchanged', () => {
    const r = qubitToBloch(applyZ(up()))
    expect(close(r.rz, 1)).toBe(true)
  })

  it('Z|+x⟩ → Bloch (-1,0,0)', () => {
    const r = qubitToBloch(applyZ(plusX()))
    expect(close(r.rx, -1, 1e-9)).toBe(true)
    expect(close(r.rz, 0)).toBe(true)
  })

  it('Z is self-inverse on |+x⟩', () => {
    const r = qubitToBloch(applyZ(applyZ(plusX())))
    expect(close(r.rx, 1, 1e-9)).toBe(true)
  })

  it('Z preserves norm', () => expect(close(qubitNorm(applyZ(plusY())), 1)).toBe(true))
})

// ── Hadamard ──────────────────────────────────────────────────────────────────

describe('applyH', () => {
  it('H|↑⟩ → |+x⟩: Bloch (1,0,0)', () => {
    const r = qubitToBloch(applyH(up()))
    expect(close(r.rx, 1, 1e-9)).toBe(true)
    expect(close(r.ry, 0)).toBe(true)
    expect(close(r.rz, 0, 1e-9)).toBe(true)
  })

  it('H|↓⟩ → |−x⟩: Bloch (-1,0,0)', () => {
    const r = qubitToBloch(applyH(down()))
    expect(close(r.rx, -1, 1e-9)).toBe(true)
  })

  it('H·H = I on |↑⟩', () => {
    const r = qubitToBloch(applyH(applyH(up())))
    expect(close(r.rz, 1, 1e-9)).toBe(true)
  })

  it('H·H = I on |+y⟩', () => {
    const { rx: rx0, ry: ry0, rz: rz0 } = qubitToBloch(plusY())
    const r = qubitToBloch(applyH(applyH(plusY())))
    expect(close(r.rx, rx0, 1e-9)).toBe(true)
    expect(close(r.ry, ry0, 1e-9)).toBe(true)
    expect(close(r.rz, rz0, 1e-9)).toBe(true)
  })

  it('H preserves norm', () => expect(close(qubitNorm(applyH(plusY())), 1)).toBe(true))
})

// ── S gate ────────────────────────────────────────────────────────────────────

describe('applyS', () => {
  it('S|+x⟩ → |+y⟩: Bloch (0,1,0)', () => {
    const r = qubitToBloch(applyS(plusX()))
    expect(close(r.rx, 0, 1e-9)).toBe(true)
    expect(close(r.ry, 1, 1e-9)).toBe(true)
    expect(close(r.rz, 0, 1e-9)).toBe(true)
  })

  it('S·S = Z on Bloch sphere for |+x⟩', () => {
    // Z|+x⟩ → (−1,0,0); S²|+x⟩ should match
    const rSS = qubitToBloch(applyS(applyS(plusX())))
    const rZ  = qubitToBloch(applyZ(plusX()))
    expect(close(rSS.rx, rZ.rx, 1e-9)).toBe(true)
    expect(close(rSS.ry, rZ.ry, 1e-9)).toBe(true)
    expect(close(rSS.rz, rZ.rz, 1e-9)).toBe(true)
  })

  it('S preserves norm', () => expect(close(qubitNorm(applyS(plusX())), 1)).toBe(true))
})

// ── S† gate ───────────────────────────────────────────────────────────────────

describe('applySDag', () => {
  it('S†|+x⟩ → |−y⟩: Bloch (0,-1,0)', () => {
    const r = qubitToBloch(applySDag(plusX()))
    expect(close(r.rx, 0, 1e-9)).toBe(true)
    expect(close(r.ry, -1, 1e-9)).toBe(true)
    expect(close(r.rz, 0, 1e-9)).toBe(true)
  })

  it('S†·S = I on |+x⟩', () => {
    const r = qubitToBloch(applySDag(applyS(plusX())))
    expect(close(r.rx, 1, 1e-9)).toBe(true)
    expect(close(r.ry, 0, 1e-9)).toBe(true)
  })

  it('S† preserves norm', () => expect(close(qubitNorm(applySDag(plusX())), 1)).toBe(true))
})

// ── T gate ────────────────────────────────────────────────────────────────────

describe('applyT', () => {
  it('T·T matches S on Bloch sphere for |+x⟩', () => {
    const rTT = qubitToBloch(applyT(applyT(plusX())))
    const rS  = qubitToBloch(applyS(plusX()))
    expect(close(rTT.rx, rS.rx, 1e-9)).toBe(true)
    expect(close(rTT.ry, rS.ry, 1e-9)).toBe(true)
    expect(close(rTT.rz, rS.rz, 1e-9)).toBe(true)
  })

  it('T preserves norm', () => expect(close(qubitNorm(applyT(plusX())), 1)).toBe(true))
})

// ── T† gate ───────────────────────────────────────────────────────────────────

describe('applyTDag', () => {
  it('T†·T = I on Bloch sphere for |+x⟩', () => {
    const r = qubitToBloch(applyTDag(applyT(plusX())))
    expect(close(r.rx, 1, 1e-9)).toBe(true)
    expect(close(r.ry, 0, 1e-9)).toBe(true)
    expect(close(r.rz, 0, 1e-9)).toBe(true)
  })

  it('T† preserves norm', () => expect(close(qubitNorm(applyTDag(plusX())), 1)).toBe(true))
})

// ── Parametric Rx ─────────────────────────────────────────────────────────────

describe('applyRx', () => {
  it('Rx(π)|↑⟩ matches X|↑⟩ on Bloch sphere', () => {
    const rRx = qubitToBloch(applyRx(Math.PI, up()))
    const rX  = qubitToBloch(applyX(up()))
    expect(close(rRx.rx, rX.rx, 1e-9)).toBe(true)
    expect(close(rRx.ry, rX.ry, 1e-9)).toBe(true)
    expect(close(rRx.rz, rX.rz, 1e-9)).toBe(true)
  })

  it('Rx(0) = I on |↑⟩', () => {
    const r = qubitToBloch(applyRx(0, up()))
    expect(close(r.rz, 1)).toBe(true)
  })

  it('Rx preserves norm', () => expect(close(qubitNorm(applyRx(1.2, plusX())), 1)).toBe(true))
})

// ── Parametric Ry ─────────────────────────────────────────────────────────────

describe('applyRy', () => {
  it('Ry(π)|↑⟩ matches Y|↑⟩ on Bloch sphere', () => {
    const rRy = qubitToBloch(applyRy(Math.PI, up()))
    const rY  = qubitToBloch(applyY(up()))
    expect(close(rRy.rx, rY.rx, 1e-9)).toBe(true)
    expect(close(rRy.ry, rY.ry, 1e-9)).toBe(true)
    expect(close(rRy.rz, rY.rz, 1e-9)).toBe(true)
  })

  it('Ry(0) = I on |↓⟩', () => {
    const r = qubitToBloch(applyRy(0, down()))
    expect(close(r.rz, -1)).toBe(true)
  })

  it('Ry preserves norm', () => expect(close(qubitNorm(applyRy(0.7, plusY())), 1)).toBe(true))
})

// ── Parametric Rz ─────────────────────────────────────────────────────────────

describe('applyRz', () => {
  it('Rz(π)|+x⟩ matches Z|+x⟩ on Bloch sphere', () => {
    const rRz = qubitToBloch(applyRz(Math.PI, plusX()))
    const rZ  = qubitToBloch(applyZ(plusX()))
    expect(close(rRz.rx, rZ.rx, 1e-9)).toBe(true)
    expect(close(rRz.ry, rZ.ry, 1e-9)).toBe(true)
    expect(close(rRz.rz, rZ.rz, 1e-9)).toBe(true)
  })

  it('Rz(π/2)|+x⟩ matches S|+x⟩ on Bloch sphere', () => {
    const rRz = qubitToBloch(applyRz(Math.PI / 2, plusX()))
    const rS  = qubitToBloch(applyS(plusX()))
    expect(close(rRz.rx, rS.rx, 1e-9)).toBe(true)
    expect(close(rRz.ry, rS.ry, 1e-9)).toBe(true)
    expect(close(rRz.rz, rS.rz, 1e-9)).toBe(true)
  })

  it('Rz(0) = I on |↑⟩', () => {
    const r = qubitToBloch(applyRz(0, up()))
    expect(close(r.rz, 1)).toBe(true)
  })

  it('Rz preserves norm', () => expect(close(qubitNorm(applyRz(1.5, minusX())), 1)).toBe(true))
})

// ── qubitAngles ───────────────────────────────────────────────────────────────

describe('qubitAngles', () => {
  it('|↑⟩ → theta=0', () => {
    const { theta } = qubitAngles(up())
    expect(close(theta, 0, 1e-9)).toBe(true)
  })

  it('|↓⟩ → theta=π', () => {
    const { theta } = qubitAngles(down())
    expect(close(theta, Math.PI, 1e-9)).toBe(true)
  })

  it('|+x⟩ → theta=π/2, phi=0', () => {
    const { theta, phi } = qubitAngles(plusX())
    expect(close(theta, Math.PI / 2, 1e-9)).toBe(true)
    expect(close(phi, 0, 1e-9)).toBe(true)
  })

  it('|+y⟩ → theta=π/2, phi=π/2', () => {
    const { theta, phi } = qubitAngles(plusY())
    expect(close(theta, Math.PI / 2, 1e-9)).toBe(true)
    expect(close(phi, Math.PI / 2, 1e-9)).toBe(true)
  })
})

// ── blochSlerp ────────────────────────────────────────────────────────────────

describe('blochSlerp', () => {
  it('returns nPoints vectors', () => {
    const pts = blochSlerp({ rx: 0, ry: 0, rz: 1 }, { rx: 1, ry: 0, rz: 0 }, 20)
    expect(pts.length).toBe(20)
  })

  it('first point is start', () => {
    const start = { rx: 0, ry: 0, rz: 1 }
    const pts = blochSlerp(start, { rx: 1, ry: 0, rz: 0 }, 10)
    expect(close(pts[0].rx, 0, 1e-9)).toBe(true)
    expect(close(pts[0].rz, 1, 1e-9)).toBe(true)
  })

  it('last point is end', () => {
    const end = { rx: 1, ry: 0, rz: 0 }
    const pts = blochSlerp({ rx: 0, ry: 0, rz: 1 }, end, 10)
    expect(close(pts[9].rx, 1, 1e-9)).toBe(true)
    expect(close(pts[9].rz, 0, 1e-9)).toBe(true)
  })

  it('all intermediate points lie on unit sphere', () => {
    const pts = blochSlerp({ rx: 0, ry: 0, rz: 1 }, { rx: 0, ry: 1, rz: 0 }, 15)
    for (const p of pts) {
      const norm2 = p.rx * p.rx + p.ry * p.ry + p.rz * p.rz
      expect(close(norm2, 1, 1e-9)).toBe(true)
    }
  })

  it('same start and end returns constant trajectory', () => {
    const v = { rx: 0, ry: 0, rz: 1 }
    const pts = blochSlerp(v, v, 5)
    for (const p of pts) {
      expect(close(p.rz, 1, 1e-9)).toBe(true)
    }
  })
})
