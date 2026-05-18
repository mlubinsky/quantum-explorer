export interface MeasurementEvent {
  type:  'position' | 'momentum'
  value: number
  tAt:   number
  prob:  number
}

// ── Sampling ──────────────────────────────────────────────────────────────────

export function sampleGaussian(
  mean: number,
  sigma: number,
  rand: () => number = Math.random,
): number {
  const u1 = Math.max(Number.EPSILON, rand())
  const u2 = rand()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + sigma * z
}

// ── Born-rule probability densities ──────────────────────────────────────────

export function bornProbDensityX(
  xMeas: number,
  meanX: number,
  sigmaX: number,
): number {
  const dx = xMeas - meanX
  return (1 / (sigmaX * Math.sqrt(2 * Math.PI))) * Math.exp(-(dx * dx) / (2 * sigmaX * sigmaX))
}

export function bornProbDensityK(
  kMeas: number,
  k0: number,
  sigmaK: number,
): number {
  const dk = kMeas - k0
  return (1 / (sigmaK * Math.sqrt(2 * Math.PI))) * Math.exp(-(dk * dk) / (2 * sigmaK * sigmaK))
}

// ── Post-collapse states ──────────────────────────────────────────────────────

export function collapsePosition(
  xMeas: number,
  k0: number,
  sigmaDet: number,
): { x0: number; k0: number; sigma0: number } {
  return { x0: xMeas, k0, sigma0: sigmaDet }
}

export function collapseMomentum(
  xAtMeas: number,
  kMeas: number,
  sigmaK: number,
): { x0: number; k0: number; sigma0: number } {
  return { x0: xAtMeas, k0: kMeas, sigma0: 1 / (2 * sigmaK) }
}
