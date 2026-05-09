/**
 * Exact momentum-space probability distributions for ISW and HO eigenstates.
 *
 * All in atomic units (ħ = m = 1).
 * FT convention: φ(k) = (1/√2π) ∫ ψ(x) e^{−ikx} dx
 */

import { hoWavefunction } from './harmonic'
import { iswEnergy } from './isw'
import { hoSqueezedSigmaP, hoCoherentExpectP } from './timeEvolution'

/**
 * ISW momentum distribution |φₙ(k)|² — exact closed form.
 *
 *   |φₙ(k)|² = (4n²π / L³) · sin²(kL/2 − nπ/2) / ((nπ/L)² − k²)²
 *
 * At the poles k = ±nπ/L the expression is 0/0; the resolved limit is L/(4π).
 * The peaks at k = ±nπ/L are the de Broglie wavenumbers for energy Eₙ.
 */
export function iswMomentumDist(n: number, L: number, k: number): number {
  const kn = n * Math.PI / L
  const denom2 = (kn * kn - k * k)   // ((nπ/L)² − k²)

  if (Math.abs(denom2) < 1e-9 * kn * kn) {
    return L / (4 * Math.PI)           // resolved limit at k = ±kₙ
  }

  const num = (4 * n * n * Math.PI / (L * L * L)) *
              Math.pow(Math.sin(k * L / 2 - n * Math.PI / 2), 2)
  return num / (denom2 * denom2)
}

/**
 * HO momentum distribution |φₙ(k; ω)|² — exact via self-duality.
 *
 * For V(x) = ½ω²x² the Fourier transform maps ψₙ(·; ω) to φₙ(·; ω) such that:
 *
 *   |φₙ(k; ω)|² = |ψₙ(k; 1/ω)|²  =  hoWavefunction(n, k, 1/ω)²
 *
 * At ω = 1: |φₙ(k)|² = |ψₙ(k)|² — position and momentum distributions
 * are identical.  At ω > 1 the position wavefunction is compressed and the
 * momentum wavefunction is spread out (Heisenberg uncertainty).
 */
export function hoMomentumDist(n: number, omega: number, k: number): number {
  const psi = hoWavefunction(n, k, 1 / omega)
  return psi * psi
}

/**
 * ISW momentum grid for plotting.
 * k range: [−kMax, kMax] where kMax = max(5·nπ/L, 8/L) to cover all
 * significant probability mass including the n-th harmonic peaks.
 */
export function iswMomentumGrid(
  n: number, L: number, nPoints = 500
): { k: number[], phi2: number[] } {
  const kMax = Math.max(5 * n * Math.PI / L, 8 / L)
  const k = Array.from({ length: nPoints }, (_, i) => -kMax + (2 * kMax * i) / (nPoints - 1))
  const phi2 = k.map(ki => iswMomentumDist(n, L, ki))
  return { k, phi2 }
}

/**
 * HO momentum grid for plotting.
 * Uses the same x-extent as hoEigenstate but in k-space:
 * kMax chosen so the 1/ω-scaled Gaussian contains 99.9% of the distribution.
 */
export function hoMomentumGrid(
  n: number, omega: number, nPoints = 500
): { k: number[], phi2: number[] } {
  // The k-space wavefunction has scale √(1/ω): use same extent formula as hoEigenstate
  const omegaEff = 1 / omega
  const kTurn = Math.sqrt((2 * n + 1) / omegaEff)
  const kMax = kTurn * 1.8 + 1.5
  const k = Array.from({ length: nPoints }, (_, i) => -kMax + (2 * kMax * i) / (nPoints - 1))
  const phi2 = k.map(ki => hoMomentumDist(n, omega, ki))
  return { k, phi2 }
}

// ── Time-evolved momentum distributions ─────────────────────────────────────

/**
 * Complex FT amplitude φₙ(k) for ISW eigenstate n.
 *
 * φₙ(k) = 1/√(πL) · (1 − (−1)ⁿ e^{−ikL}) · nπ/L / ((nπ/L)² − k²)
 *
 * At the pole k = ±nπ/L: φₙ(kₙ) = −i(−1)ⁿ · √(L/(4π)) [resolved limit].
 * Satisfies |φₙ(k)|² = iswMomentumDist(n, L, k).
 */
