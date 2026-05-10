/**
 * Morse potential — exact bound-state solutions (atomic units: ħ = m = 1).
 *
 * V(x) = D_e (e^{−2αx} − 2 e^{−αx})   [minimum −D_e at x=0, V→0 as x→∞]
 *
 * Exact eigenvalues:  E_n = −α²(λ − n − ½)²/2,  n = 0…n_max
 *
 * Exact wavefunctions:  ψ_n(x) = N_n · z^{λ−n−½} · e^{−z/2} · L_n^(k)(z)
 *   where z = 2λ e^{−αx}, k = 2λ−2n−1, N_n = √(α·k·n!/Γ(2λ−n))
 *
 * λ = √(2D_e)/α (dimensionless well depth), ω_e = α²λ (harmonic frequency).
 */

// ── Gamma function (Lanczos, g=7, accurate to ~1e-15) ─────────────────────────

function gamma(z: number): number {
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z))
  z -= 1
  const c = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313,  -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
  ]
  let x = c[0]
  for (let i = 1; i < 9; i++) x += c[i] / (z + i)
  const t = z + 7.5
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x
}

function factorial(n: number): number {
  let f = 1
  for (let i = 2; i <= n; i++) f *= i
  return f
}

// ── Physics exports ────────────────────────────────────────────────────────────

/** Morse potential V(x) = De(e^{−2αx} − 2e^{−αx}) */
export function morseV(x: number, De: number, alpha: number): number {
  const u = Math.exp(-alpha * x)
  return De * (u * u - 2 * u)
}

/** Dimensionless well depth λ = √(2De)/α */
export function morseLambda(De: number, alpha: number): number {
  return Math.sqrt(2 * De) / alpha
}

/** Harmonic frequency at the potential minimum ω_e = α√(2De) */
export function morseOmega(De: number, alpha: number): number {
  return alpha * Math.sqrt(2 * De)
}

/** Number of bound states = ⌊λ − ½⌋ + 1 */
export function morseNBound(De: number, alpha: number): number {
  return Math.floor(morseLambda(De, alpha) - 0.5) + 1
}

/** Exact eigenvalue E_n = −α²(λ − n − ½)²/2 */
export function morseEnergy(n: number, De: number, alpha: number): number {
  const nu = morseLambda(De, alpha) - n - 0.5
  return -0.5 * alpha * alpha * nu * nu
}

/**
 * Classical turning points [x_left, x_right] for state n.
 * Solves V(x) = E_n: β = √(1 + E_n/De), then x = −ln(1 ± β)/α.
 */
export function morseTurningPoints(n: number, De: number, alpha: number): [number, number] {
  const E = morseEnergy(n, De, alpha)
  const beta = Math.sqrt(Math.max(0, 1 + E / De))
  const xLeft  = -Math.log(1 + beta) / alpha
  const xRight = -Math.log(Math.max(1e-300, 1 - beta)) / alpha
  return [xLeft, xRight]
}

/**
 * Associated Laguerre polynomial L_n^k(z) via the three-term recurrence.
 * Valid for all real k > −1 and z ≥ 0.
 *   L_0^k = 1
 *   L_1^k = 1 + k − z
 *   n·L_n^k = (2n−1+k−z)·L_{n−1}^k − (n−1+k)·L_{n−2}^k
 */
export function laguerreAssoc(n: number, k: number, z: number): number {
  if (n === 0) return 1
  if (n === 1) return 1 + k - z
  let prev2 = 1
  let prev1 = 1 + k - z
  for (let i = 2; i <= n; i++) {
    const curr = ((2 * i - 1 + k - z) * prev1 - (i - 1 + k) * prev2) / i
    prev2 = prev1
    prev1 = curr
  }
  return prev1
}

/**
 * Normalized bound-state wavefunction ψ_n(x).
 * Returns 0 outside the valid range (n ≥ N_bound or z numerically too large).
 */
export function morsePsi(x: number, n: number, De: number, alpha: number): number {
  const lambda = morseLambda(De, alpha)
  const k = 2 * lambda - 2 * n - 1
  if (k <= 0) return 0
  const z = 2 * lambda * Math.exp(-alpha * x)
  // Guard against overflow: e^{-z/2} underflows long before z^s can compensate
  if (z > 600) return 0
  const norm = Math.sqrt(alpha * k * factorial(n) / gamma(2 * lambda - n))
  return norm * Math.pow(z, lambda - n - 0.5) * Math.exp(-z / 2) * laguerreAssoc(n, k, z)
}

/** |ψ_n(x)|² */
export function morseProb(x: number, n: number, De: number, alpha: number): number {
  const psi = morsePsi(x, n, De, alpha)
  return psi * psi
}
