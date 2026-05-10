import { useMemo } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { iswEnergy, iswEigenstate } from '../physics/isw'
import { hoEnergy, hoEigenstate, hoTurningPoint, hoPotential } from '../physics/harmonic'
import { countNodes } from '../utils/countNodes'

const N_LEVELS = 8
const N_POINTS = 400

interface Props {
  potential: 'isw' | 'ho'
  n: number         // selected quantum number (1-indexed for ISW, 0-indexed for HO)
  L: number         // ISW well width
  omega: number     // HO frequency
  showPsi2: boolean
}

export function WavefunctionPlot({ potential, n, L, omega, showPsi2 }: Props) {
  const { traces, layout } = useMemo(
    () => potential === 'isw' ? buildISW(n, L, showPsi2) : buildHO(n, omega, showPsi2),
    [potential, n, L, omega, showPsi2]
  )

  return (
    <Plot
      data={traces as any}
      layout={layout as any}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: '100%' }}
    />
  )
}

// ── helpers ────────────────────────────────────────────────────────────────

function peakAbs(arr: number[]): number {
  return arr.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1
}

const DARK = {
  paper: '#0d0d0d',
  plot: '#111111',
  text: '#e0e0e0',
  grid: '#1e1e1e',
  accent: '#4361ee',
  dim: 'rgba(150,160,220,0.35)',
  lvlSelected: 'rgba(100,130,255,0.65)',
  lvlDim: 'rgba(150,150,200,0.2)',
}

function baseLayout(xTitle: string, xRange: [number, number], yRange: [number, number], annotations: object[]) {
  return {
    paper_bgcolor: DARK.paper,
    plot_bgcolor: DARK.plot,
    font: { color: DARK.text },
    xaxis: {
      title: { text: xTitle, font: { color: '#aaa' } },
      color: '#aaa', gridcolor: DARK.grid, zeroline: false,
      range: xRange,
    },
    yaxis: {
      title: { text: 'Energy (a.u.)', font: { color: '#aaa' } },
      color: '#aaa', gridcolor: DARK.grid, zeroline: false,
      range: yRange,
    },
    annotations,
    margin: { l: 65, r: 55, t: 20, b: 50 },
    height: 520,
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#8899ff', size: 11 } },
  }
}

// ── ISW ───────────────────────────────────────────────────────────────────

function buildISW(n: number, L: number, showPsi2: boolean) {
  const energies = Array.from({ length: N_LEVELS }, (_, i) => iswEnergy(i + 1, L))
  const spacing = energies[1] - energies[0]
  const amp = 0.40 * spacing

  const pad = 0.22 * L
  const xMin = -pad, xMax = L + pad
  const yMin = -0.45 * spacing
  const yMax = energies[N_LEVELS - 1] + 0.9 * spacing

  const traces: object[] = []

  // Walls
  for (const [wx0, wx1] of [[xMin, 0], [L, xMax]] as [number, number][]) {
    traces.push({
      x: [wx0, wx1, wx1, wx0, wx0],
      y: [yMin, yMin, yMax, yMax, yMin],
      fill: 'toself', fillcolor: 'rgba(80,80,110,0.55)',
      line: { color: '#bbb', width: 1.5 },
      mode: 'lines', hoverinfo: 'skip', showlegend: false,
    })
  }

  for (let i = 0; i < N_LEVELS; i++) {
    const ni = i + 1
    const E = energies[i]
    const sel = ni === n

    // Energy level line
    traces.push({
      x: [0, L], y: [E, E],
      mode: 'lines',
      line: { color: sel ? DARK.lvlSelected : DARK.lvlDim, width: sel ? 1.5 : 1, dash: 'dot' },
      hoverinfo: 'skip', showlegend: false,
    })

    // Wavefunction / probability density
    const data = iswEigenstate(ni, L, N_POINTS)
    const raw = showPsi2 ? data.psi2 : data.psi
    const scale = amp / peakAbs(raw)
    const nodes = sel ? countNodes(raw) : 0
    traces.push({
      x: data.x,
      y: raw.map(v => E + scale * v),
      mode: 'lines',
      name: sel ? `ψ${ni} (${nodes} node${nodes !== 1 ? 's' : ''})` : undefined,
      line: { color: sel ? DARK.accent : DARK.dim, width: sel ? 2.5 : 1 },
      hoverinfo: 'skip', showlegend: sel,
    })
  }

  const annotations = Array.from({ length: N_LEVELS }, (_, i) => ({
    x: L, y: energies[i],
    xanchor: 'left', yanchor: 'middle', xshift: 7,
    text: `n=${i + 1}`,
    showarrow: false,
    font: { color: i + 1 === n ? '#8899ff' : '#555', size: 10 },
  }))

  return {
    traces,
    layout: baseLayout('x (a.u.)', [xMin, xMax], [yMin, yMax], annotations),
  }
}

