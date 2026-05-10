import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { iswMomentumGrid, hoMomentumGrid } from '../physics/momentumSpace'
import { hoWavefunction, hoTurningPoint } from '../physics/harmonic'
import { iswSigmaX } from '../physics/isw'
import { HelpButton, HelpModal } from './HelpModal'
import { MomentumInfoPanel } from './MomentumInfoPanel'

interface Props {
  potential: 'isw' | 'ho'
  n: number
  L: number
  omega: number
}

const N_POINTS = 500

const DARK = {
  paper: '#0d0d0d',
  plot:  '#111111',
  text:  '#e0e0e0',
  grid:  '#1e1e1e',
  accent: '#4361ee',
  overlay: 'rgba(255,160,60,0.55)',
}

export function MomentumPlot({ potential, n, L, omega }: Props) {
  const [showHelp, setShowHelp] = useState(false)

  const { traces, layout, sigmaP, sigmaX, heisenberg } = useMemo(
    () => potential === 'isw'
      ? buildISW(n, L)
      : buildHO(n, omega),
    [potential, n, L, omega],
  )

  return (
    <>
      {showHelp && (
        <HelpModal title="Momentum Distribution — Physics Reference" onClose={() => setShowHelp(false)}>
          <MomentumInfoPanel />
        </HelpModal>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
        <span style={{ fontSize: '0.82rem', color: '#aaa', fontWeight: 600 }}>
          Momentum distribution |φₙ(k)|²
        </span>
        <HelpButton onClick={() => setShowHelp(true)} />
      </div>

      <Plot
        data={traces as any}
        layout={layout as any}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%' }}
      />

      {/* Uncertainty readout */}
      <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem', color: '#aaa', marginTop: '4px', flexWrap: 'wrap' }}>
        <span>σ_p = <span style={{ color: DARK.accent }}>{sigmaP.toFixed(4)}</span> a.u.</span>
        <span>σ_x = <span style={{ color: DARK.accent }}>{sigmaX.toFixed(4)}</span> a.u.</span>
        <span style={{ color: heisenberg < 0.5 - 1e-6 ? '#e05050' : '#5ec45e' }}>
          σ_x · σ_p = {heisenberg.toFixed(4)} {heisenberg >= 0.5 - 1e-6 ? '≥ ½ ✓' : '< ½ (!!)'}
        </span>
      </div>
    </>
  )
}

// ── helpers ────────────────────────────────────────────────────────────────

function sigmaFromGrid(k: number[], phi2: number[]): number {
  const dk = k[1] - k[0]
  let p2 = 0
  let norm = 0
  for (let i = 0; i < k.length; i++) {
    p2   += k[i] * k[i] * phi2[i] * dk
    norm += phi2[i] * dk
  }
  return Math.sqrt(Math.abs(p2 / norm))
}

function baseLayout(xLabel: string, title: string, annotations: object[]) {
  return {
    paper_bgcolor: DARK.paper,
    plot_bgcolor:  DARK.plot,
    font: { color: DARK.text, size: 11 },
    xaxis: {
      title: { text: xLabel, font: { color: '#aaa' } },
      color: '#aaa', gridcolor: DARK.grid, zeroline: false,
    },
    yaxis: {
      title: { text: '|φₙ(k)|²', font: { color: '#aaa' } },
      color: '#aaa', gridcolor: DARK.grid, zeroline: false, rangemode: 'tozero',
    },
    title: { text: title, font: { color: '#777', size: 11 } },
    annotations,
    legend: { x: 0.99, y: 0.98, xanchor: 'right', bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 10 } },
    margin: { l: 60, r: 20, t: 28, b: 50 },
    height: 280,
  }
}

// ── ISW ───────────────────────────────────────────────────────────────────

function buildISW(n: number, L: number) {
  const { k, phi2 } = iswMomentumGrid(n, L, N_POINTS)

  const traces: object[] = [
    {
      x: k, y: phi2,
      name: `|φ${n}(k)|²`,
      mode: 'lines',
      line: { color: DARK.accent, width: 2 },
      fill: 'tozeroy', fillcolor: 'rgba(67,97,238,0.12)',
    },
  ]

  // Dashed vertical lines at the Bragg wavenumbers ±nπ/L
  const kBragg = n * Math.PI / L
  for (const kv of [-kBragg, kBragg]) {
    traces.push({
      x: [kv, kv], y: [0, Math.max(...phi2) * 1.05],
      mode: 'lines',
      line: { color: 'rgba(255,200,60,0.45)', width: 1, dash: 'dash' },
      hoverinfo: 'skip', showlegend: false,
    })
  }

  const sigmaP = sigmaFromGrid(k, phi2)
  const sigmaX = iswSigmaX(n, L)

  const annotations = [
    {
      x: kBragg, y: Math.max(...phi2) * 0.95,
      xanchor: 'left', yanchor: 'top', xshift: 4,
      text: `k=nπ/L`, showarrow: false,
      font: { color: 'rgba(255,200,60,0.7)', size: 9 },
    },
  ]

  return {
    traces,
    layout: baseLayout(
      'k (a.u.⁻¹)',
      `ISW n=${n} — momentum distribution`,
      annotations,
    ),
    sigmaP,
    sigmaX,
    heisenberg: sigmaX * sigmaP,
  }
}

// ── HO ────────────────────────────────────────────────────────────────────

function buildHO(n: number, omega: number) {
  const { k, phi2 } = hoMomentumGrid(n, omega, N_POINTS)

  const traces: object[] = [
    {
      x: k, y: phi2,
      name: `|φ${n}(k)|²  (ω=${omega.toFixed(2)})`,
      mode: 'lines',
      line: { color: DARK.accent, width: 2 },
      fill: 'tozeroy', fillcolor: 'rgba(67,97,238,0.12)',
    },
  ]

  // Overlay |ψₙ(k)|² with ω=1 to illustrate self-duality (or its absence)
  if (Math.abs(omega - 1) > 0.05) {
    // Show the position distribution at ω=1 for comparison
    const kTurn = hoTurningPoint(n, 1) * 1.8 + 1.5
    const kComp = Array.from({ length: N_POINTS }, (_, i) => -kTurn + (2 * kTurn * i) / (N_POINTS - 1))
    const psi2Comp = kComp.map(ki => hoWavefunction(n, ki, 1) ** 2)
    traces.push({
      x: kComp, y: psi2Comp,
      name: `|ψ${n}(k)|²  (ω=1, reference)`,
      mode: 'lines',
      line: { color: DARK.overlay, width: 1.5, dash: 'dot' },
    })
  }

  const sigmaP = sigmaFromGrid(k, phi2)
  // σ_x = √((n+½)/ω)
  const sigmaX = Math.sqrt((n + 0.5) / omega)

  const selfDualNote = Math.abs(omega - 1) < 0.05
    ? [{ x: 0, y: Math.max(...phi2) * 0.92,
        xanchor: 'center', yanchor: 'top',
        text: 'ω ≈ 1: self-dual — same shape as |ψ|²',
        showarrow: false,
        font: { color: 'rgba(150,220,150,0.75)', size: 9 } }]
    : []

  return {
    traces,
    layout: baseLayout(
      'k (a.u.⁻¹)',
      `HO n=${n}  ω=${omega.toFixed(2)} — momentum distribution`,
      selfDualNote,
    ),
    sigmaP,
    sigmaX,
    heisenberg: sigmaX * sigmaP,
  }
}
