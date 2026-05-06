/** Transmission coefficient T(E, V0) — exact, using probability current ratio */
export function stepT(E: number, V0: number): number {
  if (E <= 0) return 0
  if (E <= V0) return 0   // total reflection (includes E = V0 limit)

  const k1 = Math.sqrt(2 * E)
  const k2 = Math.sqrt(2 * (E - V0))
  return (4 * k1 * k2) / Math.pow(k1 + k2, 2)
}

/** Reflection coefficient R = 1 − T */
export function stepR(E: number, V0: number): number {
  return 1 - stepT(E, V0)
}

/**
 * Exact stationary scattering wavefunction |ψ(x)|² for a step at x = 0.
 *
 * V(x) = 0 for x < 0, V0 for x ≥ 0.
 * Incident wave from the left with unit amplitude.
 */
export function stepPsiSq(x: number, E: number, V0: number): number {
  if (E <= 0) return 0

  const k1 = Math.sqrt(2 * E)

  if (x >= 0) {
    if (E <= V0) {
      // Evanescent: ψ_II = t·e^{−κx},  t = 2k₁/(k₁+iκ) → |t|² = 4k₁²/(k₁²+κ²)
      const kappa = Math.sqrt(2 * Math.max(V0 - E, 1e-14))
      const tSq = (4 * k1 * k1) / (k1 * k1 + kappa * kappa)
      return tSq * Math.exp(-2 * kappa * x)
    } else {
      // Propagating: ψ_II = t·e^{ik₂x}, |ψ_II|² = |t|² = T·(k₁/k₂)
      const k2 = Math.sqrt(2 * (E - V0))
      const T = stepT(E, V0)
      return T * (k1 / k2)
    }
  }

  // x < 0: ψ_I = e^{ik₁x} + r·e^{−ik₁x}
  // |ψ_I|² = 1 + R + 2·Re(r·e^{−2ik₁x})
  // For E > V0: r = (k₁−k₂)/(k₁+k₂) — real and positive/negative → Re(r·e^{−2ikx}) = r·cos(2k₁x)
  // For E ≤ V0: r = (k₁−iκ)/(k₁+iκ) — pure phase, |r|=1
  //   Re(r·e^{-2ik₁x}) = cos(2k₁x + 2·atan(κ/k₁) ) but simpler:
  //   r = (k₁−iκ)/(k₁+iκ): rRe = (k₁²−κ²)/(k₁²+κ²), rIm = −2k₁κ/(k₁²+κ²)
  //   Re(r·e^{−2ik₁x}) = rRe·cos(2k₁x) + rIm·sin(2k₁x)  [using e^{-iθ}=cos-i·sin]
  //   Wait: r·e^{−2ik₁x}: real part = rRe·cos(2k₁x) + rIm·sin(2k₁x)
  //   With rIm = −2k₁κ/(k₁²+κ²):
  //   Re(r·e^{-2ik₁x}) = ((k₁²-κ²)·cos(2k₁x) - 2k₁κ·sin(2k₁x)) / (k₁²+κ²)

  if (E <= V0) {
    const kappa = Math.sqrt(2 * Math.max(V0 - E, 1e-14))
    const denom = k1 * k1 + kappa * kappa
    const rRe = (k1 * k1 - kappa * kappa) / denom
    const rIm = -2 * k1 * kappa / denom
    const R = rRe * rRe + rIm * rIm  // = 1 exactly
    const cross = rRe * Math.cos(2 * k1 * x) + rIm * Math.sin(2 * k1 * x)
    return 1 + R + 2 * cross
  } else {
    const k2 = Math.sqrt(2 * (E - V0))
    const r = (k1 - k2) / (k1 + k2)   // real
    const R = r * r
    return 1 + R + 2 * r * Math.cos(2 * k1 * x)
  }
}

/** Penetration depth δ = 1/κ = 1/√(2(V0−E)) for E < V0 */
export function stepPenetrationDepth(E: number, V0: number): number {
  if (E >= V0) return Infinity
  return 1 / Math.sqrt(2 * (V0 - E))
}
