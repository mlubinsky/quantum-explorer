// Hydrogen-like atom — exact analytical solutions (atomic units: a₀=1, ħ=1, mₑ=1)

/** E_n = -Z²/(2n²) in Hartree */
export function hydrogenEnergy(n: number, Z: number): number {
  return -(Z * Z) / (2 * n * n)
}

/** ⟨r⟩_nl = (1/(2Z)) * (3n² - l(l+1)) */
export function meanRadius(n: number, l: number, Z: number): number {
  return (3 * n * n - l * (l + 1)) / (2 * Z)
}

/** Radial nodes = n - l - 1 */
export function radialNodes(n: number, l: number): number {
  return n - l - 1
}

/**
 * Associated Laguerre polynomial L_n^alpha(x) via three-term recurrence.
 *   L_0^α(x) = 1
 *   L_1^α(x) = 1 + α - x
 *   L_{k+1}^α(x) = ((2k+1+α-x)·L_k - (k+α)·L_{k-1}) / (k+1)
 */
export function assocLaguerre(n: number, alpha: number, x: number): number {
  if (n === 0) return 1
  if (n === 1) return 1 + alpha - x
  let prev = 1
  let curr = 1 + alpha - x
  for (let k = 1; k < n; k++) {
    const next = ((2 * k + 1 + alpha - x) * curr - (k + alpha) * prev) / (k + 1)
    prev = curr
    curr = next
  }
  return curr
}

/**
 * Radial wavefunction R_nl(r) for hydrogen-like atom (Z, a₀=1).
 * Uses the standard normalisation convention (negative leading factor absorbed so
 * the sign of the outermost lobe is determined by L).
 *
 * R_nl(r) = N_nl · exp(-Zr/n) · (2Zr/n)^l · L_{n-l-1}^{2l+1}(2Zr/n)
 *
 * N_nl = sqrt( (2Z/n)^3 · (n-l-1)! / (2n · (n+l)!) )
 * (Mathematical / Abramowitz-Stegun convention for L_n^α.)
 */
export function radialWavefunction(n: number, l: number, r: number, Z: number): number {
  const rho = (2 * Z * r) / n
  // Normalisation constant
  const factNl = factorial(n - l - 1)
  const factNpL = factorial(n + l)
  // N² = (2Z/n)³ · (n-l-1)! / (2n · (n+l)!)
  // Use log-space to avoid overflow for large n
  const logN2 = 3 * Math.log(2 * Z / n) + Math.log(factNl) - Math.log(2 * n) - Math.log(factNpL)
  const N = Math.exp(0.5 * logN2)
  const L = assocLaguerre(n - l - 1, 2 * l + 1, rho)
  return N * Math.exp(-rho / 2) * Math.pow(rho, l) * L
}

/** P(r) = r² |R_nl(r)|² */
export function radialDensity(n: number, l: number, r: number, Z: number): number {
  const R = radialWavefunction(n, l, r, Z)
  return r * r * R * R
}

/**
 * |Y_l^m(θ)|² × 2π (integrated over φ), normalised so that
 * ∫_0^π |Θ_lm(θ)|² sin(θ) dθ = 1.
 *
 * Computed via the real spherical harmonic θ-factor:
 *   |Θ_lm(θ)|² = ((2l+1)/2) · (l-|m|)!/(l+|m|)! · |P_l^|m|(cos θ)|²
 * where P_l^m are associated Legendre polynomials (Condon-Shortley).
 */
export function angularDensity(l: number, m: number, theta: number): number {
  const absm = Math.abs(m)
  const cosT = Math.cos(theta)
  const P = assocLegendre(l, absm, cosT)
  // (2l+1)/2 · (l-|m|)!/(l+|m|)!
  const prefactor = ((2 * l + 1) / 2) * factRatio(l - absm, l + absm)
  return prefactor * P * P
}

/**
 * 2D orbital density in the xz cross-section (y = 0).
 *
 * Delegates to orbitalDensity3D at y=0, which correctly handles:
 * - Origin: R(0)²/(4π) for l=0 s-orbitals (non-zero maximum), zero for l>0.
 * - Real spherical-harmonic φ-factor at φ=0 (x>0) / φ=π (x<0):
 *     m=0 → 1, m>0 → 2cos²(|m|φ)=2, m<0 → 2sin²(|m|φ)=0.
 *   Consequence: m<0 real orbitals (sin-type) have zero density in the xz-plane;
 *   their lobes lie in other planes (e.g. p_y lives in the yz-plane).
 */
