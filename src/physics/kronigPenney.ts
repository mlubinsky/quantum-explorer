/**
 * Kronig-Penney model — delta-function version (atomic units: ħ = m = 1).
 *
 * Periodic potential: V(x) = α·a · Σ_n δ(x − n·a)
 * where α > 0 is the delta barrier strength and a is the lattice constant.
 *
 * Bloch's theorem + boundary conditions at each barrier give the exact
 * transcendental dispersion relation:
 *
 *   cos(Ka) = f(ka)   where   f(u) = cos(u) + P · sin(u) / u
 *
 *   u = ka = a · √(2E),   K = Bloch wavevector,   P = α · a (dimensionless)
 *
 * Allowed band:   |f(ka)| ≤ 1   →   Ka = arccos(f) ∈ [0, π]
 * Forbidden gap:  |f(ka)| > 1   →   no real Bloch wavevector
 *
 * At u = 0: f → 1 + P  (L'Hôpital: sin(u)/u → 1)
 * At u = nπ: f = cos(nπ) = (−1)^n  (sin(nπ) = 0, independent of P)
 */

/** Dimensionless barrier strength P = α · a */
export function kpP(alpha: number, a: number): number {
  return alpha * a
}

/**
 * Right-hand side of the dispersion relation: f(ka) = cos(ka) + P · sin(ka) / (ka).
 * Returns 1 + P at E = 0 (L'Hôpital limit, sin(u)/u → 1 as u → 0).
 */
export function kpRHS(E: number, P: number, a: number): number {
  if (E < 0) return NaN          // formula undefined for negative energies
  const ka = a * Math.sqrt(2 * E)
  if (ka < 1e-12) return 1 + P  // L'Hôpital limit at E → 0+
  return Math.cos(ka) + P * Math.sin(ka) / ka
}

/**
 * True iff energy E lies in an allowed band (|f(ka)| ≤ 1).
 * A tolerance of 1e-10 absorbs floating-point overshoot when E is computed
 * from an exact zone-boundary expression (e.g. E = (nπ/a)²/2) and the
 * resulting ka reconstructed via sqrt deviates from nπ by ~1e-14.
 */
export function kpAllowed(E: number, P: number, a: number): boolean {
  return Math.abs(kpRHS(E, P, a)) <= 1 + 1e-10
}

/**
 * Bloch wavevector Ka ∈ [0, π] for an allowed energy.
 * Returns NaN if E is in a forbidden gap (|f| > 1 + 1e-10).
 * Clamps the RHS to [-1, 1] before acos to absorb floating-point overshoot
 * at exact zone-boundary energies.
 */
export function kpBlochKa(E: number, P: number, a: number): number {
  const rhs = kpRHS(E, P, a)
  if (Math.abs(rhs) > 1 + 1e-10) return NaN
  return Math.acos(Math.max(-1, Math.min(1, rhs)))
}

/**
 * Zone-boundary energies E_n = (nπ/a)² / 2  for n = 1, 2, …, nMax.
 *
 * At ka = nπ: sin(nπ) = 0, so f = cos(nπ) = ±1 exactly for any P.
 * These energies mark the boundaries between successive Brillouin zone periods.
 * Band gaps open around these points (width depends on P).
 */
export function kpZoneBoundaries(a: number, nMax: number): number[] {
  return Array.from({ length: nMax }, (_, i) => {
    const n = i + 1
    return (n * Math.PI / a) ** 2 / 2
  })
}
