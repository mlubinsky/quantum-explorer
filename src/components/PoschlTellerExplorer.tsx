import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import { ScatteringInfoPanel } from './ScatteringInfoPanel'
import type { ScatteringInfoTopic } from './ScatteringInfoPanel'
import { ptV0, ptPotential, ptBoundEnergy, ptBoundPsiSqArray } from '../physics/poschlTeller'

const E_MAX  = 12
const N_PSI  = 600

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  blue: '#4361ee', red: '#ef233c', orange: '#f77f00', green: '#06d6a0',
  grey: '#555', purple: '#9b5de5',
}

// One colour per bound state (up to 5)
const STATE_COLORS = ['#06d6a0', '#4361ee', '#f77f00', '#ef233c', '#9b5de5']

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

export function PoschlTellerExplorer() {
  const [N,     setN]     = useState(3)
  const [alpha, setAlpha] = useState(1.0)

  const [showPsi, setShowPsi] = useState(true)
  const [showPot, setShowPot] = useState(true)

  const [helpTopic, setHelpTopic] = useState<ScatteringInfoTopic | null>(null)

  // ── Derived ──────────────────────────────────────────────────────────────
  const V0 = ptV0(N, alpha)
  const energies = useMemo(
    () => Array.from({ length: N }, (_, j) => ptBoundEnergy(N, j, alpha)),
    [N, alpha],
  )

  // ── T vs E plot ──────────────────────────────────────────────────────────
  const tvsETraces = useMemo(() => [
    // Quantum: T = 1 always
    {
      x: [0, E_MAX], y: [1, 1],
      type: 'scatter', mode: 'lines', name: 'Quantum T = 1 (reflectionless)',
      line: { color: DARK.green, width: 3 },
    },
    // Classical: step at V0
    {
      x: [0, V0 - 0.001, V0, E_MAX], y: [0, 0, 1, 1],
      type: 'scatter', mode: 'lines', name: 'Classical T',
      line: { color: DARK.orange, width: 1.5, dash: 'dash' },
    },
    // R = 0 flat
    {
      x: [0, E_MAX], y: [0, 0],
      type: 'scatter', mode: 'lines', name: 'R = 0',
      line: { color: DARK.red, width: 1.5, dash: 'dot' },
    },
  ], [V0])

  const tvsELayout = {
    ...darkLayout({
      xaxis: { ...axis('E (a.u.)'), range: [0, E_MAX] },
      yaxis: { ...axis('T, R'), range: [-0.05, 1.15] },
      legend: { x: 0.02, y: 0.45, bgcolor: 'rgba(0,0,0,0.5)', font: { size: 11 } },
    }),
    shapes: [
      { type: 'line', x0: V0, x1: V0, y0: 0, y1: 1.1,
        line: { color: DARK.grey, width: 1, dash: 'dot' } },
    ],
    annotations: [
      { x: V0, y: 1.12, text: `V₀ = ${V0.toFixed(2)}`, showarrow: false,
        font: { size: 10, color: '#aaa' }, xanchor: 'center' },
      { x: V0 / 2, y: 0.08, text: 'Classical: T = 0', showarrow: false,
        font: { size: 9, color: DARK.orange }, xanchor: 'center' },
    ],
  }

  // ── Potential + energy levels ─────────────────────────────────────────────
  const xPot = useMemo(() => {
    const xMax = 5 / alpha
    return Array.from({ length: 300 }, (_, i) => -xMax + 2 * xMax * i / 299)
  }, [alpha])

  const vVals = useMemo(() => xPot.map(x => ptPotential(x, N, alpha)), [xPot, N, alpha])

  const potTraces = useMemo(() => {
    const xMax = 5 / alpha
    const traces: unknown[] = [
      {
        x: xPot, y: vVals,
        type: 'scatter', mode: 'lines', name: 'V(x)',
        line: { color: DARK.orange, width: 2.5 },
        fill: 'tozeroy', fillcolor: 'rgba(247,127,0,0.12)',
      },
    ]
    // Bound-state energy levels
    energies.forEach((Ej, j) => {
      // Width of the level line shrinks with depth (classical turning points)
      const xTurn = (1 / alpha) * Math.acosh(Math.sqrt(-V0 / Ej))
      traces.push({
        x: [-xTurn, xTurn], y: [Ej, Ej],
        type: 'scatter', mode: 'lines', showlegend: true,
        name: `E${j} = ${Ej.toFixed(3)}`,
        line: { color: STATE_COLORS[j], width: 1.5, dash: 'dash' },
      })
    })
    // Zero line
    traces.push({
      x: [-xMax, xMax], y: [0, 0],
      type: 'scatter', mode: 'lines', showlegend: false,
      line: { color: '#333', width: 1 },
    })
    return traces
  }, [xPot, vVals, energies, alpha, V0])

  const potLayout = {
    ...darkLayout({ height: 280 }),
    xaxis: { ...axis('x (a.u.)') },
    yaxis: { ...axis('V(x), E (a.u.)'), range: [-V0 * 1.18, V0 * 0.35] },
    legend: { x: 0.65, y: 0.98, bgcolor: 'rgba(0,0,0,0.5)', font: { size: 10 } },
  }

  // ── Bound-state wavefunctions ─────────────────────────────────────────────
  const xPsiArr = useMemo(() => {
    const xMax = 8 / alpha
    return Array.from({ length: N_PSI }, (_, i) => -xMax + 2 * xMax * i / (N_PSI - 1))
  }, [alpha])

  const psiSqData = useMemo(
    () => Array.from({ length: N }, (_, j) =>
      ptBoundPsiSqArray(xPsiArr, N, j, alpha)),
    [xPsiArr, N, alpha],
  )

  const psiTraces = useMemo(() =>
    psiSqData.map((psiSq, j) => ({
      x: xPsiArr, y: psiSq,
      type: 'scatter', mode: 'lines',
      name: `ψ${j}  E=${energies[j].toFixed(2)}`,
      line: { color: STATE_COLORS[j], width: 2 },
    })),
    [xPsiArr, psiSqData, energies],
  )

  const psiMax = useMemo(() =>
    Math.max(...psiSqData.flat()) * 1.15,
    [psiSqData],
  )

  const psiLayout = {
    ...darkLayout({ height: 300 }),
    xaxis: { ...axis('x (a.u.)') },
    yaxis: { ...axis('|ψⱼ(x)|²'), range: [0, psiMax] },
    legend: { x: 0.65, y: 0.98, bgcolor: 'rgba(0,0,0,0.5)', font: { size: 10 } },
  }

  const cfg = { displayModeBar: false, responsive: true }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {helpTopic && (
        <HelpModal title={ptHelpTitle(helpTopic)} onClose={() => setHelpTopic(null)}>
          <ScatteringInfoPanel topic={helpTopic} />
        </HelpModal>
      )}

      <p style={subtitleStyle}>
        V(x) = −V₀/cosh²(x/a) — an exactly solvable well with a{' '}
        <strong style={subtitleEmStyle}>finite number of bound states</strong> and{' '}
        <strong style={subtitleEmStyle}>perfect transmission</strong> (T = 1) for all E &gt; 0.
        The reflectionless property makes it a key model in soliton theory and inverse-scattering methods.
      </p>

      <div style={{ maxWidth: 780 }}>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem' }}>
              N — depth / number of bound states
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setN(n)} style={{
                  padding: '0.25rem 0.55rem', borderRadius: 4, cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 700, border: '1px solid',
                  background: N === n ? STATE_COLORS[n - 1] + '33' : '#1a1a1a',
                  color:      N === n ? STATE_COLORS[n - 1]       : '#888',
                  borderColor: N === n ? STATE_COLORS[n - 1]      : '#333',
                }}>{n}</button>
              ))}
            </div>
          </div>
          <ParameterSlider label="α (reciprocal width)" value={alpha}
            min={0.5} max={3} step={0.1} unit="a.u."
            onChange={setAlpha} />
        </div>

        {/* Readout */}
        <div style={readoutStyle}>
          <span>N = <strong>{N}</strong> bound states</span>
          <span style={{ color: DARK.orange }}>
            V₀ = <strong>{V0.toFixed(3)}</strong> a.u.
          </span>
          <span style={{ color: DARK.green }}>T = <strong>1</strong> (reflectionless)</span>
          {energies.map((Ej, j) => (
            <span key={j} style={{ color: STATE_COLORS[j] }}>
              E{j} = <strong>{Ej.toFixed(3)}</strong>
            </span>
          ))}
        </div>

        {/* Section 1: T vs E */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <span style={titleStyle}>T(E) — reflectionless: T = 1 for all E &gt; 0</span>
            <HelpButton onClick={() => setHelpTopic('ptTvsE')} />
          </div>
          <Plot data={tvsETraces as never} layout={tvsELayout as never}
            config={cfg} style={{ width: '100%' }} />
        </div>

        {/* Section 2: Potential + bound state levels */}
        <div style={sectionStyle}>
          <button onClick={() => setShowPot(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showPot ? '▾' : '▸'}</span>
            <span style={titleStyle}>
              Potential V(x) = −V₀ sech²(αx) with {N} bound-state level{N !== 1 ? 's' : ''}
            </span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('ptPotential')} />
            </span>
          </button>
          {showPot && (
            <Plot data={potTraces as never} layout={potLayout as never}
              config={cfg} style={{ width: '100%' }} />
          )}
        </div>

        {/* Section 3: Bound state wavefunctions */}
        <div style={{ ...sectionStyle, borderBottom: 'none' }}>
          <button onClick={() => setShowPsi(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showPsi ? '▾' : '▸'}</span>
            <span style={titleStyle}>Bound-state wavefunctions |ψⱼ(x)|²</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('ptWavefunction')} />
            </span>
          </button>
          {showPsi && (
            <Plot data={psiTraces as never} layout={psiLayout as never}
              config={cfg} style={{ width: '100%' }} />
          )}
        </div>

      </div>
    </>
  )
}

function ptHelpTitle(topic: ScatteringInfoTopic): string {
  if (topic === 'ptTvsE')       return 'Pöschl-Teller — Reflectionless Transmission'
  if (topic === 'ptWavefunction') return 'Pöschl-Teller — Bound-State Wavefunctions'
  return 'Pöschl-Teller — Potential and Bound States'
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

const subtitleStyle: React.CSSProperties = {
  margin: '0 0 1rem', fontSize: '0.85rem', color: '#c8c8d8', lineHeight: 1.5,
}
const subtitleEmStyle: React.CSSProperties = { color: '#c8c8d8' }
