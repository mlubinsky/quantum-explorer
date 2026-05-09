// Particle on a 1D ring with Aharonov-Bohm flux — exact analytical solutions
// Units: atomic units (ħ = m_e = e = 1).  Flux quantum Φ₀ = 2π.
// Dimensionless flux φ = Φ / Φ₀.

/** E_n(φ, R) = (n − φ)² / (2R²) */
export function ringEnergy(n: number, phi: number, R: number): number {
  return (n - phi) ** 2 / (2 * R * R)
}

/**
 * Ground-state quantum number: n*(φ) = round(φ).
 * Changes by ±1 at half-integer φ (level crossings).
 */
export function groundStateN(phi: number): number {
  return Math.round(phi) || 0
}

/**
 * Persistent current in state n:
 *   I_n(φ) = −∂E_n/∂φ = (n − φ) / R²
 * where φ = Φ/Φ₀ is the dimensionless flux.
 */
export function persistentCurrent(n: number, phi: number, R: number): number {
  return (n - phi) / (R * R)
}

/** Re(ψ_n(θ)) = cos(nθ) / √(2π) */
export function ringWavefunctionRe(n: number, theta: number): number {
  return Math.cos(n * theta) / Math.sqrt(2 * Math.PI)
}

/** Im(ψ_n(θ)) = sin(nθ) / √(2π) */
export function ringWavefunctionIm(n: number, theta: number): number {
  return Math.sin(n * theta) / Math.sqrt(2 * Math.PI)
}

/**
 * Gaussian wavepacket coefficients centred on n₀ with width σ_φ,
 * truncated at ±nMax.  Returns real amplitudes c_n (normalised: Σc_n² = 1).
 */
export function ringPacketCoeffs(n0: number, sigPhi: number, nMax: number): number[] {
  const raw: number[] = []
  for (let n = -nMax; n <= nMax; n++) {
    raw.push(Math.exp(-((n - n0) ** 2) / (2 * sigPhi * sigPhi)))
  }
  const norm = Math.sqrt(raw.reduce((s, c) => s + c * c, 0))
  return raw.map(c => c / norm)
}

/**
 * |ψ(θ, t)| for a wavepacket with real coefficients c_n (indexed from −nMax to +nMax).
 * Returns the REAL part squared + imaginary part squared = probability amplitude.
 *
 * ψ(θ, t) = Σ_n c_n · e^{i n θ} · e^{−i E_n(φ) t} / √(2π)
 */
export function ringPacket(theta: number, t: number, coeffs: number[], phi: number, R: number): number {
  const nMax = (coeffs.length - 1) / 2
  let re = 0, im = 0
  for (let i = 0; i < coeffs.length; i++) {
    const n = i - nMax
    const En = ringEnergy(n, phi, R)
    const phase = n * theta - En * t
    re += coeffs[i] * Math.cos(phase)
    im += coeffs[i] * Math.sin(phase)
  }
  const norm = Math.sqrt(2 * Math.PI)
  return Math.sqrt(re * re + im * im) / norm
}

/** Density revival time T_rev = 4πR² (exact, valid for all φ) */
export function revivalTime(R: number): number {
  return 4 * Math.PI * R * R
}

/** Crossing values of φ between bands n and n+1: φ_cross = n + 0.5 */
export function crossingPhis(nMin: number, nMax: number): number[] {
  const result: number[] = []
  for (let n = nMin; n < nMax; n++) result.push(n + 0.5)
  return result
}
