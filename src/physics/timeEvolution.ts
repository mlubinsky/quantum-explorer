/** Time evolution — exact analytical (no numerics).
 *  ISW: ψ(x,t) = Σ cₙ ψₙ(x) e^{−iEₙt}
 *  HO coherent state: Gaussian packet oscillating at ω without spreading.
 *  All in atomic units: ħ = m = 1.
 */

import { iswEnergy, iswPsi as iswEigenPsi } from './isw'
import { hoWavefunction } from './harmonic'

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Position matrix element X_{mn} = ⟨ψₘ|x|ψₙ⟩ for ISW.
 *  Non-zero only when m+n is odd:
 *  X_{mn} = (2L/π²)(1/(m+n)² − 1/(m−n)²)
 */
function iswXmn(m: number, n: number, L: number): number {
  if (m === n) return L / 2
  if ((m + n) % 2 === 0) return 0
  const a = m + n
  const b = m - n
  return (2 * L / (Math.PI * Math.PI)) * (1 / (a * a) - 1 / (b * b))
}

/** Momentum matrix element P_{mn} = ⟨ψₘ|p|ψₙ⟩ for ISW (purely imaginary).
 *  Returns the coefficient A such that P_{mn} = −i·A.
 *  Non-zero only when m+n is odd:
 *  A_{mn} = 4mn / (L(m²−n²))  for m ≠ n
 */
function iswPmnCoeff(m: number, n: number, L: number): number {
  if (m === n) return 0
  if ((m + n) % 2 === 0) return 0
  return (4 * m * n) / (L * (m * m - n * n))
}

// ── ISW superposition ────────────────────────────────────────────────────────

/**
 * ψ(x,t) = Σ cₙ ψₙ(x) e^{−iEₙt}  (cₙ real, n = 1…8)
 * Returns { re, im } of the complex wavefunction value.
 */
export function iswPsi(
  x: number,
  t: number,
  coeffs: number[],
  L: number,
): { re: number; im: number } {
  let re = 0
  let im = 0
  for (let i = 0; i < coeffs.length; i++) {
    const n = i + 1
    const c = coeffs[i]
    if (c === 0) continue
    const E = iswEnergy(n, L)
    const psi = iswEigenPsi(n, L, x)
    re += c * psi * Math.cos(E * t)
    im -= c * psi * Math.sin(E * t)
  }
  return { re, im }
}

/** |ψ(x,t)|² = re² + im² */
export function iswProb(x: number, t: number, coeffs: number[], L: number): number {
  const { re, im } = iswPsi(x, t, coeffs, L)
  return re * re + im * im
}

/**
 * ⟨x(t)⟩ = L/2 + 2 Σ_{m>n} cₘ cₙ X_{mn} cos((Eₘ−Eₙ)t)
 * (exact, using X matrix elements; only m+n-odd pairs contribute)
 */
export function iswExpectX(t: number, coeffs: number[], L: number): number {
  let sum = L / 2  // diagonal contribution = L/2 · Σcₙ² = L/2 (assuming normalised)
  for (let mi = 0; mi < coeffs.length; mi++) {
    for (let ni = 0; ni < mi; ni++) {
      const m = mi + 1
      const n = ni + 1
      const Xmn = iswXmn(m, n, L)
      if (Xmn === 0) continue
      const dE = iswEnergy(m, L) - iswEnergy(n, L)
      sum += 2 * coeffs[mi] * coeffs[ni] * Xmn * Math.cos(dE * t)
    }
  }
  return sum
}

/**
 * ⟨p(t)⟩ = 2 Σ_{m>n, m+n odd} cₘ cₙ A_{mn} sin((Eₘ−Eₙ)t)
 * where A_{mn} = 4mn / (L(m²−n²))
 */
export function iswExpectP(t: number, coeffs: number[], L: number): number {
  let sum = 0
  for (let mi = 0; mi < coeffs.length; mi++) {
    for (let ni = 0; ni < mi; ni++) {
      const m = mi + 1
      const n = ni + 1
      const A = iswPmnCoeff(m, n, L)
      if (A === 0) continue
      const dE = iswEnergy(m, L) - iswEnergy(n, L)
      sum += 2 * coeffs[mi] * coeffs[ni] * A * Math.sin(dE * t)
    }
  }
  return sum
}

