/**
 * Wigner quasi-probability distribution W(x,p) — atomic units ħ = m = 1.
 *
 * W(x,p) = (1/π) ∫ ψ*(x+y) ψ(x-y) e^{2ipy} dy
 *
 * All closed-form results; numerical quadrature only for Fock superpositions.
 */

import { hoWavefunction } from './harmonic'

// ── Laguerre polynomial ──────────────────────────────────────────────────────

/**
 * L_n(x) — standard Laguerre polynomial via three-term recurrence.
 * L_0 = 1, L_1 = 1−x, (n+1)L_{n+1} = (2n+1−x)L_n − n L_{n−1}
 */
export function laguerreL(n: number, x: number): number {
  if (n === 0) return 1
  if (n === 1) return 1 - x
  let l0 = 1, l1 = 1 - x
  for (let k = 1; k < n; k++) {
    const l2 = ((2 * k + 1 - x) * l1 - k * l0) / (k + 1)
    l0 = l1; l1 = l2
  }
  return l1
}

// ── Fock (eigenstate) Wigner ─────────────────────────────────────────────────

/**
 * W_n(x,p) = ((-1)^n / π) exp(-s) L_n(2s),  s = p²/ω + ωx²
 *
 * Integrates to 1 over phase space. Negative for n ≥ 1 near origin.
 */
export function wignerFock(n: number, x: number, p: number, omega = 1): number {
  const s = p * p / omega + omega * x * x
  return (Math.pow(-1, n) / Math.PI) * Math.exp(-s) * laguerreL(n, 2 * s)
}

// ── Coherent state Wigner ────────────────────────────────────────────────────

/**
 * W_{|α⟩}(x,p) = (1/π) exp(-ω(x−x₀)² − (p−p₀)²/ω)
 *
 * Always non-negative — the most classical Gaussian blob in phase space.
 */
export function wignerCoherent(
  x: number, p: number,
  xMean: number, pMean: number,
  omega = 1,
): number {
  const dx = x - xMean, dp = p - pMean
  return (1 / Math.PI) * Math.exp(-omega * dx * dx - dp * dp / omega)
}

// ── Displaced squeezed state Wigner ─────────────────────────────────────────

/**
 * W for D(α)S(r)|0⟩ with real squeeze parameter r along x axis.
 *
 * W(x,p) = (1/π) exp(-e^{2r}·ω(x−x₀)² − e^{-2r}·(p−p₀)²/ω)
 *
 * Δx = e^{-r}/√(2ω),  Δp = e^r·√(ω/2).  Still non-negative.
 */
export function wignerSqueezed(
  x: number, p: number,
  xMean: number, pMean: number,
  omega = 1, r = 0,
): number {
  const dx = x - xMean, dp = p - pMean
  const e2r = Math.exp(2 * r)
  return (1 / Math.PI) * Math.exp(-e2r * omega * dx * dx - dp * dp / (omega * e2r))
}

// ── Cat state Wigner ─────────────────────────────────────────────────────────

/**
 * Even/odd cat state |cat±⟩ ∝ |α⟩ ± |−α⟩,  α real and positive.
 *
 * W±(x,p) = [W_{+α} + W_{−α} ± 2·(1/π)·e^{-s}·cos(2x₀·p)] / N±²
 * where x₀ = α√(2/ω),  s = ωx² + p²/ω,  N±² = 2(1 ± e^{-2α²}).
 *
 * The ±2cos(…) interference fringe is the quantum signature: W can go negative.
 */
export function wignerCat(
  x: number, p: number,
  alpha: number, omega = 1, sign: 1 | -1 = 1,
): number {
  const x0 = alpha * Math.sqrt(2 / omega)
  const N2 = 2 * (1 + sign * Math.exp(-2 * alpha * alpha))
  const Wplus  = wignerCoherent(x, p,  x0, 0, omega)
  const Wminus = wignerCoherent(x, p, -x0, 0, omega)
  const s = omega * x * x + p * p / omega
  const Wcross = (1 / Math.PI) * Math.exp(-s) * Math.cos(2 * x0 * p)
  return (Wplus + Wminus + sign * 2 * Wcross) / N2
}

// ── Fock superposition via numerical quadrature ──────────────────────────────

/**
 * W for (|n1⟩ + |n2⟩)/√2 — computed by 1D quadrature over y ∈ [−yMax, yMax].
 * W(x,p) = (1/2)(W_{n1} + W_{n2}) + Re[W_cross(x,p)]
 * where W_cross = (1/π)∫ ψ_{n1}*(x+y) ψ_{n2}(x-y) e^{2ipy} dy
 */
