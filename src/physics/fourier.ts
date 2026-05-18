/**
 * Fourier Explorer physics — atomic units (ħ = m = 1).
 *
 * Reuses fpProb / fpMomentumDist / fpRePsi / fpImPsi (freeParticle.ts)
 * and iswMomentumDist (momentumSpace.ts) for Gaussian and ISW modes.
 * This file provides the chirped-packet math and uncertainty helpers.
 */

// ── Gaussian uncertainty helpers ──────────────────────────────────────────────

/** Δx for a Gaussian wavepacket with width σ. */
export function gaussianDeltaX(sigma: number): number {
  return sigma
}

/** Δk for a Gaussian wavepacket with width σ — equals 1/(2σ). */
export function gaussianDeltaK(sigma: number): number {
  return 1 / (2 * sigma)
}

// ── ISW uncertainty helper ────────────────────────────────────────────────────

/**
 * Δk for ISW eigenstate n in well of width L.
 *
 * Since ψₙ is real, ⟨k⟩ = 0 and ⟨k²⟩ = 2Eₙ = (nπ/L)².
 * Therefore Δk = nπ/L — exact.
 */
export function iswDeltaK(n: number, L: number): number {
  return (n * Math.PI) / L
}

// ── Chirped Gaussian ──────────────────────────────────────────────────────────

/**
 * Momentum-space width for a chirped Gaussian.
 *
 * For ψ_β(x) = envelope × exp(i[k₀x + β(x−x₀)²/2]):
 *
 *   σ_k = √(1/(4σ²) + β²σ²)
 *
 * At β = 0: σ_k = 1/(2σ) — minimum uncertainty.
 * At β ≠ 0: σ_k > 1/(2σ) — chirp spreads the spectrum.
 */
export function chirpedDeltaK(sigma: number, beta: number): number {
  return Math.sqrt(1 / (4 * sigma * sigma) + beta * beta * sigma * sigma)
}

/**
 * |φ_β(k)|² — exact FT magnitude squared for the chirped Gaussian.
 *
 * The FT of a chirped Gaussian is itself a Gaussian in k:
 *   |φ_β(k)|² = (1/(σ_k√(2π))) exp(−(k−k₀)²/(2σ_k²))
 * where σ_k = chirpedDeltaK(σ, β).
 */
export function chirpedFTMag2(k: number, sigma: number, k0: number, beta: number): number {
  const sigmaK = chirpedDeltaK(sigma, beta)
  const dk = k - k0
  return (1 / (sigmaK * Math.sqrt(2 * Math.PI))) * Math.exp(-(dk * dk) / (2 * sigmaK * sigmaK))
}

/**
 * Re(ψ_β(x)) for the chirped Gaussian wavepacket.
 *
 * ψ_β(x) = (2πσ²)^(−1/4) exp(−(x−x₀)²/(4σ²)) exp(i[k₀x + β(x−x₀)²/2])
 */
export function chirpedRePsi(x: number, x0: number, sigma: number, k0: number, beta: number): number {
  const envelope = Math.pow(2 * Math.PI * sigma * sigma, -0.25) * Math.exp(-((x - x0) ** 2) / (4 * sigma * sigma))
  const phase = k0 * x + beta * (x - x0) ** 2 / 2
  return envelope * Math.cos(phase)
}

/**
 * Im(ψ_β(x)) for the chirped Gaussian wavepacket.
 */
export function chirpedImPsi(x: number, x0: number, sigma: number, k0: number, beta: number): number {
  const envelope = Math.pow(2 * Math.PI * sigma * sigma, -0.25) * Math.exp(-((x - x0) ** 2) / (4 * sigma * sigma))
  const phase = k0 * x + beta * (x - x0) ** 2 / 2
  return envelope * Math.sin(phase)
}
