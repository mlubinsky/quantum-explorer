export interface Qubit {
  aRe: number; aIm: number
  bRe: number; bIm: number
}

export interface Vec3 { rx: number; ry: number; rz: number }

// ── State conversions ─────────────────────────────────────────────────────────

export function blochToQubit(theta: number, phi: number): Qubit {
  return {
    aRe: Math.cos(theta / 2),
    aIm: 0,
    bRe: Math.sin(theta / 2) * Math.cos(phi),
    bIm: Math.sin(theta / 2) * Math.sin(phi),
  }
}

export function qubitToBloch(q: Qubit): Vec3 {
  return {
    rx: 2 * (q.aRe * q.bRe + q.aIm * q.bIm),
    ry: 2 * (q.aRe * q.bIm - q.aIm * q.bRe),
    rz: q.aRe * q.aRe + q.aIm * q.aIm - q.bRe * q.bRe - q.bIm * q.bIm,
  }
}

export function qubitAngles(q: Qubit): { theta: number; phi: number } {
  const { rx, ry, rz } = qubitToBloch(q)
  return { theta: Math.acos(Math.max(-1, Math.min(1, rz))), phi: Math.atan2(ry, rx) }
}

export function qubitNorm(q: Qubit): number {
  return Math.sqrt(q.aRe * q.aRe + q.aIm * q.aIm + q.bRe * q.bRe + q.bIm * q.bIm)
}

// ── 2×2 complex matrix application ───────────────────────────────────────────
// U = [[u00Re+i·u00Im, u01Re+i·u01Im], [u10Re+i·u10Im, u11Re+i·u11Im]]

function applyMatrix(
  u00Re: number, u00Im: number, u01Re: number, u01Im: number,
  u10Re: number, u10Im: number, u11Re: number, u11Im: number,
  q: Qubit,
): Qubit {
  return {
    aRe: u00Re * q.aRe - u00Im * q.aIm + u01Re * q.bRe - u01Im * q.bIm,
    aIm: u00Re * q.aIm + u00Im * q.aRe + u01Re * q.bIm + u01Im * q.bRe,
    bRe: u10Re * q.aRe - u10Im * q.aIm + u11Re * q.bRe - u11Im * q.bIm,
    bIm: u10Re * q.aIm + u10Im * q.aRe + u11Re * q.bIm + u11Im * q.bRe,
  }
}

// ── Fixed gates ───────────────────────────────────────────────────────────────

export function applyX(q: Qubit): Qubit {
  return applyMatrix(0, 0, 1, 0,  1, 0, 0, 0,  q)
}

export function applyY(q: Qubit): Qubit {
  return applyMatrix(0, 0, 0, -1,  0, 1, 0, 0,  q)
}

export function applyZ(q: Qubit): Qubit {
  return applyMatrix(1, 0, 0, 0,  0, 0, -1, 0,  q)
}

export function applyH(q: Qubit): Qubit {
  const r = 1 / Math.SQRT2
  return applyMatrix(r, 0, r, 0,  r, 0, -r, 0,  q)
}

// S = diag(1, i)
export function applyS(q: Qubit): Qubit {
  return applyMatrix(1, 0, 0, 0,  0, 0, 0, 1,  q)
}

// S† = diag(1, −i)
export function applySDag(q: Qubit): Qubit {
  return applyMatrix(1, 0, 0, 0,  0, 0, 0, -1,  q)
}

// T = diag(1, e^{iπ/4})
export function applyT(q: Qubit): Qubit {
  const r = 1 / Math.SQRT2
  return applyMatrix(1, 0, 0, 0,  0, 0, r, r,  q)
}

// T† = diag(1, e^{−iπ/4})
export function applyTDag(q: Qubit): Qubit {
  const r = 1 / Math.SQRT2
  return applyMatrix(1, 0, 0, 0,  0, 0, r, -r,  q)
}

// ── Parametric rotation gates ─────────────────────────────────────────────────

export function applyRx(angle: number, q: Qubit): Qubit {
  const c = Math.cos(angle / 2)
  const s = Math.sin(angle / 2)
  return applyMatrix(c, 0, 0, -s,  0, -s, c, 0,  q)
}

export function applyRy(angle: number, q: Qubit): Qubit {
  const c = Math.cos(angle / 2)
  const s = Math.sin(angle / 2)
  return applyMatrix(c, 0, -s, 0,  s, 0, c, 0,  q)
}

export function applyRz(angle: number, q: Qubit): Qubit {
  const c = Math.cos(angle / 2)
  const s = Math.sin(angle / 2)
  return applyMatrix(c, -s, 0, 0,  0, 0, c, s,  q)
}

// ── Bloch sphere SLERP ───────────────────────────────────────────────────────

export function blochSlerp(rOld: Vec3, rNew: Vec3, nPoints: number): Vec3[] {
  const dot = rOld.rx * rNew.rx + rOld.ry * rNew.ry + rOld.rz * rNew.rz
  const clamped = Math.max(-1, Math.min(1, dot))
  const omega = Math.acos(clamped)

  if (omega < 1e-10) {
    return Array.from({ length: nPoints }, () => ({ ...rOld }))
  }

  const sinO = Math.sin(omega)

  // Antipodal guard: sin(π) ≈ 1.2e-16 in float64, making the SLERP weights
  // blow up at intermediate t. Route through a perpendicular midpoint instead.
  if (sinO < 1e-6) {
    const mid = _perpTo(rOld)
    const n1 = Math.ceil(nPoints / 2)
    const n2 = nPoints - n1 + 1
    const first  = blochSlerp(rOld, mid, n1)
    const second = blochSlerp(mid, rNew, n2)
    return [...first, ...second.slice(1)]
  }

  return Array.from({ length: nPoints }, (_, i) => {
    const t = i / (nPoints - 1)
    const w0 = Math.sin((1 - t) * omega) / sinO
    const w1 = Math.sin(t * omega) / sinO
    return {
      rx: w0 * rOld.rx + w1 * rNew.rx,
      ry: w0 * rOld.ry + w1 * rNew.ry,
      rz: w0 * rOld.rz + w1 * rNew.rz,
    }
  })
}

function _perpTo(v: Vec3): Vec3 {
  // Unit vector perpendicular to v — pick the axis least aligned with v to
  // avoid near-zero cross-product magnitude.
  const ax = Math.abs(v.rx), ay = Math.abs(v.ry), az = Math.abs(v.rz)
  let p: Vec3
  if (ax <= ay && ax <= az) {
    p = { rx: 0, ry: -v.rz, rz: v.ry }
  } else if (ay <= az) {
    p = { rx: v.rz, ry: 0, rz: -v.rx }
  } else {
    p = { rx: -v.ry, ry: v.rx, rz: 0 }
  }
  const len = Math.sqrt(p.rx * p.rx + p.ry * p.ry + p.rz * p.rz)
  return { rx: p.rx / len, ry: p.ry / len, rz: p.rz / len }
}
