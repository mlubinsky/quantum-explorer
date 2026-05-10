/**
 * Two identical particles in an infinite square well — exact analytical.
 * All in atomic units: ħ = m = 1.
 *
 * Statistics:
 *   Distinguishable: ψ(x₁,x₂) = ψₘ(x₁) ψₙ(x₂)
 *   Bosons  (m≠n):  [ψₘ(x₁)ψₙ(x₂) + ψₙ(x₁)ψₘ(x₂)] / √2
 *   Bosons  (m=n):  ψₘ(x₁)ψₘ(x₂)
 *   Fermions(m≠n):  [ψₘ(x₁)ψₙ(x₂) − ψₙ(x₁)ψₘ(x₂)] / √2  (Slater determinant)
 *   Fermions(m=n):  0  (Pauli exclusion — state forbidden)
 */

import { iswPsi, iswEnergy } from './isw'

export type Statistics = 'distinguishable' | 'bosons' | 'fermions'

/** Fermions require m ≠ n; all other combinations are allowed. */
export function isAllowed(m: number, n: number, stat: Statistics): boolean {
  return !(stat === 'fermions' && m === n)
}

/**
 * Two-particle wavefunction value ψ(x₁, x₂).
 * Returns 0 for the forbidden case (fermions, m=n).
 */
export function twoParticlePsi(
  m: number, n: number,
  x1: number, x2: number,
  L: number, stat: Statistics,
): number {
  const phi1m = iswPsi(m, L, x1)
  const phi2n = iswPsi(n, L, x2)
  if (stat === 'distinguishable') return phi1m * phi2n
  if (m === n) return stat === 'bosons' ? phi1m * phi2n : 0
  const phi1n = iswPsi(n, L, x1)
  const phi2m = iswPsi(m, L, x2)
  const sign = stat === 'bosons' ? 1 : -1
  return (phi1m * phi2n + sign * phi1n * phi2m) / Math.SQRT2
}

/** |ψ(x₁, x₂)|² */
export function twoParticleDensity(
  m: number, n: number,
  x1: number, x2: number,
  L: number, stat: Statistics,
): number {
  const psi = twoParticlePsi(m, n, x1, x2, L, stat)
  return psi * psi
}

/** E = Eₘ + Eₙ = (m² + n²)π²/(2L²) */
export function twoParticleEnergy(m: number, n: number, L: number): number {
  return iswEnergy(m, L) + iswEnergy(n, L)
}

/**
 * Single-particle density ρ(x) = ∫₀ᴸ |ψ(x, x₂)|² dx₂  — exact, no quadrature.
 *
 * Bosons / Fermions (m ≠ n): ρ(x) = ½(|ψₘ(x)|² + |ψₙ(x)|²)
 *   The exchange cross-term ∫ψₘ(x₂)ψₙ(x₂)dx₂ = 0 by orthogonality, so
 *   bosons and fermions share the same single-particle marginal.
 *
 * Distinguishable (particle 1 in m): ρ₁(x) = |ψₘ(x)|²
 * m = n case: ρ(x) = |ψₘ(x)|²
 */
export function singleParticleDensity(
  m: number, n: number,
  x: number, L: number, stat: Statistics,
): number {
  const pm2 = iswPsi(m, L, x) ** 2
  if (stat === 'distinguishable' || m === n) return pm2
  return 0.5 * (pm2 + iswPsi(n, L, x) ** 2)
}

/**
 * |ψ(x, x)|² — two-particle density on the x₁ = x₂ diagonal.
 *
 * Fermions:       0  (Pauli exchange hole — particles never meet)
 * Bosons (m≠n):   2 ψₘ(x)² ψₙ(x)²  (factor-2 HBT bunching vs distinguishable)
 * Distinguishable: ψₘ(x)² ψₙ(x)²
 */
export function diagonalDensity(
  m: number, n: number,
  x: number, L: number, stat: Statistics,
): number {
  return twoParticleDensity(m, n, x, x, L, stat)
}

export interface DensityGrid {
  xVals: number[]
  /** grid[j][i] = |ψ(xVals[i], xVals[j])|²   (Plotly heatmap convention) */
  grid: number[][]
  zMax: number
}

/** Evaluate |ψ(x₁,x₂)|² on an N×N grid over [0,L]×[0,L]. */
export function computeDensityGrid(
  m: number, n: number, L: number, stat: Statistics, N = 80,
): DensityGrid {
  const xVals = Array.from({ length: N }, (_, i) => (i / (N - 1)) * L)
  let zMax = 0
  const grid: number[][] = Array.from({ length: N }, (_, j) =>
    Array.from({ length: N }, (_, i) => {
      const d = twoParticleDensity(m, n, xVals[i], xVals[j], L, stat)
      if (d > zMax) zMax = d
      return d
    })
  )
  return { xVals, grid, zMax }
}
