import type { CSSProperties } from 'react'

interface Props {
  data: number[][]
  rowLabels: string[]
  colLabels: string[]
  title: string
  threshold?: number
  sequential?: boolean
  markDiagonal?: boolean
}

function colorDiverging(val: number, maxAbs: number): string {
  if (maxAbs === 0) return '#1a1a1a'
  const v = Math.max(-1, Math.min(1, val / maxAbs))
  if (v >= 0) {
    const c = Math.round(30 + (1 - v) * 175)
    return `rgb(${Math.round(30 + v * 180)},${c},${c})`
  } else {
    const c = Math.round(30 + (1 + v) * 175)
    return `rgb(${c},${c},${Math.round(30 + (-v) * 180)})`
  }
}

function colorSequential(val: number, maxAbs: number): string {
  if (maxAbs === 0) return '#1a1a1a'
  const v = Math.max(0, Math.min(1, val / maxAbs))
  const c = Math.round(30 + (1 - v) * 175)
  return `rgb(${Math.round(30 + v * 180)},${c},${c})`
}

const thStyle: CSSProperties = {
  padding: '3px 8px',
  fontSize: '0.72rem',
  fontWeight: 600,
  textAlign: 'center',
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  color: '#888',
}

export function MatrixHeatmap({
  data, rowLabels, colLabels, title,
  threshold = 1e-10, sequential = false, markDiagonal = false,
}: Props) {
  const maxAbs = Math.max(...data.flatMap(row => row.map(v => Math.abs(v))), 1e-30)
  const cellColor = sequential ? colorSequential : colorDiverging

  return (
    <div>
      <p style={{ margin: '0 0 6px', fontSize: '0.8rem', fontWeight: 600, color: '#ccc' }}>{title}</p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle} />
              {colLabels.map((label, n) => <th key={n} style={thStyle}>{label}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, m) => (
              <tr key={m}>
                <td style={thStyle}>{rowLabels[m]}</td>
                {row.map((val, n) => {
                  const display = Math.abs(val) < threshold ? 0 : val
                  const bg = cellColor(display, maxAbs)
                  const brightness = Math.abs(display) / maxAbs
                  const textColor = brightness > 0.5 ? '#fff' : '#aaa'
                  const cellStyle: CSSProperties = {
                    backgroundColor: bg,
                    color: textColor,
                    textAlign: 'center',
                    padding: '3px 7px',
                    fontSize: '0.72rem',
                    fontFamily: 'monospace',
                    minWidth: '3.8em',
                    border: '1px solid #111',
                    cursor: 'default',
                  }
                  return (
                    <td
                      key={n}
                      style={cellStyle}
                      title={`${rowLabels[m]}, ${colLabels[n]}: ${val.toFixed(6)}`}
                    >
                      {display.toFixed(3)}
                      {markDiagonal && m === n && (
                        <span style={{ display: 'block', fontSize: '0.6rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1 }}>
                          static
                        </span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ margin: '4px 0 0', fontSize: '0.7rem', color: '#555' }}>
        {sequential
          ? `dark = 0 · red = max (${maxAbs.toFixed(4)})`
          : `blue = negative · dark ≈ 0 · red = positive · max |value| = ${maxAbs.toFixed(4)}`}
      </p>
    </div>
  )
}