export function orbitalDensity2D(n: number, l: number, m: number, x: number, z: number, Z: number): number {
  return orbitalDensity3D(n, l, m, x, 0, z, Z)
}

/** r_max covers >99.9% of radial density */
export function rMax(n: number, Z: number): number {
  return 2 * n * n * (n + 3) / Z
}

/**
 * Polar-plot data for the φ-integrated angular density ∫|Y_lm|²dφ/(2π).
 * Returns closed (x,z) curve normalised to max radius = 1.
 * This is identical for m and −m (depends only on |m|).
 * NOTE: for m<0 real spherical harmonics (sin(|m|φ) factor) the actual
 * density in the xz cross-section (y=0) is zero — lobes live in the yz-plane.
 */
export function angularShape(l: number, m: number, nPoints = 200): { x: number[]; z: number[] } {
  const thetas = Array.from({ length: nPoints + 1 }, (_, i) => (i * Math.PI) / nPoints)
  const rs = thetas.map(t => angularDensity(l, m, t))
  const maxR = Math.max(...rs, 1e-30)
  const norm = rs.map(r => r / maxR)
  const xR = thetas.map((t, i) => norm[i] * Math.sin(t))
  const zR = thetas.map((t, i) => norm[i] * Math.cos(t))
  return {
    x: [...xR, ...[...xR].reverse().map(x => -x)],
    z: [...zR, ...[...zR].reverse()],
  }
}

/**
 * Full 3D volumetric density |ψ_nlm(x,y,z)|² using real spherical harmonics.
 * Real form: Y_l^m_real has φ-factor cos(|m|φ) for m>0, sin(|m|φ) for m<0.
 */
export function orbitalDensity3D(n: number, l: number, m: number, x: number, y: number, z: number, Z: number): number {
  const r = Math.sqrt(x * x + y * y + z * z)
  if (r < 1e-12) {
    if (l > 0) return 0
    const R0 = radialWavefunction(n, 0, 0, Z)
    return R0 * R0 / (4 * Math.PI)
  }
  const theta = Math.atan2(Math.sqrt(x * x + y * y), z)
  const phi = Math.atan2(y, x)
  const R = radialWavefunction(n, l, r, Z)
  const absm = Math.abs(m)
  const P = assocLegendre(l, absm, Math.cos(theta))
  const N2 = ((2 * l + 1) / (4 * Math.PI)) * factRatio(l - absm, l + absm)
  const phiFactor = absm === 0 ? 1 : (m > 0 ? 2 * Math.cos(absm * phi) ** 2 : 2 * Math.sin(absm * phi) ** 2)
  return R * R * N2 * P * P * phiFactor
}

// ─── Normal Zeeman Effect ───────────────────────────────────────────────────

/** Bohr magneton in atomic units: μ_B = 1/2 */
export const MU_B = 0.5

/** Normal Zeeman energy shift: ΔE = μ_B · B · m_l */
export function zeemanShift(ml: number, B: number): number {
  return MU_B * B * ml
}

/** Energy of sublevel |n, l, m_l⟩ in field B: E_n + μ_B · B · m_l */
export function zeemanEnergy(n: number, Z: number, ml: number, B: number): number {
  return hydrogenEnergy(n, Z) + zeemanShift(ml, B)
}

/**
 * All 2l+1 sublevels of level (n, l) in field B.
 * Returns array sorted by m_l from −l to +l.
 */
export function zeemanSublevels(
  n: number, l: number, Z: number, B: number,
): Array<{ ml: number; energy: number; shift: number }> {
  return Array.from({ length: 2 * l + 1 }, (_, i) => {
    const ml = i - l
    const shift = zeemanShift(ml, B)
    return { ml, energy: hydrogenEnergy(n, Z) + shift, shift }
  })
}

/** E1 selection rules: |Δl| = 1 AND |Δm_l| ≤ 1 */
export function zeemanAllowed(deltaL: number, deltaMl: number): boolean {
  return Math.abs(deltaL) === 1 && Math.abs(deltaMl) <= 1
}

