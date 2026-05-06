const PI = Math.PI

/** Transmission coefficient T(E, V0, L) — exact for all E > 0 */
export function transmissionT(E: number, V0: number, L: number): number {
  if (E <= 0) return 0
  if (V0 === 0) return 1

  // Inside wave vector squared: κ² = 2(E − V0)
  const kappaSq = 2 * (E - V0)

  if (Math.abs(E - V0) < 1e-12) {
    // E ≈ V0: limiting form T = 1/(1 + V0²L²/(8E))
    return 1 / (1 + (V0 * V0 * L * L) / (8 * E))
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

/** WKB tunnelling approximation exp(−2κ̃L), defined only for E < V0 */
export function wkbT(E: number, V0: number, L: number): number {
  if (E >= V0) return 1
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
    // E ≈ V0: linear solutions — approximate with evanescent
    return transmissionT(E, V0, L)
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
    // Evanescent: ψ_B = A·e^{κ̃x} + B·e^{−κ̃x} (real coefficients for real boundary matching)
    const kappaTilde = Math.sqrt(-kappaSq)
    const { ARe, BRe } = insideCoeffsEvanescent(E, V0, L)
    const val = ARe * Math.exp(kappaTilde * x) + BRe * Math.exp(-kappaTilde * x)
    return val * val
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
    const T = transmissionT(E, V0, L)
    const sqrtT = Math.sqrt(T)
    return { rRe: -Math.sqrt(1 - T), rIm: 0, tRe: sqrtT, tIm: 0 }
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
    // r from: r = t · e^{ikL} · i·(k²-κ²)/(2kκ) · sin(κL) ... use T + R = 1 for |r|
    const rFactor = (k * k - kappa * kappa) / (2 * k * kappa) * sinKL
    // r = i·rFactor·t·e^{2ikL/2}  ... use r = (1/T − 1) for magnitude, phase from formula
    const rSq = Math.max(0, 1 - (tRe * tRe + tIm * tIm))
    const rMag = Math.sqrt(rSq)
    // Phase of r: arg(r) = π/2 + arg(t) + 2k·(-half) + angle from sin term
    // Simpler: for display purposes use r·e^{2ik(-half)} = -i·rFactor·t
    // Actual r amplitude for |ψ|² on the left:
    // Left of barrier referenced to x=-half:
    // r_eff = i·rFactor / (denRe + i·denIm)  × e^{−2ik·half} phase
    const rfRe = -rFactor * denIm / denSq
    const rfIm =  rFactor * denRe / denSq
    // Include e^{−ikL} phase (from x-origin at 0 vs half):
    const phMRe =  Math.cos(-k * L)
    const phMIm =  Math.sin(-k * L)
    const rRe = rfRe * phMRe - rfIm * phMIm
    const rIm = rfRe * phMIm + rfIm * phMRe
    // Normalise r to correct magnitude
    const rCalcSq = rRe * rRe + rIm * rIm
    const scale = rCalcSq > 1e-14 ? rMag / Math.sqrt(rCalcSq) : 1
    return { rRe: rRe * scale, rIm: rIm * scale, tRe, tIm }
  } else {
    // Evanescent inside
    const kappaTilde = Math.sqrt(-kappaSq)
    const coshKL = Math.cosh(kappaTilde * L)
    const sinhKL = Math.sinh(kappaTilde * L)
    const factor = (k * k - kappaTilde * kappaTilde) / (2 * k * kappaTilde)
    const denRe = coshKL
    const denIm = -factor * sinhKL
    const denSq = denRe * denRe + denIm * denIm
    const phRe = Math.cos(k * L)
    const phIm = -Math.sin(k * L)
    const tRe = (phRe * denRe + phIm * denIm) / denSq
    const tIm = (phIm * denRe - phRe * denIm) / denSq
    const rSq = Math.max(0, 1 - (tRe * tRe + tIm * tIm))
    const rMag = Math.sqrt(rSq)
    const rfFactor = (k * k + kappaTilde * kappaTilde) / (2 * k * kappaTilde)
    const rfRe = -rfFactor * sinhKL * denIm / denSq
    const rfIm =  rfFactor * sinhKL * denRe / denSq
    const phMRe =  Math.cos(-k * L)
    const phMIm =  Math.sin(-k * L)
    const rRe = rfRe * phMRe - rfIm * phMIm
    const rIm = rfRe * phMIm + rfIm * phMRe
    const rCalcSq = rRe * rRe + rIm * rIm
    const scale = rCalcSq > 1e-14 ? rMag / Math.sqrt(rCalcSq) : 1
    return { rRe: rRe * scale, rIm: rIm * scale, tRe, tIm }
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
  ARe: number; BRe: number
}

/** Inside coefficients for evanescent case (E < V0) — real coefficients */
function insideCoeffsEvanescent(E: number, V0: number, L: number): EvanescentCoeffs {
  const k = Math.sqrt(2 * E)
  const kappa = Math.sqrt(2 * (V0 - E))
  const half = L / 2
  const T = transmissionT(E, V0, L)
  const sqrtT = Math.sqrt(T)

  // From right boundary: ψ_B(L/2) = t·e^{ikL/2}, ψ_B'(L/2) = ik·t·e^{ikL/2}
  // ψ_B = A·e^{κx} + B·e^{−κx}
  // A·e^{κh} + B·e^{−κh} = sqrtT · cos(k·half)   (real part of t·e^{ikh})
  // κ(A·e^{κh} − B·e^{−κh}) = −k · sqrtT · sin(k·half)   (imaginary part × k)
  // Solve:
  const rhs1 = sqrtT * Math.cos(k * half)
  const rhs2 = -sqrtT * (k / kappa) * Math.sin(k * half)

  const eKh = Math.exp(kappa * half)
  const eMKh = Math.exp(-kappa * half)

  // A·eKh + B·eMKh = rhs1
  // A·eKh − B·eMKh = rhs2
  const ARe = (rhs1 + rhs2) / (2 * eKh)
  const BRe = (rhs1 - rhs2) / (2 * eMKh)

  return { ARe, BRe }
}