/**
 * ⟨x²(t)⟩ = Σ_{m,n} cₘ cₙ X²_{mn} e^{i(Eₘ−Eₙ)t}
 * where X²_{mn} = ⟨ψₘ|x²|ψₙ⟩.
 *
 * For ISW: X²_{nn} = L²(1/3 − 1/(2n²π²))
 * Off-diagonal: computed numerically from grid (cheap, 400 pts).
 * This is only used for Δx = √(⟨x²⟩ − ⟨x⟩²).
 */
export function iswExpectX2(t: number, coeffs: number[], L: number): number {
  const N = 400
  const dx = L / N
  let sum = 0
  for (let k = 0; k <= N; k++) {
    const x = k * dx
    const w = (k === 0 || k === N) ? 0.5 : 1
    const prob = iswProb(x, t, coeffs, L)
    sum += w * x * x * prob * dx
  }
  return sum
}

/**
 * ⟨p²(t)⟩ = Σ cₙ² Eₙ²·2 = Σ cₙ² ⟨p²⟩ₙ
 * In fact ⟨p²⟩ₙ = 2Eₙ (since KE = p²/2 = Eₙ for ISW).
 * Off-diagonal p² matrix elements vanish (p² is diagonal in energy eigenbasis).
 * Wait — p² = 2H in ISW, so ⟨p²(t)⟩ = 2⟨H⟩ = 2 Σ cₙ² Eₙ (time-independent).
 */
export function iswExpectP2(coeffs: number[], L: number): number {
  let sum = 0
  for (let i = 0; i < coeffs.length; i++) {
    sum += coeffs[i] * coeffs[i] * 2 * iswEnergy(i + 1, L)
  }
  return sum
}

/** T_rev = 4ML²/π, M = 1 in a.u. → 4L²/π */
export function iswRevivalPeriod(L: number): number {
  return (4 * L * L) / Math.PI
}

// ── HO coherent state ────────────────────────────────────────────────────────

/**
 * |ψ_α(x,t)|² = √(ω/π) · exp(−ω(x−⟨x(t)⟩)²)
 * Exact closed-form Gaussian; no truncation needed for probability density.
 */
export function hoCoherentProb(
  x: number,
  t: number,
  alpha: number,
  phiAlpha: number,
  omega: number,
): number {
  const xMean = hoCoherentExpectX(t, alpha, phiAlpha, omega)
  const dx = x - xMean
  return Math.sqrt(omega / Math.PI) * Math.exp(-omega * dx * dx)
}

/** ⟨x(t)⟩ = |α|√(2/ω) cos(ωt + φ_α) */
export function hoCoherentExpectX(
  t: number,
  alpha: number,
  phiAlpha: number,
  omega: number,
): number {
  return alpha * Math.sqrt(2 / omega) * Math.cos(omega * t + phiAlpha)
}

/** ⟨p(t)⟩ = −|α|√(2ω) sin(ωt + φ_α) */
export function hoCoherentExpectP(
  t: number,
  alpha: number,
  phiAlpha: number,
  omega: number,
): number {
  return -alpha * Math.sqrt(2 * omega) * Math.sin(omega * t + phiAlpha)
}

/** Δx = 1/√(2ω) — constant for coherent state */
export function hoCoherentDeltaX(omega: number): number {
  return 1 / Math.sqrt(2 * omega)
}

/** Δp = √(ω/2) — constant for coherent state */
export function hoCoherentDeltaP(omega: number): number {
  return Math.sqrt(omega / 2)
}

// ── HO squeezed coherent state ────────────────────────────────────────────────

/**
 * σ(t) — position Gaussian width for squeezed state.
 * σ²(t) = (1/ω) · (cosh(2r) − sinh(2r)·cos(2ωt))
 * At t=0: σ = e^{−r}/√ω (squeezed);  at t=π/ω: σ = e^r/√ω (anti-squeezed).
 */