export function wignerFockSuper(
  n1: number, n2: number,
  x: number, p: number,
  omega = 1, NYInt = 200,
): number {
  if (n1 === n2) return wignerFock(n1, x, p, omega)
  const yMax = Math.sqrt((2 * Math.max(n1, n2) + 1) / omega) * 2.5 + 3
  const dy = (2 * yMax) / (NYInt - 1)
  let crossRe = 0
  for (let k = 0; k < NYInt; k++) {
    const y = -yMax + k * dy
    const psi1 = hoWavefunction(n1, x + y, omega)
    const psi2 = hoWavefunction(n2, x - y, omega)
    crossRe += psi1 * psi2 * Math.cos(2 * p * y) * dy
  }
  return 0.5 * (wignerFock(n1, x, p, omega) + wignerFock(n2, x, p, omega)) + crossRe / Math.PI
}

// ── 2D grid computation ──────────────────────────────────────────────────────

export interface WignerGrid {
  xVals: number[]
  pVals: number[]
  W: number[][]       // W[pi][xi]
  zMin: number
  zMax: number
}

/**
 * Evaluate W(x,p) on an NX × NP grid.
 * fn: the Wigner evaluator for a single (x,p) point.
 */
export function computeWignerGrid(
  fn: (x: number, p: number) => number,
  xMin: number, xMax: number, NX: number,
  pMin: number, pMax: number, NP: number,
): WignerGrid {
  const xVals = Array.from({ length: NX }, (_, i) => xMin + (xMax - xMin) * i / (NX - 1))
  const pVals = Array.from({ length: NP }, (_, j) => pMin + (pMax - pMin) * j / (NP - 1))

  let zMin = Infinity, zMax = -Infinity
  const W: number[][] = Array.from({ length: NP }, (_, pi) =>
    Array.from({ length: NX }, (_, xi) => {
      const w = fn(xVals[xi], pVals[pi])
      if (w < zMin) zMin = w
      if (w > zMax) zMax = w
      return w
    })
  )
  return { xVals, pVals, W, zMin, zMax }
}

// ── Marginals (trapezoidal rule) ─────────────────────────────────────────────

/** ∫ W(x,p) dp ≈ |ψ(x)|² */
export function xMarginal(grid: WignerGrid): number[] {
  const dp = grid.pVals.length > 1
    ? (grid.pVals[grid.pVals.length - 1] - grid.pVals[0]) / (grid.pVals.length - 1)
    : 1
  return grid.xVals.map((_, xi) => {
    let sum = 0
    for (let pi = 0; pi < grid.pVals.length; pi++) {
      const w = grid.pVals.length > 1
        ? (pi === 0 || pi === grid.pVals.length - 1 ? 0.5 : 1) * grid.W[pi][xi]
        : grid.W[pi][xi]
      sum += w
    }
    return sum * dp
  })
}

/** ∫ W(x,p) dx ≈ |φ(p)|² */
export function pMarginal(grid: WignerGrid): number[] {
  const dx = grid.xVals.length > 1
    ? (grid.xVals[grid.xVals.length - 1] - grid.xVals[0]) / (grid.xVals.length - 1)
    : 1
  return grid.pVals.map((_, pi) => {
    let sum = 0
    for (let xi = 0; xi < grid.xVals.length; xi++) {
      const w = grid.xVals.length > 1
        ? (xi === 0 || xi === grid.xVals.length - 1 ? 0.5 : 1) * grid.W[pi][xi]
        : grid.W[pi][xi]
      sum += w
    }
    return sum * dx
  })
}

/** Negativity volume = ∫ |W(x,p)| - W(x,p)) / 2  dp dx */
export function wignerNegativity(grid: WignerGrid): number {
  const dx = (grid.xVals[grid.xVals.length - 1] - grid.xVals[0]) / (grid.xVals.length - 1)
  const dp = (grid.pVals[grid.pVals.length - 1] - grid.pVals[0]) / (grid.pVals.length - 1)
  let neg = 0
  for (let pi = 0; pi < grid.pVals.length; pi++) {
    for (let xi = 0; xi < grid.xVals.length; xi++) {
      const w = grid.W[pi][xi]
      if (w < 0) neg -= w
    }
  }
  return neg * dx * dp
}
