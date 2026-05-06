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
 * N_nl = -sqrt( (2Z/n)^3 · (n-l-1)! / (2n · ((n+l)!)^3 ) )
 * Note: conventional sign choice — we use the positive square root without the
 * leading minus so that R_10(0) = +2Z^{3/2}.
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
 * 2D orbital density in the xz-plane:
 * ρ(x, z) = |R_nl(r)|² · |Θ_lm(θ)|² / r²   (the 1/r² cancels the r² from the volume element
 * but we keep it as the raw volumetric density so ρ dV makes sense in xz-slice)
 *
 * Actually: |ψ_nlm(r,θ)|² = |R_nl(r)|² · |Y_l^m(θ,φ)|²
 * For the xz cross-section we use φ=0 (or integrate over φ and divide by 2π):
 *   ρ(x, z) = |R_nl(r)|² · (Θ_lm(θ))²
 * where Θ_lm is normalised so that ∫|Θ|² sinθ dθ dφ = 1 overall.
 * We return |R_nl(r)|² · angularDensity(l, m, θ) / (2π) so that integrating over xz gives ~1
 * (with a factor from the φ=0 slice).
 *
 * For plotting we just return |R_nl|² · |Θ_lm(θ)|² (unnormalised in xz, just for visual shape).
 */
export function orbitalDensity2D(n: number, l: number, m: number, x: number, z: number, Z: number): number {
  const r = Math.sqrt(x * x + z * z)
  if (r < 1e-12) return 0
  const theta = Math.atan2(Math.sqrt(x * x), z)  // angle from z-axis
  const R = radialWavefunction(n, l, r, Z)
  const ang = angularDensity(l, m, theta)
  return R * R * ang
}

/** r_max covers >99.9% of radial density */
export function rMax(n: number, Z: number): number {
  return 2 * n * n * (n + 3) / Z
}

/**
 * Polar-plot data for angular shape |Y_l^m(θ)|² in xz-plane.
 * Returns closed (x,z) curve normalised to max radius = 1.
 * Right half (x≥0) traces θ: 0→π, left half mirrors it.
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