export function iswMomentumAmplitude(n: number, L: number, k: number): { re: number; im: number } {
  const kn = n * Math.PI / L
  const denom = kn * kn - k * k
  const scale = 1 / Math.sqrt(Math.PI * L)

  if (Math.abs(denom) < 1e-9 * kn * kn) {
    // Resolved limit at k = ±kₙ: lim_{k→kₙ} φₙ(k) = −i · √(L/(4π)) for all n
    // (verified by L'Hôpital; sign is −√(L/4π) in Im part, independent of n)
    return { re: 0, im: -Math.sqrt(L / (4 * Math.PI)) }
  }

  // numerator: (1 − (−1)ⁿ e^{−ikL}) = (1 − (−1)ⁿ cos(kL)) + i·(−1)ⁿ sin(kL)
  const sgn = (n % 2 === 0) ? 1 : -1  // (−1)ⁿ
  const numRe = 1 - sgn * Math.cos(k * L)
  const numIm = sgn * Math.sin(k * L)

  // multiply by (nπ/L) / denom and scale
  const factor = (kn / denom) * scale
  return { re: numRe * factor, im: numIm * factor }
}

/**
 * |φ(k,t)|² for ISW time-evolving superposition.
 * φ(k,t) = Σₙ cₙ e^{−iEₙt} φₙ(k)
 * coeffs[i] = cᵢ₊₁, real, normalised.
 */
export function iswMomentumProbTE(
  k: number, t: number, coeffs: number[], L: number
): number {
  let re = 0
  let im = 0
  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i]
    if (c === 0) continue
    const n = i + 1
    const E = iswEnergy(n, L)
    const phi = iswMomentumAmplitude(n, L, k)
    const cosEt = Math.cos(E * t)
    const sinEt = Math.sin(E * t)
    // c * e^{−iEt} * φₙ(k) = c * (cosEt − i sinEt) * (phi.re + i phi.im)
    re += c * (phi.re * cosEt + phi.im * sinEt)
    im += c * (phi.im * cosEt - phi.re * sinEt)
  }
  return re * re + im * im
}

/**
 * |φ_α(k,t)|² for HO coherent state — exact Gaussian in momentum space.
 *
 * |φ_α(k,t)|² = (1/√(πω)) · exp(−(k − ⟨p(t)⟩)² / ω)
 *
 * Width Δp = √(ω/2) = constant (dual of Δx = 1/√(2ω) in position space).
 * Peak slides with ⟨p(t)⟩ = −|α|√(2ω) sin(ωt + φ_α).
 */
export function hoCoherentMomentumProb(
  k: number, t: number, alpha: number, phiAlpha: number, omega: number
): number {
  const pMean = -alpha * Math.sqrt(2 * omega) * Math.sin(omega * t + phiAlpha)
  const dk = k - pMean
  return Math.sqrt(1 / (Math.PI * omega)) * Math.exp(-dk * dk / omega)
}

/**
 * |φ_sq(k,t)|² for HO squeezed coherent state — exact Gaussian in momentum space.
 *
 * |φ_sq(k,t)|² = (1/(√π · σ_p(t))) · exp(−(k − ⟨p(t)⟩)² / σ_p²(t))
 *
 * σ_p(t) = √[ω · (cosh(2r) + sinh(2r)·cos(2ωt))]
 * At t=0: σ_p = e^r/√ω (anti-squeezed in p, dual of squeezed x).
 */
export function hoSqueezedMomentumProb(
  k: number, t: number, alpha: number, phiAlpha: number, omega: number, r: number
): number {
  const pMean = hoCoherentExpectP(t, alpha, phiAlpha, omega)
  const sigmaP = hoSqueezedSigmaP(t, omega, r)
  const dk = k - pMean
  return Math.exp(-dk * dk / (sigmaP * sigmaP)) / (Math.sqrt(Math.PI) * sigmaP)
}
