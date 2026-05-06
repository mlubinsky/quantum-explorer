/** 1D quantum harmonic oscillator — atomic units ħ = m = 1.
 *  V(x) = ½ω²x²,  E_n = ω(n + ½),  n = 0, 1, 2, …
 */

export interface EigenstateData {
  x: number[]
  psi: number[]
  psi2: number[]
  energy: number
  n: number
}

/** H_n(x) via three-term recurrence:
 *  H_0 = 1,  H_1 = 2x,  H_{k+1} = 2x·H_k − 2k·H_{k-1}
 */
export function hermiteH(n: number, x: number): number {
  if (n === 0) return 1
  if (n === 1) return 2 * x
  let h0 = 1
  let h1 = 2 * x
  for (let k = 1; k < n; k++) {
    const h2 = 2 * x * h1 - 2 * k * h0
    h0 = h1
    h1 = h2
  }
  return h1
}

/** E_n = ω(n + ½) */
export function hoEnergy(n: number, omega = 1): number {
  return omega * (n + 0.5)
}

/** Classical turning point x_c where V(x_c) = E_n → x_c = √((2n+1)/ω) */
export function hoTurningPoint(n: number, omega = 1): number {
  return Math.sqrt((2 * n + 1) / omega)
}

/** V(x) = ½ω²x² */
export function hoPotential(x: number, omega = 1): number {
  return 0.5 * omega * omega * x * x
}

/** ψ_n(x) = N_n H_n(√ω·x) exp(−ωx²/2)
 *  Normalisation computed in log-space to avoid factorial overflow.
 */
export function hoWavefunction(n: number, x: number, omega = 1): number {
  let logFact = 0
  for (let k = 1; k <= n; k++) logFact += Math.log(k)
  const logNorm = 0.25 * Math.log(omega / Math.PI) - 0.5 * (n * Math.LN2 + logFact)
  return Math.exp(logNorm) * hermiteH(n, Math.sqrt(omega) * x) * Math.exp((-omega * x * x) / 2)
}

export function hoEigenstate(n: number, omega = 1, nPoints = 500): EigenstateData {
  const xMax = hoTurningPoint(n, omega) * 1.8 + 1.5
  const x = Array.from({ length: nPoints }, (_, i) => -xMax + (2 * xMax * i) / (nPoints - 1))
  const psi = x.map(xi => hoWavefunction(n, xi, omega))
  const psi2 = psi.map(p => p * p)
  return { x, psi, psi2, energy: hoEnergy(n, omega), n }
}

/** ⟨x⟩ = 0 for all eigenstates (by symmetry) */
export function hoExpectX(): number { return 0 }

/** ⟨x²⟩ = (n + ½)/ω */
export function hoExpectX2(n: number, omega = 1): number {
  return (n + 0.5) / omega
}

/** σ_x = √(⟨x²⟩) = √((n+½)/ω) */
export function hoSigmaX(n: number, omega = 1): number {
  return Math.sqrt(hoExpectX2(n, omega))
}