export function hoSqueezedSigmaX(t: number, omega: number, r: number): number {
  return Math.sqrt((1 / omega) * (Math.cosh(2 * r) - Math.sinh(2 * r) * Math.cos(2 * omega * t)))
}

/** σ_p(t) — momentum Gaussian width for squeezed state.
 *  σ_p²(t) = ω · (cosh(2r) + sinh(2r)·cos(2ωt))
 */
export function hoSqueezedSigmaP(t: number, omega: number, r: number): number {
  return Math.sqrt(omega * (Math.cosh(2 * r) + Math.sinh(2 * r) * Math.cos(2 * omega * t)))
}

/** Δx(t) = σ(t)/√2 */
export function hoSqueezedDeltaX(t: number, omega: number, r: number): number {
  return hoSqueezedSigmaX(t, omega, r) / Math.SQRT2
}

/** Δp(t) = σ_p(t)/√2 */
export function hoSqueezedDeltaP(t: number, omega: number, r: number): number {
  return hoSqueezedSigmaP(t, omega, r) / Math.SQRT2
}

/**
 * Fock-state occupation probabilities P(n) = |⟨n|ψ_sq(t=0)⟩|² for
 * the displaced squeezed vacuum D(α)S(r)|0⟩.
 *
 * ψ_sq(x,0) = (ω·e^{2r}/π)^{1/4} · exp(−ω·e^{2r}/2·(x−x₀)²) · exp(i·p₀·x)
 * where x₀ = α√(2/ω)cos(φ_α),  p₀ = −α√(2ω)sin(φ_α).
 *
 * P(n) is computed numerically via ∫ ψ_n*(x) ψ_sq(x,0) dx on a fine grid.
 */
export function squeezedFockDist(
  alpha: number, phiAlpha: number, omega: number, r: number, nMax = 20
): number[] {
  const x0 = alpha * Math.sqrt(2 / omega) * Math.cos(phiAlpha)
  const p0 = -alpha * Math.sqrt(2 * omega) * Math.sin(phiAlpha)
  const omegaSq = omega * Math.exp(2 * r)          // squeezed Gaussian width parameter
  const norm = Math.pow(omegaSq / Math.PI, 0.25)   // overall amplitude factor

  // Grid must cover both the squeezed Gaussian and the HO eigenfunctions
  const sigmaX = 1 / Math.sqrt(omegaSq)
  const xMax = Math.max(
    Math.abs(x0) + 6 * sigmaX,
    Math.sqrt((2 * nMax + 1) / omega) * 2.0,
  )
  const N = 800
  const dx = (2 * xMax) / (N - 1)

  return Array.from({ length: nMax }, (_, n) => {
    let re = 0, im = 0
    for (let k = 0; k < N; k++) {
      const x = -xMax + k * dx
      const psiN = hoWavefunction(n, x, omega)
      const envelope = norm * Math.exp(-omegaSq / 2 * (x - x0) * (x - x0))
      const phase = p0 * x
      re += psiN * envelope * Math.cos(phase) * dx
      im += psiN * envelope * Math.sin(phase) * dx
    }
    return re * re + im * im
  })
}

/**
 * |ψ_sq(x,t)|² for HO squeezed coherent state — exact Gaussian.
 *
 * |ψ_sq(x,t)|² = (1/(√π·σ(t))) · exp(−(x − ⟨x(t)⟩)² / σ²(t))
 *
 * Centre oscillates at ω (same as coherent); width breathes at 2ω.
 */
export function hoSqueezedProb(
  x: number,
  t: number,
  alpha: number,
  phiAlpha: number,
  omega: number,
  r: number,
): number {
  const xMean = hoCoherentExpectX(t, alpha, phiAlpha, omega)
  const sigma = hoSqueezedSigmaX(t, omega, r)
  const dx = x - xMean
  return Math.exp(-dx * dx / (sigma * sigma)) / (Math.sqrt(Math.PI) * sigma)
}
