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

/** Simulate N singlet pairs; returns { samePairs, oppositePairs, eEstimate } */
export function simulatePairs(
  theta: number,
  n: number,
): { samePairs: number; oppositePairs: number; eEstimate: number } {
  if (n === 0) return { samePairs: 0, oppositePairs: 0, eEstimate: 0 }

  // P(Bob opposite Alice) = (1 + cos θ) / 2  →  product = −1 (same sign, different outcome product)
  // Convention: "same" = both +1 or both −1, product = +1 → contributes +1
  //             "opposite" = one +1 one −1, product = −1 → contributes −1
  // E = ⟨ab⟩ = (same − opposite) / n  →  for singlet at θ=0, always opposite → E=−1 ✓
  // P(same) = (1−cosθ)/2, P(opposite) = (1+cosθ)/2
  // E = pSame−pOpposite = −cosθ ✓
  const pOpposite = (1 + Math.cos(theta)) / 2

  // LCG for deterministic but pseudo-random results
  let seed = 0x12345678
  const lcg = () => {
    seed = (Math.imul(1664525, seed) + 1013904223) >>> 0
    return seed / 0x100000000
  }

  let samePairs = 0
  let oppositePairs = 0

  for (let i = 0; i < n; i++) {
    if (lcg() < pOpposite) {
      oppositePairs++
    } else {
      samePairs++
    }
  }

  // product = +1 for same outcomes, −1 for opposite → E = ⟨ab⟩ = (same − opposite)/n
  const eEstimate = (samePairs - oppositePairs) / n
  return { samePairs, oppositePairs, eEstimate }
}
