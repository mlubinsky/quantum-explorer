/**
 * Count interior sign-change zeros (nodes) in a wavefunction array.
 * Ignores a margin of points at each end to avoid boundary-induced noise.
 */
export function countNodes(psi: number[], margin = 5): number {
  let count = 0
  for (let i = margin + 1; i < psi.length - margin; i++) {
    if (psi[i - 1] * psi[i] < 0) count++
  }
  return count
}
