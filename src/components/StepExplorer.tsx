import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import { ScatteringInfoPanel } from './ScatteringInfoPanel'
import { stepT, stepR, stepPsiSq, stepPenetrationDepth } from '../physics/step'

const N_ENERGY = 400
const N_SPACE  = 500
const E_MIN = 0.01
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

export function StepExplorer() {
  const [V0, setV0] = useState(3.0)
  const [E,  setE]  = useState(1.0)

  const [showPsi,      setShowPsi]      = useState(true)
  const [showPotential, setShowPotential] = useState(true)

  const [helpTopic, setHelpTopic] = useState<'stepTvsE' | 'stepWavefunction' | 'stepPotential' | null>(null)

  // ── Derived ──────────────────────────────────────────────────────────────
  const T  = stepT(E, V0)
  const R  = stepR(E, V0)
  const delta = E < V0 ? stepPenetrationDepth(E, V0) : null

  // T vs E curve
  const { eVals, tVals, rVals } = useMemo(() => {
    const eVals = Array.from({ length: N_ENERGY }, (_, i) =>
      E_MIN + (E_MAX - E_MIN) * i / (N_ENERGY - 1))
    return {
      eVals,
      tVals: eVals.map(e => stepT(e, V0)),
      rVals: eVals.map(e => stepR(e, V0)),
    }
  }, [V0])

  // Wavefunction grid
  const { xVals, psiSqVals } = useMemo(() => {
    const k1 = Math.sqrt(2 * Math.max(E, 1e-6))
    const xSpan = 8 / k1
    const xRightExtra = delta !== null ? Math.min(delta * 5, 10) : xSpan
    const xVals = Array.from({ length: N_SPACE }, (_, i) =>
      -xSpan + (xSpan + xRightExtra) * i / (N_SPACE - 1))
    return {
      xVals,
      psiSqVals: xVals.map(x => stepPsiSq(x, E, V0)),
    }
  }, [E, V0, delta])

  // ── T vs E plot ───────────────────────────────────────────────────────────
  const tvsETraces = useMemo(() => [
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
    { x: [E, E], y: [-0.05, 1.05], type: 'scatter', mode: 'lines', showlegend: false,
      line: { color: DARK.grey, width: 1, dash: 'dot' } },
    { x: [E], y: [T], type: 'scatter', mode: 'markers', showlegend: false,
      marker: { color: DARK.green, size: 9 } },
  ], [eVals, tVals, rVals, E, T])

  const tvsELayout = {
    ...darkLayout({
      xaxis: { ...axis('E (a.u.)'), range: [0, E_MAX] },
      yaxis: { ...axis('T, R'), range: [-0.05, 1.1] },
    }),
    shapes: [
      { type: 'line', x0: V0, x1: V0, y0: 0, y1: 1.1,
        line: { color: DARK.orange, width: 1.2, dash: 'dash' } },
    ],
    annotations: [
      { x: V0, y: 1.08, text: 'V₀', showarrow: false,
        font: { size: 10, color: DARK.orange }, xanchor: 'center' },
      ...(V0 > 0 ? [{
        x: V0 / 2, y: 0.15, text: 'Total reflection',
        showarrow: false, font: { size: 10, color: '#777' }, xanchor: 'center',
      }] : []),
    ],
  }

  // ── Wavefunction plot ─────────────────────────────────────────────────────
  const psiTraces = useMemo(() => {
    const traces: unknown[] = [
      {
        x: xVals, y: psiSqVals,
        type: 'scatter', mode: 'lines', name: '|ψ(x)|²',
        line: { color: DARK.blue, width: 2 },
      },
    ]
    // Right-region reference line for propagating case
    if (E > V0) {
      const k1 = Math.sqrt(2 * E)
      const k2 = Math.sqrt(2 * (E - V0))
      const psiRight = T * (k1 / k2)
      const xRight = xVals[xVals.length - 1]
      traces.push({
        x: [0.5, xRight], y: [psiRight, psiRight],
        type: 'scatter', mode: 'lines', showlegend: false,
        line: { color: DARK.green, width: 1, dash: 'dot' },
      })
    }
    return traces
  }, [xVals, psiSqVals, E, V0, T])

  const psiLayout = {
    ...darkLayout({ legend: { x: 0.01, y: 0.98, bgcolor: 'rgba(0,0,0,0.5)', font: { size: 11 } } }),
    xaxis: { ...axis('x (a.u.)') },
    yaxis: { ...axis('|ψ(x)|²'), rangemode: 'tozero' },
    shapes: [
      { type: 'rect', x0: 0, x1: xVals[xVals.length - 1], y0: 0, y1: 1,
        fillcolor: V0 >= 0 ? 'rgba(100,100,100,0.10)' : 'rgba(6,214,160,0.07)',
        line: { width: 0 }, layer: 'below' },
      { type: 'line', x0: 0, x1: 0, y0: 0, y1: 1,
        line: { color: '#444', width: 1.5, dash: 'dash' } },
    ],
    annotations: [
      { x: -0.3, y: 0.07, text: 'incident+reflected', showarrow: false,
        font: { size: 9, color: '#888' }, xanchor: 'right' },
      ...(E > V0 ? [{
        x: 0.5, y: T * (Math.sqrt(2 * E) / Math.sqrt(2 * (E - V0))) + 0.05,
        text: `transmitted T=${T.toFixed(3)}`, showarrow: false,
        font: { size: 9, color: DARK.green }, xanchor: 'left',
      }] : delta !== null ? [{
        x: delta, y: 0.05, text: `δ = ${delta.toFixed(2)} a.u.`, showarrow: true,
        ax: 40, ay: -30, font: { size: 9, color: DARK.orange }, xanchor: 'left',
      }] : []),
    ],
  }

  // ── Potential diagram ─────────────────────────────────────────────────────
  const k1 = Math.sqrt(2 * Math.max(E, 1e-6))
  const xSpan = 6 / k1
  const xPot = [-xSpan, 0, 0, xSpan]
  const yPot = [0, 0, V0, V0]

  const potTraces = [
    {
      x: xPot, y: yPot,
      type: 'scatter', mode: 'lines', name: 'V(x)',
      line: { color: DARK.orange, width: 2.5 },
      fill: 'tozeroy',
      fillcolor: V0 >= 0 ? 'rgba(247,127,0,0.12)' : 'rgba(6,214,160,0.12)',
    },
    {
      x: [-xSpan, xSpan], y: [E, E],
      type: 'scatter', mode: 'lines', name: `E = ${E.toFixed(2)} a.u.`,
      line: { color: DARK.blue, width: 1.5, dash: 'dash' },
    },
    { x: [-xSpan, xSpan], y: [0, 0], type: 'scatter', mode: 'lines', showlegend: false,
      line: { color: '#333', width: 1 } },
  ]

  const yMax = Math.max(V0, E) * 1.3 + 0.5
  const yMin = Math.min(V0, 0) * 1.3 - 0.5
  const potLayout = {
    ...darkLayout({ height: 220 }),
    xaxis: { ...axis('x (a.u.)') },
    yaxis: { ...axis('V(x), E (a.u.)'), range: [yMin, yMax] },
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {helpTopic && (
        <HelpModal title={helpTitle(helpTopic)} onClose={() => setHelpTopic(null)}>
          <ScatteringInfoPanel topic={helpTopic} />
        </HelpModal>
      )}

      <div style={{ maxWidth: 780 }}>
        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
          <ParameterSlider
            label="V₀ (step height)"
            value={V0} min={-5} max={10} step={0.1} unit="a.u."
            description="Negative = downward step"
            onChange={setV0}
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
          <span style={{ color: DARK.blue  }}>T = <strong>{T.toFixed(5)}</strong></span>
          <span style={{ color: DARK.red   }}>R = <strong>{R.toFixed(5)}</strong></span>
          <span style={{ color: '#06d6a0' }}>T+R = <strong>{(T + R).toFixed(6)}</strong></span>
          {delta !== null && (
            <span style={{ color: DARK.orange }}>δ = <strong>{delta.toFixed(3)}</strong> a.u.</span>
          )}
          <span style={{ color: E < V0 ? DARK.red : DARK.green, fontSize: '0.82em' }}>
            {E < V0 ? '← total reflection' : '← partial transmission'}
          </span>
        </div>

        {/* Section 1: T vs E */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <span style={titleStyle}>Transmission T(E) and Reflection R(E)</span>
            <HelpButton onClick={() => setHelpTopic('stepTvsE')} />
          </div>
          <Plot
            data={tvsETraces as never}
            layout={tvsELayout as never}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        {/* Section 2: Wavefunction */}
        <div style={sectionStyle}>
          <button onClick={() => setShowPsi(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showPsi ? '▾' : '▸'}</span>
            <span style={titleStyle}>Scattering wavefunction |ψ(x)|²</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('stepWavefunction')} />
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

        {/* Section 3: Potential */}
        <div style={{ ...sectionStyle, borderBottom: 'none' }}>
          <button onClick={() => setShowPotential(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showPotential ? '▾' : '▸'}</span>
            <span style={titleStyle}>Step potential V(x)</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('stepPotential')} />
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

function helpTitle(topic: string): string {
  if (topic === 'stepTvsE')        return 'Step Potential — T(E) and R(E)'
  if (topic === 'stepWavefunction') return 'Step Potential — Scattering Wavefunction'
  return 'Step Potential — Potential Diagram'
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
  display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem',
}

const titleStyle: React.CSSProperties = {
  fontWeight: 600, fontSize: '0.9rem', flex: 1,
}

const collapseStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 0, width: '100%',
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#e0e0e0', padding: '0.25rem 0', marginBottom: '0.5rem', textAlign: 'left',
}
