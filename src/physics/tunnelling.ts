const PI = Math.PI

/** Transmission coefficient T(E, V0, L) — exact for all E > 0 */
export function transmissionT(E: number, V0: number, L: number): number {
  if (E <= 0) return 0
  if (V0 === 0) return 1

  // Inside wave vector squared: κ² = 2(E − V0)
  const kappaSq = 2 * (E - V0)

  if (Math.abs(E - V0) < 1e-12) {
    // E ≈ V0: limiting form T = 1/(1 + V0²L²/(2E))
    return 1 / (1 + (V0 * V0 * L * L) / (2 * E))
  }

  if (kappaSq > 0) {
    // E > V0: oscillatory inside — sin²(κL) formula
    const kappa = Math.sqrt(kappaSq)
    const s = Math.sin(kappa * L)
    const denom = 1 + (V0 * V0 * s * s) / (4 * E * (E - V0))
    return 1 / denom
  } else {
    // E < V0: evanescent inside — sinh²(κ̃L) formula
    const kappaTilde = Math.sqrt(-kappaSq)
    const sh = Math.sinh(kappaTilde * L)
    const denom = 1 + (V0 * V0 * sh * sh) / (4 * E * (V0 - E))
    return 1 / denom
  }
}

/** Reflection coefficient R = 1 − T */
export function reflectionR(E: number, V0: number, L: number): number {
  return 1 - transmissionT(E, V0, L)
}

/**
 * WKB tunnelling approximation exp(−2κ̃L), defined only for E < V0.
 * Returns NaN for E ≥ V0: WKB has no evanescent region to tunnel through
 * above the barrier and must not be evaluated there.
 */
export function wkbT(E: number, V0: number, L: number): number {
  if (E >= V0) return NaN
  const kappaTilde = Math.sqrt(2 * (V0 - E))
  return Math.exp(-2 * kappaTilde * L)
}

/**
 * Resonance energies where T = 1 exactly (above-barrier case: E > V0).
 * E_n = V0 + n²π²/(2L²)  for n = 1, 2, …
 * Returns energies ≤ Emax.
 */
export function resonanceEnergies(V0: number, L: number, nMax: number): number[] {
  const result: number[] = []
  for (let n = 1; n <= nMax; n++) {
    result.push(V0 + (n * n * PI * PI) / (2 * L * L))
  }
  return result
}

/**
 * Exact stationary scattering wavefunction |ψ(x)|².
 *
 * Barrier occupies −L/2 ≤ x ≤ L/2.
 * Incident wave from the left with amplitude 1.
 *
 * We solve the transfer-matrix problem to get r and t, then
 * evaluate the piecewise wavefunction.
 */
