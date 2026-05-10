import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import { ScatteringInfoPanel } from './ScatteringInfoPanel'
import type { ScatteringInfoTopic } from './ScatteringInfoPanel'
import { deltaT, deltaR, deltaBoundEnergy, deltaBoundPsiSq, deltaPsiSq } from '../physics/delta'

const N_ENERGY = 400
const N_SPACE  = 600
const E_MIN = 0.01
const E_MAX = 12

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  blue: '#4361ee', red: '#ef233c', orange: '#f77f00', green: '#06d6a0',
  grey: '#555', purple: '#9b5de5',
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

export function DeltaExplorer() {
  const [alpha,      setAlpha]      = useState(2.0)
  const [E,          setE]          = useState(1.0)
  const [attractive, setAttractive] = useState(true)

  const [showPsi,     setShowPsi]     = useState(true)
  const [showBound,   setShowBound]   = useState(true)
  const [showPot,     setShowPot]     = useState(true)

  const [helpTopic, setHelpTopic] = useState<ScatteringInfoTopic | null>(null)

  // ── Derived ────────────────────────────────────────────────────────────────
  const sign: 1 | -1  = attractive ? -1 : 1
  const T  = deltaT(E, alpha)
  const R  = deltaR(E, alpha)
  const Eb = deltaBoundEnergy(alpha)   // always shown; relevant only for attractive

  // ── T vs E curve ──────────────────────────────────────────────────────────
  const { eVals, tVals, rVals } = useMemo(() => {
    const eVals = Array.from({ length: N_ENERGY }, (_, i) =>
      E_MIN + (E_MAX - E_MIN) * i / (N_ENERGY - 1))
    return {
      eVals,
      tVals: eVals.map(e => deltaT(e, alpha)),
      rVals: eVals.map(e => deltaR(e, alpha)),
    }
  }, [alpha])

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
        x: [E, E], y: [-0.05, 1.05],
        type: 'scatter', mode: 'lines', showlegend: false,
        line: { color: DARK.grey, width: 1, dash: 'dot' },
      },
      {
        x: [E], y: [T],
        type: 'scatter', mode: 'markers', showlegend: false,
        marker: { color: DARK.green, size: 9 },
      },
    ]
    // For attractive: mark the half-transmission energy E = |Eb|
    if (attractive) {
      traces.push({
        x: [Math.abs(Eb), Math.abs(Eb)], y: [-0.05, 1.05],
        type: 'scatter', mode: 'lines', showlegend: false,
        line: { color: DARK.purple, width: 1, dash: 'dash' },
      })
    }
    return traces
  }, [eVals, tVals, rVals, E, T, attractive, Eb])

  const tvsEAnnotations = attractive
    ? [{ x: Math.abs(Eb), y: 1.04, text: '|E_b| (T=½)', showarrow: false,
         font: { size: 9, color: DARK.purple }, xanchor: 'center' }]
    : []

  const tvsELayout = {
    ...darkLayout({
      xaxis: { ...axis('E (a.u.)'), range: [0, E_MAX] },
      yaxis: { ...axis('T, R'), range: [-0.05, 1.1] },
    }),
    annotations: tvsEAnnotations,
  }

  // ── Scattering wavefunction ───────────────────────────────────────────────
  const { xPsi, psiSqVals } = useMemo(() => {
    const k = Math.sqrt(2 * Math.max(E, 1e-6))
    const wavelength = 2 * Math.PI / k
    const xL = -Math.max(3 * wavelength, 4 / Math.max(alpha, 0.1))
    const xR =  Math.max(1.5 * wavelength, 2 / Math.max(alpha, 0.1))
    const xPsi = Array.from({ length: N_SPACE }, (_, i) =>
      xL + (xR - xL) * i / (N_SPACE - 1))
    return {
      xPsi,
      psiSqVals: xPsi.map(x => deltaPsiSq(x, E, alpha, sign)),
    }
  }, [E, alpha, sign])

  const psiTraces = useMemo(() => {
    const traces: unknown[] = [
      {
        x: xPsi, y: psiSqVals,
        type: 'scatter', mode: 'lines', name: '|ψ(x)|²',
        line: { color: DARK.blue, width: 2 },
      },
    ]
    // Right-side flat-T reference
    const xRight = xPsi[xPsi.length - 1]
    traces.push({
      x: [0, xRight], y: [T, T],
      type: 'scatter', mode: 'lines', showlegend: false,
      line: { color: DARK.green, width: 1, dash: 'dot' },
    })
    return traces
  }, [xPsi, psiSqVals, T])

  const psiMax = useMemo(() => {
    const R = 1 - T
    return Math.max((1 + Math.sqrt(R)) ** 2 * 1.1, T * 1.5, 0.5)
  }, [T])

  const psiLayout = {
    ...darkLayout({
      legend: { x: 0.01, y: 0.98, bgcolor: 'rgba(0,0,0,0.5)', font: { size: 11 } },
    }),
    xaxis: { ...axis('x (a.u.)') },
    yaxis: { ...axis('|ψ(x)|²'), range: [0, psiMax] },
    shapes: [
      { type: 'line', x0: 0, y0: 0, x1: 0, y1: psiMax,
        line: { color: '#333', width: 1.5, dash: 'dash' } },
    ],
    annotations: [
      { x: 0.02 * (xPsi[xPsi.length - 1]), y: T + 0.04 * psiMax,
        text: `T = ${T.toFixed(3)}`, showarrow: false,
        font: { size: 10, color: DARK.green }, xanchor: 'left' },
      { x: -0.05 * (xPsi[xPsi.length - 1]), y: psiMax * 0.96,
        text: 'incident + reflected', showarrow: false,
        font: { size: 9, color: '#777' }, xanchor: 'right' },
    ],
  }

  // ── Bound state wavefunction (attractive only) ────────────────────────────
  const { xBound, boundPsiSq } = useMemo(() => {
    const xMax = 5 / Math.max(alpha, 0.1)
    const N = 400
    const xBound = Array.from({ length: N }, (_, i) =>
      -xMax + 2 * xMax * i / (N - 1))
    return {
      xBound,
      boundPsiSq: xBound.map(x => deltaBoundPsiSq(x, alpha)),
    }
  }, [alpha])

  const boundLayout = {
    ...darkLayout({ height: 220, showlegend: false }),
    xaxis: { ...axis('x (a.u.)') },
    yaxis: { ...axis('|ψ_b(x)|²'), rangemode: 'tozero' },
    annotations: [
      { x: 0, y: alpha * 1.05, text: `peak = α = ${alpha.toFixed(2)}`,
        showarrow: false, font: { size: 10, color: DARK.purple }, xanchor: 'center' },
      { x: 0.92 / Math.max(alpha, 0.01), y: alpha * 0.5,
        text: `1/α = ${(1/alpha).toFixed(2)}`, showarrow: true,
        ax: 35, ay: -20, font: { size: 9, color: '#aaa' }, xanchor: 'left' },
    ],
  }

  // ── Potential diagram ─────────────────────────────────────────────────────
  // Show V=0 everywhere with a spike at x=0.
  // Spike direction: up for repulsive, down for attractive.
  const potXRange = Math.max(4 / Math.max(alpha, 0.3), 3)
  const spikeH = (E_MAX / 4) * (attractive ? -1 : 1)
  const yPotMin = attractive ? Math.min(Eb * 1.3, spikeH * 1.2, -0.5) : -1
  const yPotMax = attractive ? Math.max(E_MAX / 4 * 1.1, E * 1.3) : Math.max(spikeH * 1.2, E * 1.5, 2)

  const potTraces = [
    // V = 0 baseline
    { x: [-potXRange, potXRange], y: [0, 0],
      type: 'scatter', mode: 'lines', showlegend: false,
      line: { color: '#444', width: 1 } },
    // Energy level E
    { x: [-potXRange, potXRange], y: [E, E],
      type: 'scatter', mode: 'lines', name: `E = ${E.toFixed(2)} a.u.`,
      line: { color: DARK.blue, width: 1.5, dash: 'dash' } },
    ...(attractive ? [{
      // Bound-state energy level
      x: [-potXRange, potXRange], y: [Eb, Eb],
      type: 'scatter', mode: 'lines', name: `E_b = ${Eb.toFixed(3)} a.u.`,
      line: { color: DARK.purple, width: 1.5, dash: 'dot' },
    }] : []),
  ]

  const potLayout = {
    ...darkLayout({ height: 240 }),
    xaxis: { ...axis('x (a.u.)'), range: [-potXRange, potXRange], zeroline: false },
    yaxis: { ...axis('V(x), E (a.u.)'), range: [yPotMin, yPotMax] },
    shapes: [
      // Spike for the delta function
      { type: 'line', x0: 0, y0: 0, x1: 0, y1: spikeH,
        line: { color: DARK.orange, width: 4 } },
    ],
    annotations: [
      { x: 0, y: spikeH, text: attractive ? '−αδ(x)' : '+αδ(x)',
        showarrow: true, ax: attractive ? -35 : -35, ay: attractive ? 25 : -25,
        font: { size: 11, color: DARK.orange }, xanchor: 'center' },
      ...(attractive ? [{
        x: potXRange * 0.65, y: Eb + (yPotMax - yPotMin) * 0.04,
        text: `E_b = −α²/2`, showarrow: false,
        font: { size: 9, color: DARK.purple }, xanchor: 'left',
      }] : []),
    ],
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0.5)', font: { size: 10 } },
  }

  const cfg = { displayModeBar: false, responsive: true }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {helpTopic && (
        <HelpModal title={deltaHelpTitle(helpTopic)} onClose={() => setHelpTopic(null)}>
          <ScatteringInfoPanel topic={helpTopic} />
        </HelpModal>
      )}

      <div style={{ maxWidth: 780 }}>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.35rem' }}>
              Potential type
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: '0.7rem' }}>
              {([true, false] as const).map(attr => (
                <button key={String(attr)} onClick={() => setAttractive(attr)} style={{
                  padding: '0.3rem 0.7rem', borderRadius: 4, cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 600, border: '1px solid',
                  background: attractive === attr
                    ? (attr ? DARK.purple + '33' : DARK.orange + '33')
                    : '#1a1a1a',
                  color: attractive === attr
                    ? (attr ? DARK.purple : DARK.orange)
                    : '#888',
                  borderColor: attractive === attr
                    ? (attr ? DARK.purple : DARK.orange)
                    : '#333',
                }}>
                  {attr ? 'Attractive −αδ(x)' : 'Repulsive +αδ(x)'}
                </button>
              ))}
            </div>
            <ParameterSlider label="Strength α" value={alpha} min={0.1} max={5} step={0.1}
              onChange={setAlpha} />
          </div>
          <ParameterSlider label="E (particle energy)" value={E}
            min={0.05} max={E_MAX} step={0.05} unit="a.u."
            description="Scattering energy"
            onChange={setE} />
        </div>

        {/* Readout */}
        <div style={readoutStyle}>
          <span>E = <strong>{E.toFixed(3)}</strong> a.u.</span>
          <span style={{ color: DARK.blue  }}>T = <strong>{T.toFixed(5)}</strong></span>
          <span style={{ color: DARK.red   }}>R = <strong>{R.toFixed(5)}</strong></span>
          <span style={{ color: '#06d6a0' }}>T+R = <strong>{(T + R).toFixed(7)}</strong></span>
          {attractive && (
            <span style={{ color: DARK.purple }}>
              E_b = <strong>{Eb.toFixed(4)}</strong> a.u.
            </span>
          )}
          {attractive && (
            <span style={{ color: '#aaa', fontSize: '0.82em' }}>
              E {E < Math.abs(Eb) ? '< |E_b|' : E < 3 * Math.abs(Eb) ? '≈ |E_b|' : '> |E_b|'}
              {E < Math.abs(Eb) ? '' : E < 3 * Math.abs(Eb) ? ' (T near ½)' : ' (T > ½)'}
            </span>
          )}
        </div>

        {/* Section 1: T vs E */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <span style={titleStyle}>Transmission T(E) and Reflection R(E)</span>
            <HelpButton onClick={() => setHelpTopic('deltaTvsE')} />
          </div>
          <Plot data={tvsETraces as never} layout={tvsELayout as never}
            config={cfg} style={{ width: '100%' }} />
        </div>

        {/* Section 2: Scattering wavefunction */}
        <div style={sectionStyle}>
          <button onClick={() => setShowPsi(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showPsi ? '▾' : '▸'}</span>
            <span style={titleStyle}>Scattering wavefunction |ψ(x)|²</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('deltaWavefunction')} />
            </span>
          </button>
          {showPsi && (
            <Plot data={psiTraces as never} layout={psiLayout as never}
              config={cfg} style={{ width: '100%' }} />
          )}
        </div>

        {/* Section 3: Bound state (attractive only) */}
        {attractive && (
          <div style={sectionStyle}>
            <button onClick={() => setShowBound(s => !s)} style={collapseStyle}>
              <span style={{ marginRight: 6 }}>{showBound ? '▾' : '▸'}</span>
              <span style={titleStyle}>{'Bound state |ψ_b(x)|² = α exp(−2α|x|)'}</span>
              <span onClick={e => e.stopPropagation()}>
                <HelpButton onClick={() => setHelpTopic('deltaWavefunction')} />
              </span>
            </button>
            {showBound && (
              <Plot
                data={[{
                  x: xBound, y: boundPsiSq,
                  type: 'scatter', mode: 'lines', name: '|ψ_b|²',
                  line: { color: DARK.purple, width: 2.5 },
                  fill: 'tozeroy', fillcolor: DARK.purple + '22',
                } as never]}
                layout={boundLayout as never}
                config={cfg} style={{ width: '100%' }}
              />
            )}
          </div>
        )}

        {/* Section 4: Potential diagram */}
        <div style={{ ...sectionStyle, borderBottom: 'none' }}>
          <button onClick={() => setShowPot(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showPot ? '▾' : '▸'}</span>
            <span style={titleStyle}>
              Potential diagram{attractive ? ' (bound-state energy level shown)' : ''}
            </span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('deltaPotential')} />
            </span>
          </button>
          {showPot && (
            <Plot data={potTraces as never} layout={potLayout as never}
              config={cfg} style={{ width: '100%' }} />
          )}
        </div>

      </div>
    </>
  )
}

function deltaHelpTitle(topic: ScatteringInfoTopic): string {
  if (topic === 'deltaTvsE')        return 'Delta Potential — T(E) and R(E)'
  if (topic === 'deltaWavefunction') return 'Delta Potential — Wavefunctions'
  return 'Delta Potential — Physics'
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