/** Polarization from Δm_l = m_l(upper) − m_l(lower) (emission convention) */
export function polarization(deltaMl: number): 'sigma+' | 'pi' | 'sigma-' {
  if (deltaMl ===  1) return 'sigma+'
  if (deltaMl ===  0) return 'pi'
  return 'sigma-'
}

/**
 * The three Lorentz components of the normal Zeeman triplet.
 * Photon energy depends only on Δm_l, not on specific m_l values:
 *   ΔE(Δm_l) = ΔE₀ + μ_B · B · Δm_l
 * where ΔE₀ = E_nHi − E_nLo.
 */
export function zeemanTriplet(
  nHi: number, nLo: number, Z: number, B: number,
): Array<{ pol: 'sigma+' | 'pi' | 'sigma-'; deltaMl: number; dE: number }> {
  const dE0 = hydrogenEnergy(nHi, Z) - hydrogenEnergy(nLo, Z)
  return [
    { pol: 'sigma+', deltaMl:  1, dE: dE0 + MU_B * B },
    { pol: 'pi',     deltaMl:  0, dE: dE0 },
    { pol: 'sigma-', deltaMl: -1, dE: dE0 - MU_B * B },
  ]
}

// ─── Anomalous Zeeman Effect ─────────────────────────────────────────────────

/** Landé g-factor: g_J = 1 + [J(J+1)+S(S+1)−L(L+1)] / (2J(J+1)). Returns 0 for J=0. */
export function landeG(J: number, L: number, S: number): number {
  if (J === 0) return 0
  return 1 + (J * (J + 1) + S * (S + 1) - L * (L + 1)) / (2 * J * (J + 1))
}

/** J values for electron (S=½) in state L: |L−½| and L+½. */
export function jTerms(L: number): number[] {
  if (L === 0) return [0.5]
  return [L - 0.5, L + 0.5]
}

/** m_J values for J: −J, −J+1, …, +J (2J+1 values). */
export function mJValues(J: number): number[] {
  const count = Math.round(2 * J) + 1
  return Array.from({ length: count }, (_, i) => -J + i)
}

/**
 * Anomalous Zeeman energy for |n, L, S=½, J, m_J⟩.
 * Ignores fine-structure splitting (all J terms degenerate at B=0).
 * E = E_n + g_J · μ_B · B · m_J
 */
export function anomalousZeemanEnergy(
  n: number, Z: number, L: number, J: number, mJ: number, B: number,
): number {
  return hydrogenEnergy(n, Z) + landeG(J, L, 0.5) * MU_B * B * mJ
}

/**
 * All (J, m_J) sublevels for level (n, L) with S=½ at field B.
 * Total count = 2·(2L+1). Sorted by J then m_J.
 */
export function anomalousSublevels(
  n: number, L: number, Z: number, B: number,
): Array<{ J: number; mJ: number; g: number; energy: number }> {
  const result: Array<{ J: number; mJ: number; g: number; energy: number }> = []
  for (const J of jTerms(L)) {
    const g = landeG(J, L, 0.5)
    for (const mJ of mJValues(J)) {
      result.push({ J, mJ, g, energy: hydrogenEnergy(n, Z) + g * MU_B * B * mJ })
    }
  }
  return result.sort((a, b) => a.J - b.J || a.mJ - b.mJ)
}

/**
 * E1 selection rules for anomalous Zeeman:
 *   |ΔL|=1, |ΔJ|≤1 (J=0↔J=0 forbidden), |Δm_J|≤1
 * dL = lHi − lLo, dMJ = m_Jhi − m_Jlo (emission convention).
 */
export function anomalousAllowed(
  dL: number, Jhi: number, Jlo: number, dMJ: number,
): boolean {
  if (Math.abs(dL) !== 1) return false
  if (Math.abs(Jhi - Jlo) > 1) return false
  if (Jhi === 0 && Jlo === 0) return false
  if (Math.abs(dMJ) > 1) return false
  return true
}

/**
 * All allowed E1 emission lines for (nHi, lHi) → (nLo, lLo) at field B.
 * dMJ = m_Jhi − m_Jlo. Sorted by ascending photon energy dE.
 */
