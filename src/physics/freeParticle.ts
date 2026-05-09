/** Free particle Gaussian wavepacket — atomic units ħ = m = 1. */

/** Spreading time t₀ = 2σ₀² */
export function fpSpreadingTime(sigma0: number): number {
  return 2 * sigma0 * sigma0;
}

/** σ(t) = σ₀√(1+(t/t₀)²) */
export function fpSigma(t: number, sigma0: number): number {
  const t0 = fpSpreadingTime(sigma0);
  return sigma0 * Math.sqrt(1 + Math.pow(t / t0, 2));
}

/** |ψ(x,t)|² — exact Gaussian */
export function fpProb(
  x: number,
  t: number,
  x0: number,
  k0: number,
  sigma0: number
): number {
  const sigma = fpSigma(t, sigma0);
  const center = fpExpectX(t, x0, k0);
  const dx = x - center;
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-(dx * dx) / (2 * sigma * sigma));
}

/** ⟨x(t)⟩ = x₀ + k₀t */
export function fpExpectX(t: number, x0: number, k0: number): number {
  return x0 + k0 * t;
}

/** ⟨p⟩ = k₀ (constant) */
export function fpExpectP(k0: number): number {
  return k0;
}

/** Δx(t) = σ(t) */
export function fpDeltaX(t: number, sigma0: number): number {
  return fpSigma(t, sigma0);
}

/** Δp = 1/(2σ₀) (constant) */
export function fpDeltaP(sigma0: number): number {
  return 1 / (2 * sigma0);
}

/** |φ(k)|² — time-independent Gaussian in momentum space */
export function fpMomentumDist(k: number, k0: number, sigma0: number): number {
  const sigmaP = fpDeltaP(sigma0);
  const dk = k - k0;
  return (1 / (sigmaP * Math.sqrt(2 * Math.PI))) * Math.exp(-(dk * dk) / (2 * sigmaP * sigmaP));
}

/**
 * Exact Re(ψ(x,t)) for the free-particle Gaussian wavepacket.
 * Phase includes the quadratic chirp ξ²t/(8σ₀²σ(t)²) and Gouy phase −arctan(t/t₀)/2.
 */
export function fpRePsi(x: number, t: number, x0: number, k0: number, sigma0: number): number {
  const sigma = fpSigma(t, sigma0);
  const xi    = x - x0 - k0 * t;
  const t0    = 2 * sigma0 * sigma0;
  const envelope = Math.pow(2 * Math.PI * sigma * sigma, -0.25) * Math.exp(-xi * xi / (4 * sigma * sigma));
  const chirp = (xi * xi * t) / (8 * sigma0 * sigma0 * sigma * sigma);
  const gouy  = -Math.atan(t / t0) / 2;
  const phase = k0 * (x - x0) - k0 * k0 * t / 2 + chirp + gouy;
  return envelope * Math.cos(phase);
}

/**
 * Exact Im(ψ(x,t)) for the free-particle Gaussian wavepacket.
 */
export function fpImPsi(x: number, t: number, x0: number, k0: number, sigma0: number): number {
  const sigma = fpSigma(t, sigma0);
  const xi    = x - x0 - k0 * t;
  const t0    = 2 * sigma0 * sigma0;
  const envelope = Math.pow(2 * Math.PI * sigma * sigma, -0.25) * Math.exp(-xi * xi / (4 * sigma * sigma));
  const chirp = (xi * xi * t) / (8 * sigma0 * sigma0 * sigma * sigma);
  const gouy  = -Math.atan(t / t0) / 2;
  const phase = k0 * (x - x0) - k0 * k0 * t / 2 + chirp + gouy;
  return envelope * Math.sin(phase);
}
