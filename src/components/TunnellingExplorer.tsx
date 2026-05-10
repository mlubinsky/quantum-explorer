import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import { TunnellingInfoPanel } from './TunnellingInfoPanel'
import type { TunnellingInfoTopic } from './TunnellingInfoPanel'
import {
  transmissionT, reflectionR, wkbT, resonanceEnergies, scatteringPsiSq,
} from '../physics/tunnelling'

const PI = Math.PI
const N_ENERGY = 400
const N_SPACE  = 500
const E_MIN = 0.02
const E_MAX = 15

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  blue: '#4361ee', red: '#ef233c', orange: '#f77f00', green: '#06d6a0',
  grey: '#555',
}

function darkLayout(extra: Record<string, unknown> = {}) {
  return {
    paper_bgcolor: DARK.paper, plot_bgcolor: DARK.plot,
    font: { color: DARK.text, size: 12 },
    margin: { l: 55, r: 20, t: 30, b: 50 },
    height: 280,
    showlegend: true,
    legend: { x: 0.62, y: 0.98, bgcolor: 'rgba(0,0,0,0.5)', font: { size: 11 } },
    ...extra,
  }
}

function axis(title: string, extra: Record<string, unknown> = {}) {
  return {
    title: { text: title, font: { color: '#aaa', size: 11 } },
    color: '#aaa', gridcolor: DARK.grid, zerolinecolor: DARK.grid, ...extra,
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

export function TunnellingExplorer() {
  const [V0, setV0] = useState(5.0)
  const [L,  setL]  = useState(2.0)
  const [E,  setE]  = useState(1.0)

  // Collapsible sections
  const [showPsi,      setShowPsi]      = useState(true)
  const [showPotential, setShowPotential] = useState(true)

  // Help modals
  const [helpTopic, setHelpTopic] = useState<TunnellingInfoTopic | null>(null)

  // ── Derived values ────────────────────────────────────────────────────────
  const T = transmissionT(E, V0, L)
  const R = reflectionR(E, V0, L)

  // T vs E curve
  const { eVals, tVals, rVals, wkbVals } = useMemo(() => {
    const eVals  = Array.from({ length: N_ENERGY }, (_, i) =>
      E_MIN + (E_MAX - E_MIN) * i / (N_ENERGY - 1))
    const tVals  = eVals.map(e => transmissionT(e, V0, L))
    const rVals  = eVals.map(e => reflectionR(e, V0, L))
    // WKB only below barrier
    const wkbVals = eVals.map(e => (e < V0 ? wkbT(e, V0, L) : null))
    return { eVals, tVals, rVals, wkbVals }
  }, [V0, L])

  // Resonance energies for annotation (up to n=5)
  const resEnergies = useMemo(() => {
    return resonanceEnergies(V0, L, 5).filter(er => er <= E_MAX)
  }, [V0, L])

  // Wavefunction |ψ|² spatial grid
  const { xVals, psiSqVals } = useMemo(() => {
    const k = Math.sqrt(2 * Math.max(E, 1e-6))
    const half = L / 2
    const xL = -half - 6 / k
    const xR =  half + 6 / k
    const xVals = Array.from({ length: N_SPACE }, (_, i) => xL + (xR - xL) * i / (N_SPACE - 1))
    const psiSqVals = xVals.map(x => scatteringPsiSq(x, E, V0, L))
    return { xVals, psiSqVals }
  }, [E, V0, L])

  // ── T vs E plot ───────────────────────────────────────────────────────────
  const tvsETraces = useMemo(() => {
    const traces: unknown[] = [
      {
        x: eVals, y: tVals,
        type: 'scatter', mode: 'lines', name: 'T (transmission)',
        line: { color: DARK.blue, width: 2.5 },
      },
      {
        x: eVals, y: rVals,
        type: 'scatter', mode: 'lines', name: 'R (reflection)',
        line: { color: DARK.red, width: 2 },
      },
      {
        x: eVals, y: wkbVals,
        type: 'scatter', mode: 'lines', name: 'T_WKB',
        line: { color: DARK.orange, width: 1.5, dash: 'dash' },
        connectgaps: false,
      },
      // Current E line
      {
        x: [E, E], y: [-0.05, 1.05],
        type: 'scatter', mode: 'lines', showlegend: false,
        line: { color: DARK.grey, width: 1, dash: 'dot' },
      },
      // Current point
      {
        x: [E], y: [T],
        type: 'scatter', mode: 'markers', showlegend: false,
        marker: { color: DARK.green, size: 9 },
      },
    ]
    return traces
  }, [eVals, tVals, rVals, wkbVals, E, T])

  const resonanceShapes = useMemo(() =>
    resEnergies.map(er => ({
      type: 'line',
      x0: er, x1: er, y0: 0, y1: 1,
      line: { color: 'rgba(255,255,255,0.12)', width: 1, dash: 'dot' },
    })),
    [resEnergies]
  )

  const resonanceAnnotations = useMemo(() =>
    resEnergies.map((er, i) => ({
      x: er, y: 1.06, text: `n=${i + 1}`,
      showarrow: false, font: { size: 9, color: '#666' },
      xanchor: 'center',
    })),
    [resEnergies]
  )

  const tvsELayout = {
    ...darkLayout({
      xaxis: { ...axis('E (a.u.)'), range: [0, E_MAX] },
      yaxis: { ...axis(''), range: [-0.05, 1.1], title: { text: 'T, R', font: { color: '#aaa', size: 11 } } },
    }),
    shapes: [
      // T = 1 reference line
      { type: 'line', x0: 0, x1: E_MAX, y0: 1, y1: 1,
        line: { color: 'rgba(255,255,255,0.08)', width: 1 } },
      // V0 barrier top
      { type: 'line', x0: V0, x1: V0, y0: 0, y1: 1.1,
        line: { color: DARK.orange, width: 1, dash: 'dash' } },
      ...resonanceShapes,
    ],
    annotations: [
      { x: V0, y: 1.08, text: 'V₀', showarrow: false,
        font: { size: 10, color: DARK.orange }, xanchor: 'center' },
      ...resonanceAnnotations,
    ],
  }

  // ── Wavefunction plot ─────────────────────────────────────────────────────
  const half = L / 2
  const psiTraces = useMemo(() => [
    {
      x: xVals, y: psiSqVals,
      type: 'scatter', mode: 'lines', name: '|ψ(x)|²',
      line: { color: DARK.blue, width: 2 },
    },
    // T reference line (right of barrier)
    {
      x: [half + 0.5, xVals[xVals.length - 1]],
      y: [T, T],
      type: 'scatter', mode: 'lines', showlegend: false,
      line: { color: DARK.green, width: 1, dash: 'dot' },
    },
  ], [xVals, psiSqVals, half, T])

  const psiLayout = {
    ...darkLayout({ legend: { x: 0.01, y: 0.98, bgcolor: 'rgba(0,0,0,0.5)', font: { size: 11 } } }),
    xaxis: { ...axis('x (a.u.)') },
    yaxis: { ...axis('|ψ(x)|²'), rangemode: 'tozero' },
    shapes: [
      // Barrier shading
      { type: 'rect',
        x0: -half, x1: half, y0: 0, y1: 1,
        fillcolor: V0 >= 0 ? 'rgba(100,100,100,0.15)' : 'rgba(6,214,160,0.08)',
        line: { width: 0 }, layer: 'below' },
      // Barrier edges
      { type: 'line', x0: -half, x1: -half, y0: 0, y1: 1,
        line: { color: '#444', width: 1, dash: 'dash' } },
      { type: 'line', x0:  half, x1:  half, y0: 0, y1: 1,
        line: { color: '#444', width: 1, dash: 'dash' } },
    ],
    annotations: [
      { x: -half - 0.3, y: 0.05, text: 'incident+reflected',
        showarrow: false, font: { size: 9, color: '#888' }, xanchor: 'right' },
      { x:  half + 0.3, y: T + 0.04, text: `transmitted T=${T.toFixed(3)}`,
        showarrow: false, font: { size: 9, color: DARK.green }, xanchor: 'left' },
    ],
  }

  // ── Potential diagram ─────────────────────────────────────────────────────
  const xPot = [-half - 2, -half, -half, half, half, half + 2]
  const yPot = [0, 0, V0, V0, 0, 0]

  const potTraces = [
    {
      x: xPot, y: yPot,
      type: 'scatter', mode: 'lines', name: 'V(x)',
      line: { color: DARK.orange, width: 2.5 },
      fill: 'tozeroy',
      fillcolor: V0 >= 0 ? 'rgba(247,127,0,0.12)' : 'rgba(6,214,160,0.12)',
    },
    // Energy line
    {
      x: [-half - 2, half + 2], y: [E, E],
      type: 'scatter', mode: 'lines', name: `E = ${E.toFixed(2)} a.u.`,
      line: { color: DARK.blue, width: 1.5, dash: 'dash' },
    },
    // Zero line
    {
      x: [-half - 2, half + 2], y: [0, 0],
      type: 'scatter', mode: 'lines', showlegend: false,
      line: { color: '#333', width: 1 },
    },
  ]

  const yPotMax = Math.max(V0, E) * 1.3 + 0.5
  const yPotMin = Math.min(V0, 0) * 1.3 - 0.5

  const potLayout = {
    ...darkLayout({ height: 220 }),
    xaxis: { ...axis('x (a.u.)') },
    yaxis: { ...axis('V(x), E (a.u.)'), range: [yPotMin, yPotMax] },
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {helpTopic && (
        <HelpModal title={helpTitle(helpTopic)} onClose={() => setHelpTopic(null)}>
          <TunnellingInfoPanel topic={helpTopic} />
        </HelpModal>
      )}

      <div style={{ maxWidth: 780 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Rectangular Barrier Tunnelling</h3>
          <HelpButton onClick={() => setHelpTopic('tvsE')} />
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 1.5rem' }}>
          <ParameterSlider
            label="V₀ (barrier height)"
            value={V0} min={-5} max={10} step={0.1} unit="a.u."
            description="Negative = potential well"
            onChange={setV0}
          />
          <ParameterSlider
            label="L (barrier width)"
            value={L} min={0.5} max={10} step={0.1} unit="a.u."
            onChange={setL}
          />
          <ParameterSlider
            label="E (particle energy)"
            value={E} min={0.05} max={E_MAX} step={0.05} unit="a.u."
            description="Current operating point"
            onChange={setE}
          />
        </div>

        {/* Readout */}
        <div style={readoutStyle}>
          <span>E = <strong>{E.toFixed(3)}</strong> a.u.</span>
          <span style={{ color: DARK.blue }}>T = <strong>{T.toFixed(5)}</strong></span>
          <span style={{ color: DARK.red  }}>R = <strong>{R.toFixed(5)}</strong></span>
          <span style={{ color: T + R > 1.0001 || T + R < 0.9999 ? DARK.red : '#06d6a0' }}>
            T+R = <strong>{(T + R).toFixed(6)}</strong>
          </span>
          {E < V0 && (
            <span style={{ color: DARK.orange }}>
              T<sub>WKB</sub> = <strong>{wkbT(E, V0, L).toFixed(5)}</strong>
            </span>
          )}
          <span style={{ color: E < V0 ? DARK.orange : DARK.green, fontSize: '0.82em' }}>
            {E < V0 ? '← tunnelling' : E < V0 + PI * PI / (2 * L * L) ? '↑ above barrier' : '↑ above barrier (resonance zone)'}
          </span>
        </div>

        {/* ── Section 1: T/R vs E ── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <span style={sectionTitleStyle}>Transmission T(E) and Reflection R(E)</span>
            <HelpButton onClick={() => setHelpTopic('tvsE')} />
          </div>
          <Plot
            data={tvsETraces as never}
            layout={tvsELayout as never}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        {/* ── Section 2: Wavefunction ── */}
        <div style={sectionStyle}>
          <button
            onClick={() => setShowPsi(s => !s)}
            style={collapseHeaderStyle}
          >
            <span style={{ marginRight: 6 }}>{showPsi ? '▾' : '▸'}</span>
            <span style={sectionTitleStyle}>Scattering wavefunction |ψ(x)|²</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('wavefunction')} />
            </span>
          </button>
          {showPsi && (
            <Plot
              data={psiTraces as never}
              layout={psiLayout as never}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
            />
          )}
        </div>

        {/* ── Section 3: Potential diagram ── */}
        <div style={{ ...sectionStyle, borderBottom: 'none' }}>
          <button
            onClick={() => setShowPotential(s => !s)}
            style={collapseHeaderStyle}
          >
            <span style={{ marginRight: 6 }}>{showPotential ? '▾' : '▸'}</span>
            <span style={sectionTitleStyle}>Barrier potential V(x)</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('potential')} />
            </span>
          </button>
          {showPotential && (
            <Plot
              data={potTraces as never}
              layout={potLayout as never}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
            />
          )}
        </div>

      </div>
    </>
  )
}

function helpTitle(topic: TunnellingInfoTopic): string {
  if (topic === 'tvsE')        return 'Tunnelling — T(E) and R(E)'
  if (topic === 'wavefunction') return 'Tunnelling — Scattering Wavefunction'
  return 'Tunnelling — Potential Diagram'
}

const readoutStyle: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: '1rem',
  fontSize: '0.85rem', fontVariantNumeric: 'tabular-nums',
  fontFamily: 'monospace', color: '#e0e0e0',
  background: '#111', padding: '0.5rem 0.75rem',
  borderRadius: 5, marginBottom: '1rem',
}

const sectionStyle: React.CSSProperties = {
  marginBottom: '1.25rem', paddingBottom: '1.25rem',
  borderBottom: '1px solid #1e1e1e',
}

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '0.5rem',
  marginBottom: '0.5rem',
}

const sectionTitleStyle: React.CSSProperties = {
  fontWeight: 600, fontSize: '0.9rem', flex: 1,
}

const collapseHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 0,
  width: '100%', background: 'none', border: 'none',
  cursor: 'pointer', color: '#e0e0e0', padding: '0.25rem 0',
  marginBottom: '0.5rem', textAlign: 'left',
}
