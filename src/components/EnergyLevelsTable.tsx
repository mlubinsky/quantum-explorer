import { buildEnergyLevels } from '../utils/energyLevels'

interface Props {
  potential: 'isw' | 'ho'
  selectedN: number
  L: number
  omega: number
  nLevels: number
}

const tdBase: React.CSSProperties = {
  padding: '3px 10px',
  fontSize: '0.78rem',
  fontVariantNumeric: 'tabular-nums',
  fontFamily: 'monospace',
  borderBottom: '1px solid #1e1e1e',
}

export function EnergyLevelsTable({ potential, selectedN, L, omega, nLevels }: Props) {
  const rows = buildEnergyLevels(potential, L, omega, nLevels)

  return (
    <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.78rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #333' }}>
            <th style={{ ...tdBase, color: '#888', textAlign: 'center' }}>n</th>
            <th style={{ ...tdBase, color: '#888', textAlign: 'right' }}>Eₙ (a.u.)</th>
            <th style={{ ...tdBase, color: '#888', textAlign: 'right' }}>ΔEₙ</th>
            <th style={{ ...tdBase, color: '#888', textAlign: 'right' }}>Eₙ / E₁</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const sel = row.n === selectedN
            const rowColor = sel ? 'rgba(67,97,238,0.18)' : 'transparent'
            const numColor = sel ? '#8899ff' : '#ccc'
            return (
              <tr key={row.n} style={{ background: rowColor }}>
                <td style={{ ...tdBase, color: sel ? '#8899ff' : '#aaa', textAlign: 'center', fontWeight: sel ? 700 : 400 }}>
                  {row.n}
                </td>
                <td style={{ ...tdBase, color: numColor, textAlign: 'right' }}>
                  {row.energy.toFixed(5)}
                </td>
                <td style={{ ...tdBase, color: '#888', textAlign: 'right' }}>
                  {row.delta !== undefined ? row.delta.toFixed(5) : '—'}
                </td>
                <td style={{ ...tdBase, color: '#888', textAlign: 'right' }}>
                  {row.ratio.toFixed(3)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
