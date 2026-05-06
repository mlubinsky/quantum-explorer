import { iswEnergy } from '../physics/isw'
import { hoEnergy } from '../physics/harmonic'

export interface EnergyLevelRow {
  n: number          // quantum number (1-indexed for ISW, 0-indexed for HO)
  energy: number
  delta: number | undefined  // Eₙ − Eₙ₋₁; undefined for first level
  ratio: number      // Eₙ / E_first
}

export function buildEnergyLevels(
  potential: 'isw' | 'ho',
  L: number,
  omega: number,
  nLevels: number,
): EnergyLevelRow[] {
  const energies = potential === 'isw'
    ? Array.from({ length: nLevels }, (_, i) => iswEnergy(i + 1, L))
    : Array.from({ length: nLevels }, (_, i) => hoEnergy(i, omega))

  return energies.map((E, i) => ({
    n: potential === 'isw' ? i + 1 : i,
    energy: E,
    delta: i === 0 ? undefined : E - energies[i - 1],
    ratio: E / energies[0],
  }))
}
