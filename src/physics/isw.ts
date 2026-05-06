/** Infinite square well (particle in a box) — atomic units ħ = m = 1.
 *  Well occupies x ∈ [0, L], V = 0 inside, V = ∞ outside.
 *  Quantum number n = 1, 2, 3, …  (n = 1 is ground state)
 */

export interface EigenstateData {
  x: number[]
  psi: number[]
  psi2: number[]
  energy: number
  n: number
}

/** E_n = n²π²/(2L²) */
export function iswEnergy(n: number, L: number): number {
  return (n * n * Math.PI * Math.PI) / (2 * L * L)
}

/** ψ_n(x) = √(2/L) sin(nπx/L), zero outside [0, L] */
export function iswPsi(n: number, L: number, x: number): number {
  if (x <= 0 || x >= L) return 0
  return Math.sqrt(2 / L) * Math.sin((n * Math.PI * x) / L)
}

export function iswEigenstate(n: number, L: number, nPoints = 500): EigenstateData {
  const x = Array.from({ length: nPoints }, (_, i) => (i / (nPoints - 1)) * L)
  const psi = x.map(xi => iswPsi(n, L, xi))
  const psi2 = psi.map(p => p * p)
  return { x, psi, psi2, energy: iswEnergy(n, L), n }
}

/** ⟨x⟩ = L/2 for all n (by symmetry) */
export function iswExpectX(_n: number, L: number): number {
  return L / 2
}

/** ⟨x²⟩ = L²(1/3 − 1/(2n²π²)) */
export function iswExpectX2(n: number, L: number): number {
  return L * L * (1 / 3 - 1 / (2 * n * n * Math.PI * Math.PI))
}

/** σ_x = √(⟨x²⟩ − ⟨x⟩²) */
export function iswSigmaX(n: number, L: number): number {
  const x2 = iswExpectX2(n, L)
  const x1 = iswExpectX(n, L)
  return Math.sqrt(x2 - x1 * x1)
}
