/**
 * Delta-function potential V(x) = g·δ(x), atomic units ħ = m = 1.
 *
 * g < 0  (attractive, g = −α, α > 0):
 *   One bound state E_b = −α²/2,  ψ_b(x) = √α · e^{−α|x|}
 *
 * g > 0  (repulsive, g = +α):
 *   No bound state.
 *
 * Scattering (E > 0), k = √(2E):
 *   T = k²/(k² + α²)  — same for attractive and repulsive
 *   R = α²/(k² + α²)
 *   T + R = 1  exactly
 *
 * Striking fact: T is independent of the sign of g — a very strong attractive
 * delta is as perfect a reflector as a very strong repulsive one.
 * The half-transmission energy for attractive delta equals the bound-state energy:
 *   T(|E_b|) = 1/2.
 */

/** Transmission coefficient T(E, α).  α = |g| ≥ 0. */
export function deltaT(E: number, alpha: number): number {
  if (E <= 0) return 0
  if (alpha === 0) return 1
  const k2 = 2 * E
  return k2 / (k2 + alpha * alpha)
}

/** Reflection coefficient R = 1 − T */
export function deltaR(E: number, alpha: number): number {
  return 1 - deltaT(E, alpha)
}

/**
 * Bound-state energy for attractive delta V = −α·δ(x), α > 0.
 * E_b = −α²/2  (unique; depth grows with coupling strength).
 */
export function deltaBoundEnergy(alpha: number): number {
  return -0.5 * alpha * alpha
}

/**
 * Bound-state probability density |ψ_b(x)|² = α·e^{−2α|x|}.
 * Normalised: ∫_{-∞}^{∞} |ψ_b|² dx = 1.
 */
export function deltaBoundPsiSq(x: number, alpha: number): number {
  return alpha * Math.exp(-2 * alpha * Math.abs(x))
}

/**
 * Stationary scattering probability density |ψ(x)|² for V = g·δ(x).
 *
 * sign = +1 → repulsive (g = +α), sign = -1 → attractive (g = -α).
 *
 * x < 0:  ψ = e^{ikx} + r·e^{−ikx}   →  standing-wave interference
 * x ≥ 0:  ψ = t·e^{ikx}              →  flat at T (no standing wave)
 *
 * Reflection amplitude:
 *   rRe = −α²/(k²+α²)  (same for both signs)
 *   rIm = −sign · αk/(k²+α²)
 */
export function deltaPsiSq(
  x: number, E: number, alpha: number, sign: 1 | -1,
): number {
  if (E <= 0) return 0
  const k = Math.sqrt(2 * E)
  const denom = k * k + alpha * alpha
  const T = k * k / denom
  const R = 1 - T

  if (x >= 0) return T

  const rRe = -alpha * alpha / denom
  const rIm = -sign * alpha * k / denom

  return 1 + R + 2 * (rRe * Math.cos(2 * k * x) + rIm * Math.sin(2 * k * x))
}
