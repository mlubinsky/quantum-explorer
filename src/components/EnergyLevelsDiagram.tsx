import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { iswEnergy } from '../physics/isw'
import { hoEnergy, hoTurningPoint, hoPotential } from '../physics/harmonic'
import { HARTREE_TO_EV } from '../utils/units'
import { HelpButton, HelpModal } from './HelpModal'
import { EnergyLevelsDiagramInfoPanel } from './EnergyLevelsDiagramInfoPanel'

const N_LEVELS = 8

interface Props {
  potential: 'isw' | 'ho'
  n: number
  L: number
  omega: number
}

const DARK = {
  paper: '#0d0d0d',
  plot:  '#111111',
  text:  '#e0e0e0',
  grid:  '#1e1e1e',
  accent: '#4361ee',
  dim:   'rgba(150,160,220,0.35)',
  lvlSelected: '#4361ee',
  lvlDim: 'rgba(130,140,200,0.30)',
}

export function EnergyLevelsDiagram({ potential, n, L, omega }: Props) {
  const [showHelp, setShowHelp] = useState(false)

  const { traces, layout } = useMemo(
    () => potential === 'isw' ? buildISW(n, L) : buildHO(n, omega),
    [potential, n, L, omega],
  )

  return (
    <>
      {showHelp && (
        <HelpModal title="Energy Levels Diagram — Physics Reference" onClose={() => setShowHelp(false)}>
          <EnergyLevelsDiagramInfoPanel />
        </HelpModal>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.82rem', color: '#aaa', fontWeight: 600 }}>
          Energy levels diagram
        </span>
        <HelpButton onClick={() => setShowHelp(true)} />
      </div>

      <Plot
        data={traces as any}
        layout={layout as any}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%' }}
      />
    </>
  )
}

// ── helpers ────────────────────────────────────────────────────────────────

function fmtLevel(E: number, sel: boolean): string {
  const ev = (E * HARTREE_TO_EV).toFixed(2)
  return sel ? `<b>${E.toFixed(4)} a.u. / ${ev} eV</b>` : `${E.toFixed(4)} a.u. / ${ev} eV`
}

function baseLayout(
  xRange: [number, number],
  yRange: [number, number],
  annotations: object[],
) {
  return {
    paper_bgcolor: DARK.paper,
    plot_bgcolor:  DARK.plot,
    font: { color: DARK.text, size: 11 },
    xaxis: {
      title: { text: 'x (a.u.)', font: { color: '#aaa' } },
      color: '#aaa', gridcolor: DARK.grid, zeroline: false, range: xRange,
    },
    yaxis: {
      title: { text: 'Energy (a.u.)', font: { color: '#aaa' } },
      color: '#aaa', gridcolor: DARK.grid, zeroline: false, range: yRange,
    },
    annotations,
    margin: { l: 65, r: 175, t: 16, b: 50 },
    height: 420,
    showlegend: false,
  }
}

// ── ISW ───────────────────────────────────────────────────────────────────

function buildISW(n: number, L: number) {
  const energies = Array.from({ length: N_LEVELS }, (_, i) => iswEnergy(i + 1, L))
  const spacing  = energies[1] - energies[0]

  const pad  = 0.22 * L
  const xMin = -pad, xMax = L + pad
  const yMin = -0.35 * spacing
  const yMax = energies[N_LEVELS - 1] + 0.8 * spacing

  const traces: object[] = []

  // Walls
  for (const [wx0, wx1] of [[xMin, 0], [L, xMax]] as [number, number][]) {
    traces.push({
      x: [wx0, wx1, wx1, wx0, wx0],
      y: [yMin, yMin, yMax, yMax, yMin],
      fill: 'toself', fillcolor: 'rgba(80,80,110,0.45)',
      line: { color: '#666', width: 1.2 },
      mode: 'lines', hoverinfo: 'skip', showlegend: false,
    })
  }

  // Energy lines
  for (let i = 0; i < N_LEVELS; i++) {
    const ni  = i + 1
    const E   = energies[i]
    const sel = ni === n
    traces.push({
      x: [0, L], y: [E, E],
      mode: 'lines',
      line: { color: sel ? DARK.lvlSelected : DARK.lvlDim, width: sel ? 2 : 1 },
      hoverinfo: 'skip', showlegend: false,
    })
  }

  // V(x) wavefunction sample for selected state (shows psi² shape context)
  // Show V = 0 line inside well
  traces.push({
    x: [0, L], y: [0, 0],
    mode: 'lines',
    line: { color: 'rgba(100,100,150,0.25)', width: 1, dash: 'dot' },
    hoverinfo: 'skip', showlegend: false,
  })

  const annotations = Array.from({ length: N_LEVELS }, (_, i) => {
    const ni  = i + 1
    const E   = energies[i]
    const sel = ni === n
    return {
      x: L, y: E,
      xanchor: 'left', yanchor: 'middle', xshift: 8,
      text: `n=${ni}  ${fmtLevel(E, sel)}`,
      showarrow: false,
      font: { color: sel ? '#8899ff' : '#555', size: sel ? 10.5 : 9 },
    }
  })

  return { traces, layout: baseLayout([xMin, xMax], [yMin, yMax], annotations) }
}

// ── HO ────────────────────────────────────────────────────────────────────

function buildHO(n: number, omega: number) {
  const energies = Array.from({ length: N_LEVELS }, (_, i) => hoEnergy(i, omega))

  const xMax = hoTurningPoint(N_LEVELS - 1, omega) * 1.55 + 1.5
  const yMin = -0.25 * omega
  const yMax = energies[N_LEVELS - 1] + 0.7 * omega

  const traces: object[] = []

  // V(x) parabola
  const xV = Array.from({ length: 300 }, (_, i) => -xMax + (2 * xMax * i) / 299)
  traces.push({
    x: xV,
    y: xV.map(xi => Math.min(hoPotential(xi, omega), yMax * 1.02)),
    mode: 'lines',
    line: { color: 'rgba(100,160,230,0.5)', width: 2 },
    fill: 'tozeroy', fillcolor: 'rgba(40,60,110,0.12)',
    hoverinfo: 'skip', showlegend: false,
  })

  // Energy lines between classical turning points
  for (let i = 0; i < N_LEVELS; i++) {
    const E    = energies[i]
    const sel  = i === n
    const xTurn = hoTurningPoint(i, omega)
    traces.push({
      x: [-xTurn, xTurn], y: [E, E],
      mode: 'lines',
      line: { color: sel ? DARK.lvlSelected : DARK.lvlDim, width: sel ? 2 : 1 },
      hoverinfo: 'skip', showlegend: false,
    })
  }

  const annotations = Array.from({ length: N_LEVELS }, (_, i) => {
    const E    = energies[i]
    const sel  = i === n
    const xTurn = hoTurningPoint(i, omega)
    return {
      x: xTurn, y: E,
      xanchor: 'left', yanchor: 'middle', xshift: 8,
      text: `n=${i}  ${fmtLevel(E, sel)}`,
      showarrow: false,
      font: { color: sel ? '#8899ff' : '#555', size: sel ? 10.5 : 9 },
    }
  })

  return { traces, layout: baseLayout([-xMax, xMax], [yMin, yMax], annotations) }
}
