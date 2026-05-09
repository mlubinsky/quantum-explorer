/** E(θ) = −cos θ — two-spin singlet correlation */
export function bellCorrelation(theta: number): number {
  return -Math.cos(theta)
}

/** CHSH value S for four detector angles (radians) */
export function chshS(a: number, aPrime: number, b: number, bPrime: number): number {
  const eab = bellCorrelation(b - a)
  const eabP = bellCorrelation(bPrime - a)
  const eaPb = bellCorrelation(b - aPrime)
  const eaPbP = bellCorrelation(bPrime - aPrime)
  return Math.abs(eab - eabP + eaPb + eaPbP)
}

/**
 * Simulate N singlet pairs; returns { samePairs, oppositePairs, eEstimate }.
 *
 * Convention: "same" = both +1 or both −1 → product +1; E = (same−opposite)/n → −cosθ ✓
 * P(opposite) = (1+cosθ)/2, P(same) = (1−cosθ)/2.
 *
 * @param rng - Optional RNG; defaults to Math.random so successive calls give different results.
 *              Pass a deterministic function for reproducible tests.
 */
export function simulatePairs(
  theta: number,
  n: number,
  rng: () => number = Math.random,
): { samePairs: number; oppositePairs: number; eEstimate: number } {
  if (n === 0) return { samePairs: 0, oppositePairs: 0, eEstimate: 0 }

  const pOpposite = (1 + Math.cos(theta)) / 2

  let samePairs = 0
  let oppositePairs = 0

  for (let i = 0; i < n; i++) {
    if (rng() < pOpposite) {
      oppositePairs++
    } else {
      samePairs++
    }
  }

  const eEstimate = (samePairs - oppositePairs) / n
  return { samePairs, oppositePairs, eEstimate }
}
