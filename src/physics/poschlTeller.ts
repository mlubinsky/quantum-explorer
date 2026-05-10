/**
 * Pöschl-Teller potential V(x) = −V₀ sech²(αx), atomic units ħ = m = 1.
 *
 * With V₀ = N(N+1)α²/2 (N a positive integer), the potential is reflectionless:
 *   T(E) = 1  for all E > 0  (R = 0 exactly)
 *
 * There are exactly N bound states:
 *   E_j = −α²(N−j)²/2,  j = 0, 1, ..., N−1
 *
 * Bound-state wavefunctions via the Rodrigues formula:
 *   ψ_j(x) ∝ P_N^{N−j}(tanh(αx)) = sech^m(αx) · [d^m P_N/du^m](tanh(αx))
 * where m = N−j and P_N is the Legendre polynomial.
 */

// ── Legendre polynomial helpers ──────────────────────────────────────────────

/**
 * Coefficients [c₀, c₁, ..., cN] of P_N(u) = Σ cᵢ uⁱ.
 * Computed via the recurrence (n+1)P_{n+1} = (2n+1)u P_n − n P_{n-1}.
 */
function legendreCoeffs(N: number): number[] {
  if (N === 0) return [1]
  if (N === 1) return [0, 1]
  let p0: number[] = [1]
  let p1: number[] = [0, 1]
  for (let n = 1; n < N; n++) {
    const len = n + 2
    const p2 = new Array<number>(len).fill(0)
    // (n+1)P_{n+1} = (2n+1)u·P_n − n·P_{n-1}
    for (let i = 1; i < len; i++) {
      if (p1[i - 1] !== undefined) p2[i] += (2 * n + 1) * p1[i - 1]
    }
    for (let i = 0; i < len; i++) {
      if (p0[i] !== undefined) p2[i] -= n * p0[i]
    }
    for (let i = 0; i < len; i++) p2[i] /= (n + 1)
    p0 = p1
    p1 = p2
  }
  return p1
}

/** Coefficients of the m-th derivative of the polynomial given by coeffs. */
function differentiateCoeffs(coeffs: number[], times: number): number[] {
  let c = [...coeffs]
  for (let d = 0; d < times; d++) {
    const dc = new Array<number>(Math.max(0, c.length - 1)).fill(0)
    for (let i = 1; i < c.length; i++) dc[i - 1] = i * c[i]
    c = dc
  }
  return c
}

/** Evaluate polynomial Σ cᵢ uⁱ at u via Horner's method. */
function evalPoly(coeffs: number[], u: number): number {
  let result = 0
  for (let i = coeffs.length - 1; i >= 0; i--) {
    result = result * u + coeffs[i]
  }
  return result
}

// ── Unnormalised bound-state wavefunction ────────────────────────────────────

/**
 * ψ_j(x) ∝ sech^m(αx) · [d^m P_N/du^m](tanh(αx)),  m = N−j.
 *
 * This is P_N^m(tanh(αx)) via the Rodrigues formula (without Condon-Shortley phase).
 */
function ptPsiUnnorm(x: number, N: number, j: number, alpha: number): number {
  const ax = alpha * x
  const u = Math.tanh(ax)
  const s = 1 / Math.cosh(ax)   // sech(αx)
  const m = N - j                // associated Legendre order

  const coeffs = legendreCoeffs(N)
  const diffed = differentiateCoeffs(coeffs, m)
  const polyVal = evalPoly(diffed, u)

  return Math.pow(s, m) * polyVal
}

// ── Public API ────────────────────────────────────────────────────────────────

/** V₀ = N(N+1)α²/2 */
export function ptV0(N: number, alpha: number): number {
  return N * (N + 1) * alpha * alpha / 2
}

/** V(x) = −V₀ sech²(αx) */
export function ptPotential(x: number, N: number, alpha: number): number {
  const s = 1 / Math.cosh(alpha * x)
  return -ptV0(N, alpha) * s * s
}

/**
 * Bound-state energy E_j = −α²(N−j)²/2 for j = 0..N−1.
 * j = 0 is the ground state (deepest).
 */
export function ptBoundEnergy(N: number, j: number, alpha: number): number {
  const kappa = (N - j) * alpha
  return -kappa * kappa / 2
}

/**
 * Normalised |ψ_j(x)|² evaluated at each x in xArr.
 *
 * Computes unnormalised ψ_j via the Rodrigues formula, then divides by
 * ∫|ψ|² dx computed once by trapezoidal rule over xArr.
 * xArr should span at least ±8/alpha for < 0.1% normalisation error.
 */
export function ptBoundPsiSqArray(
  xArr: number[], N: number, j: number, alpha: number,
): number[] {
  const unnorm = xArr.map(x => ptPsiUnnorm(x, N, j, alpha))

  // Trapezoidal normalisation
  const dx = (xArr[xArr.length - 1] - xArr[0]) / (xArr.length - 1)
  let norm2 = 0
  for (let i = 0; i < unnorm.length; i++) {
    const w = (i === 0 || i === unnorm.length - 1) ? 0.5 : 1
    norm2 += w * unnorm[i] * unnorm[i]
  }
  norm2 *= dx

  return unnorm.map(u => u * u / norm2)
}