// ── HO ────────────────────────────────────────────────────────────────────

function buildHO(n: number, omega: number, showPsi2: boolean) {
  const energies = Array.from({ length: N_LEVELS }, (_, i) => hoEnergy(i, omega))
  const amp = 0.40 * omega   // level spacing = ω

  const xMax = hoTurningPoint(N_LEVELS - 1, omega) * 1.55 + 1.5
  const yMin = -0.35 * omega
  const yMax = energies[N_LEVELS - 1] + 0.8 * omega

  const traces: object[] = []

  // V(x) parabola
  const xV = Array.from({ length: 300 }, (_, i) => -xMax + (2 * xMax * i) / 299)
  traces.push({
    x: xV,
    y: xV.map(xi => Math.min(hoPotential(xi, omega), yMax * 1.05)),
    mode: 'lines',
    line: { color: 'rgba(100,160,230,0.55)', width: 2 },
    fill: 'tozeroy', fillcolor: 'rgba(40,60,110,0.12)',
    hoverinfo: 'skip', showlegend: false,
  })

  for (let i = 0; i < N_LEVELS; i++) {
    const E = energies[i]
    const sel = i === n
    const xTurn = hoTurningPoint(i, omega)

    // Energy level line (between classical turning points)
    traces.push({
      x: [-xTurn, xTurn], y: [E, E],
      mode: 'lines',
      line: { color: sel ? DARK.lvlSelected : DARK.lvlDim, width: sel ? 1.5 : 1, dash: 'dot' },
      hoverinfo: 'skip', showlegend: false,
    })

    // Wavefunction
    const data = hoEigenstate(i, omega, N_POINTS)
    const raw = showPsi2 ? data.psi2 : data.psi
    const scale = amp / peakAbs(raw)
    const nodes = sel ? countNodes(raw) : 0
    traces.push({
      x: data.x,
      y: raw.map(v => E + scale * v),
      mode: 'lines',
      name: sel ? `ψ${i} (${nodes} node${nodes !== 1 ? 's' : ''})` : undefined,
      line: { color: sel ? DARK.accent : DARK.dim, width: sel ? 2.5 : 1 },
      hoverinfo: 'skip', showlegend: sel,
    })
  }

  // Classical turning point markers for selected state
  const xT = hoTurningPoint(n, omega)
  for (const xt of [-xT, xT]) {
    traces.push({
      x: [xt, xt], y: [yMin, hoEnergy(n, omega)],
      mode: 'lines',
      line: { color: 'rgba(255,210,60,0.45)', width: 1, dash: 'dash' },
      hoverinfo: 'skip', showlegend: false,
    })
  }

  const annotations = Array.from({ length: N_LEVELS }, (_, i) => ({
    x: hoTurningPoint(i, omega), y: energies[i],
    xanchor: 'left', yanchor: 'middle', xshift: 7,
    text: `n=${i}`,
    showarrow: false,
    font: { color: i === n ? '#8899ff' : '#555', size: 10 },
  }))

  return {
    traces,
    layout: baseLayout('x (a.u.)', [-xMax, xMax], [yMin, yMax], annotations),
  }
}
