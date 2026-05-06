/**
 * Exact momentum-space probability distributions for ISW and HO eigenstates.
 *
 * All in atomic units (ħ = m = 1).
 * FT convention: φ(k) = (1/√2π) ∫ ψ(x) e^{−ikx} dx
 */

import { hoWavefunction } from './harmonic'

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