export function scatteringPsiSq(x: number, E: number, V0: number, L: number): number {
  if (E <= 0) return 0

  const k = Math.sqrt(2 * E)
  const half = L / 2

  // Compute reflection amplitude r (complex) via transfer matrix.
  // We work with real and imaginary parts of r.
  const { rRe, rIm, tRe, tIm } = scatteringAmplitudes(E, V0, L)

  if (x > half) {
    // Transmitted region: ψ = t·e^{ikx}, |ψ|² = |t|²  = T (independent of x)
    return tRe * tRe + tIm * tIm
  }

  if (x < -half) {
    // Incident + reflected: ψ = e^{ikx} + r·e^{−ikx}
    // |ψ|² = 1 + |r|² + 2Re(r·e^{−2ikx})
    //       = 1 + |r|² + 2(rRe·cos(2kx) + rIm·sin(2kx))
    const rSq = rRe * rRe + rIm * rIm
    return 1 + rSq + 2 * (rRe * Math.cos(2 * k * x) + rIm * Math.sin(2 * k * x))
  }

  // Inside barrier
  const kappaSq = 2 * (E - V0)

  if (Math.abs(kappaSq) < 1e-12) {
    // E ≈ V0: inside solution is linear ψ_B = A + Bx (not evanescent).
    // Match at x = +L/2 (h = L/2): ψ_B(h) = t·e^{ikh}, ψ_B'(h) = ik·t·e^{ikh}
    //   → B = ik·t·e^{ikh},  A = t·e^{ikh} − B·h
    const eikh_Re = Math.cos(k * half)
    const eikh_Im = Math.sin(k * half)
    const teRe = tRe * eikh_Re - tIm * eikh_Im
    const teIm = tRe * eikh_Im + tIm * eikh_Re
    const BRe = -k * teIm
    const BIm =  k * teRe
    const ARe = teRe - BRe * half
    const AIm = teIm - BIm * half
    const re = ARe + BRe * x
    const im = AIm + BIm * x
    return re * re + im * im
  }

  if (kappaSq > 0) {
    // Oscillatory: ψ_B = A·e^{iκx} + B·e^{−iκx}
    const kappa = Math.sqrt(kappaSq)
    const { ARe, AIm, BRe, BIm } = insideCoeffs(E, V0, L)
    const reA = ARe * Math.cos(kappa * x) - AIm * Math.sin(kappa * x)
    const imA = ARe * Math.sin(kappa * x) + AIm * Math.cos(kappa * x)
    const reB = BRe * Math.cos(-kappa * x) - BIm * Math.sin(-kappa * x)
    const imB = BRe * Math.sin(-kappa * x) + BIm * Math.cos(-kappa * x)
    const re = reA + reB
    const im = imA + imB
    return re * re + im * im
  } else {
    // Evanescent: ψ_B = A·e^{κ̃x} + B·e^{−κ̃x} with complex A, B
    const kappaTilde = Math.sqrt(-kappaSq)
    const { ARe, AIm, BRe, BIm } = insideCoeffsEvanescent(E, V0, L)
    const ePos = Math.exp( kappaTilde * x)
    const eNeg = Math.exp(-kappaTilde * x)
    const re = ARe * ePos + BRe * eNeg
    const im = AIm * ePos + BIm * eNeg
    return re * re + im * im
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

interface Amplitudes {
  rRe: number; rIm: number
  tRe: number; tIm: number
}

/**
 * Compute reflection and transmission amplitudes r, t via transfer matrix.
 * Barrier is from −L/2 to L/2.
 */
function scatteringAmplitudes(E: number, V0: number, L: number): Amplitudes {
  if (V0 === 0) return { rRe: 0, rIm: 0, tRe: 1, tIm: 0 }

  const k = Math.sqrt(2 * E)
  const kappaSq = 2 * (E - V0)

  if (Math.abs(kappaSq) < 1e-12) {
    // E = V0: inside solution is linear ψ=A+Bx. Exact transfer matrix gives:
    //   t = 2e^{-ikL} / (2 − ikL),   r = −ikL·e^{-ikL} / (2 − ikL)
    const kL = k * L
    const dSq = 4 + kL * kL
    const cosKL = Math.cos(kL)
    const sinKL = Math.sin(kL)
    const tRe = (4 * cosKL + 2 * kL * sinKL) / dSq
    const tIm = (2 * kL * cosKL - 4 * sinKL) / dSq
    const rRe = (kL * kL * cosKL - 2 * kL * sinKL) / dSq
    const rIm = -(kL * kL * sinKL + 2 * kL * cosKL) / dSq
    return { rRe, rIm, tRe, tIm }
  }

  if (kappaSq > 0) {
    // Oscillatory inside
    const kappa = Math.sqrt(kappaSq)
    // t = e^{-ikL} / [cos(κL) − i(k²+κ²)/(2kκ)·sin(κL)]
    const cosKL = Math.cos(kappa * L)
    const sinKL = Math.sin(kappa * L)
    const factor = (k * k + kappa * kappa) / (2 * k * kappa)
    // denominator: cos(κL) − i·factor·sin(κL), multiplied by e^{ikL} for the reference point
    // Full t with phase reference at x=+L/2:
    // t·e^{ikL/2} = e^{-ikL/2} / [cos(κL) − i·factor·sin(κL)]
    // But we want |t|² = T and the phase matters for inside wavefunction.
    // Using standard result:
    const denRe = cosKL
    const denIm = -factor * sinKL
    const denSq = denRe * denRe + denIm * denIm
    // t = e^{-ikL} / (denRe + i·denIm)
    const phRe = Math.cos(k * L)
    const phIm = -Math.sin(k * L)
    // t = (phRe + i·phIm) / (denRe + i·denIm)
    const tRe = (phRe * denRe + phIm * denIm) / denSq
    const tIm = (phIm * denRe - phRe * denIm) / denSq
    // r = −i·rFactor·t (from transfer-matrix BC with barrier centred at x=0)
    // satisfies |r|²+|t|²=1 exactly without any rescaling
    const rFactor = (k * k - kappa * kappa) / (2 * k * kappa) * sinKL
    return { rRe: rFactor * tIm, rIm: -rFactor * tRe, tRe, tIm }
  } else {
    // Evanescent inside
    const kappaTilde = Math.sqrt(-kappaSq)
    const kTL = kappaTilde * L
    // Guard against float64 overflow (sinh/cosh → Infinity for kTL ≳ 710).
    // In the deep-tunnelling limit (kTL → ∞): T → 0 and |r| → 1.
    // Exact limiting phase of r derived by cancelling the e^{kTL} factor:
    //   r = (f·cos(kL) − sin(kL) − i(cos(kL) + f·sin(kL))) / A
    // where A = (k²+κ̃²)/(2kκ̃),  f = (k²−κ̃²)/(2kκ̃);  verifies |r| = 1.
    if (kTL > 700) {
      const A = (k * k + kappaTilde * kappaTilde) / (2 * k * kappaTilde)
      const f = (k * k - kappaTilde * kappaTilde) / (2 * k * kappaTilde)
      const cosKL = Math.cos(k * L)
      const sinKL = Math.sin(k * L)
      return {
        rRe: (f * cosKL - sinKL) / A,
        rIm: -(cosKL + f * sinKL) / A,
        tRe: 0, tIm: 0,
      }
    }
    const coshKL = Math.cosh(kTL)
    const sinhKL = Math.sinh(kTL)
    const factor = (k * k - kappaTilde * kappaTilde) / (2 * k * kappaTilde)
    const denRe = coshKL
    const denIm = -factor * sinhKL
    const denSq = denRe * denRe + denIm * denIm
    const phRe = Math.cos(k * L)
    const phIm = -Math.sin(k * L)
    const tRe = (phRe * denRe + phIm * denIm) / denSq
    const tIm = (phIm * denRe - phRe * denIm) / denSq
    // r = −i·rfFactor·t (analytic continuation κ→iκ̃ of oscillatory formula)
    const rfFactor = (k * k + kappaTilde * kappaTilde) / (2 * k * kappaTilde) * sinhKL
    return { rRe: rfFactor * tIm, rIm: -rfFactor * tRe, tRe, tIm }
  }
}

interface InsideCoeffs {
  ARe: number; AIm: number; BRe: number; BIm: number
}

/** Inside coefficients for oscillatory case (E > V0) */
function insideCoeffs(E: number, V0: number, L: number): InsideCoeffs {
  const k = Math.sqrt(2 * E)
  const kappa = Math.sqrt(2 * (E - V0))
  const half = L / 2

  // Match at x = −L/2:
  //   e^{−ikL/2} + r·e^{ikL/2} = A·e^{−iκL/2} + B·e^{iκL/2}
  //   ik(e^{−ikL/2} − r·e^{ikL/2}) = iκ(A·e^{−iκL/2} − B·e^{iκL/2})
  // Match at x = +L/2:
  //   A·e^{iκL/2} + B·e^{−iκL/2} = t·e^{ikL/2}
  //   iκ(A·e^{iκL/2} − B·e^{−iκL/2}) = ik·t·e^{ikL/2}
  //
  // From right boundary:
  //   A·e^{iκh} + B·e^{−iκh} = t·e^{ikh}          (h = L/2)
  //   A·e^{iκh} − B·e^{−iκh} = (k/κ)·t·e^{ikh}
  // Add / subtract:
  //   2A·e^{iκh} = (1 + k/κ)·t·e^{ikh}
  //   2B·e^{−iκh} = (1 − k/κ)·t·e^{ikh}

  const { tRe, tIm } = scatteringAmplitudes(E, V0, L)
  const ratio = k / kappa

  const eikh_Re = Math.cos(k * half)
  const eikh_Im = Math.sin(k * half)
  const eiKh_Re = Math.cos(kappa * half)
  const eiKh_Im = Math.sin(kappa * half)

  // t·e^{ikh}
  const teRe = tRe * eikh_Re - tIm * eikh_Im
  const teIm = tRe * eikh_Im + tIm * eikh_Re

  // 2A·e^{iκh} = (1+ratio)·te
  const twoAeRe = (1 + ratio) * teRe
  const twoAeIm = (1 + ratio) * teIm

  // A = (1/2)·twoAe · e^{−iκh}
  const eMiKh_Re =  eiKh_Re
  const eMiKh_Im = -eiKh_Im
  const ARe = 0.5 * (twoAeRe * eMiKh_Re - twoAeIm * eMiKh_Im)
  const AIm = 0.5 * (twoAeRe * eMiKh_Im + twoAeIm * eMiKh_Re)

  // 2B·e^{−iκh} = (1−ratio)·te
  const twoBeMRe = (1 - ratio) * teRe
  const twoBeMIm = (1 - ratio) * teIm

  // B = (1/2)·twoBe · e^{iκh}
  const BRe = 0.5 * (twoBeMRe * eiKh_Re - twoBeMIm * eiKh_Im)
  const BIm = 0.5 * (twoBeMRe * eiKh_Im + twoBeMIm * eiKh_Re)

  return { ARe, AIm, BRe, BIm }
}

interface EvanescentCoeffs {
  ARe: number; AIm: number; BRe: number; BIm: number
}

/**
 * Inside coefficients for evanescent case (E < V0) — complex coefficients.
 *
 * From right boundary (h = L/2):
 *   2A·e^{κh} = (1 + ik/κ) · t·e^{ikh}
 *   2B·e^{-κh} = (1 - ik/κ) · t·e^{ikh}
 *
 * Using the full complex t ensures |ψ_inside(±L/2)|² is exactly continuous
 * with the left and right regions.
 */
function insideCoeffsEvanescent(E: number, V0: number, L: number): EvanescentCoeffs {
  const k = Math.sqrt(2 * E)
  const kappa = Math.sqrt(2 * (V0 - E))
  const half = L / 2
  const { tRe, tIm } = scatteringAmplitudes(E, V0, L)

  // t · e^{ikh}
  const eikh_Re = Math.cos(k * half)
  const eikh_Im = Math.sin(k * half)
  const teRe = tRe * eikh_Re - tIm * eikh_Im
  const teIm = tRe * eikh_Im + tIm * eikh_Re

  // (1 + ik/κ) · te / 2
  const ratio = k / kappa
  const halfFAteRe = 0.5 * (teRe - ratio * teIm)
  const halfFAteIm = 0.5 * (teIm + ratio * teRe)

  // (1 - ik/κ) · te / 2
  const halfFBteRe = 0.5 * (teRe + ratio * teIm)
  const halfFBteIm = 0.5 * (teIm - ratio * teRe)

  const eKh  = Math.exp( kappa * half)
  const eMKh = Math.exp(-kappa * half)

  return {
    ARe: halfFAteRe * eMKh,
    AIm: halfFAteIm * eMKh,
    BRe: halfFBteRe * eKh,
    BIm: halfFBteIm * eKh,
  }
}

/**
 * WKB approximation for the position-space probability density |ψ_WKB(x)|².
 *
 * The "crude WKB" ignores reflections at the barrier edges entirely:
 * - Left region (x < −L/2):  |ψ|² = 1  (incident wave, no reflection)
 * - Inside (−L/2 ≤ x ≤ L/2):
 *     E < V0: exp(−2κ̃(x + L/2))  — exponential decay from left edge
 *     E > V0: k/κ′               — from probability-flux conservation
 *     E = V0: 1
 * - Right region (x > L/2):
 *     E < V0: T_WKB = exp(−2κ̃L)
 *     E > V0: 1  (WKB predicts perfect transmission above barrier)
 *     E = V0: 1
 */
export function wkbPsiSq(x: number, E: number, V0: number, L: number): number {
  const half = L / 2

  if (x < -half) return 1

  const kappaSq = 2 * (E - V0)

  if (x > half) {
    if (kappaSq < 0) return Math.exp(2 * Math.sqrt(-kappaSq) * (-L))  // T_WKB
    return 1
  }

  // Inside barrier
  if (Math.abs(kappaSq) < 1e-12) return 1

  if (kappaSq < 0) {
    const kappaTilde = Math.sqrt(-kappaSq)
    return Math.exp(-2 * kappaTilde * (x + half))
  }

  // E > V0: flux conservation
  const k      = Math.sqrt(2 * E)
  const kPrime = Math.sqrt(kappaSq)
  return k / kPrime
}

/** Exported for unit tests only — not part of the public API. */
export const _testScatteringAmplitudes = scatteringAmplitudes