export function anomalousZeemanLines(
  nHi: number, lHi: number, nLo: number, lLo: number, Z: number, B: number,
): Array<{ Jhi: number; mJhi: number; Jlo: number; mJlo: number; dMJ: number; dE: number }> {
  const subHi = anomalousSublevels(nHi, lHi, Z, B)
  const subLo = anomalousSublevels(nLo, lLo, Z, B)
  const dL = lHi - lLo
  const lines: Array<{ Jhi: number; mJhi: number; Jlo: number; mJlo: number; dMJ: number; dE: number }> = []
  for (const hi of subHi) {
    for (const lo of subLo) {
      const dMJ = hi.mJ - lo.mJ
      if (anomalousAllowed(dL, hi.J, lo.J, dMJ)) {
        lines.push({ Jhi: hi.J, mJhi: hi.mJ, Jlo: lo.J, mJlo: lo.mJ, dMJ, dE: hi.energy - lo.energy })
      }
    }
  }
  return lines.sort((a, b) => a.dE - b.dE)
}

// ─── Linear Stark Effect ────────────────────────────────────────────────────

/**
 * First-order linear Stark energy shift for a hydrogen-like atom (a.u.).
 * Uses parabolic quantum numbers n₁, n₂ with n₁+n₂+|m|+1 = n.
 *   ΔE = −(3/2) n (n₁−n₂) F / Z
 * Physical meaning: n₁>n₂ → charge displaced downward → lower energy in +z field.
 */
export function starkLinearShift(n: number, n1: number, n2: number, F: number, Z: number): number {
  return -(3 / 2) * n * (n1 - n2) * F / Z
}

export interface StarkLevel {
  n1: number; n2: number; m: number
  shift: number; energy: number
  label: string
}

/**
 * All 4 first-order linear Stark levels for the n=2 hydrogen shell.
 * Parabolic quantum numbers: n₁+n₂+|m|=1 (so n₁+n₂+|m|+1=2=n).
 * Returned sorted ascending by energy.
 */
export function starkN2Sublevels(F: number, Z: number): StarkLevel[] {
  const E2 = hydrogenEnergy(2, Z)
  const configs: [number, number, number, string][] = [
    [1, 0, 0, '(|2s⟩+|2p₀⟩)/√2'],
    [0, 1, 0, '(|2s⟩−|2p₀⟩)/√2'],
    [0, 0,  1, '|2p₊₁⟩'],
    [0, 0, -1, '|2p₋₁⟩'],
  ]
  return configs
    .map(([n1, n2, m, label]) => {
      const shift = starkLinearShift(2, n1, n2, F, Z)
      return { n1, n2, m, shift, energy: E2 + shift, label }
    })
    .sort((a, b) => a.energy - b.energy)
}

/** Classical barrier-suppression ionization field: F_ion = Z³/(16n⁴) (a.u.) */
export function starkIonizationField(n: number, Z: number): number {
  return Math.pow(Z, 3) / (16 * Math.pow(n, 4))
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function factorial(n: number): number {
  if (n <= 1) return 1
  let f = 1
  for (let i = 2; i <= n; i++) f *= i
  return f
}

/** (a)! / (b)! where b ≥ a ≥ 0 */
function factRatio(a: number, b: number): number {
  if (a === b) return 1
  let r = 1
  for (let i = a + 1; i <= b; i++) r *= i
  return 1 / r
}

/**
 * Associated Legendre polynomial P_l^m(x) for x ∈ [−1,1], m ≥ 0.
 * Uses the standard recurrence (Condon-Shortley phase included).
 */
function assocLegendre(l: number, m: number, x: number): number {
  // Compute P_m^m first
  let pmm = 1.0
  if (m > 0) {
    const somx2 = Math.sqrt((1 - x) * (1 + x))
    let fact = 1.0
    for (let i = 1; i <= m; i++) {
      pmm *= -fact * somx2
      fact += 2
    }
  }
  if (l === m) return pmm

  let pmmp1 = x * (2 * m + 1) * pmm
  if (l === m + 1) return pmmp1

  let pll = 0
  for (let ll = m + 2; ll <= l; ll++) {
    pll = (x * (2 * ll - 1) * pmmp1 - (ll + m - 1) * pmm) / (ll - m)
    pmm = pmmp1
    pmmp1 = pll
  }
  return pll
}
