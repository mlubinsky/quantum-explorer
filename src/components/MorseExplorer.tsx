import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import { ScatteringInfoPanel } from './ScatteringInfoPanel'
import type { ScatteringInfoTopic } from './ScatteringInfoPanel'
import {
  morseV, morseLambda, morseOmega, morseNBound,
  morseEnergy, morseTurningPoints, morsePsi, morseProb,
} from '../physics/morse'

// ── Constants ─────────────────────────────────────────────────────────────────

const N_POT  = 600   // points for potential curve
const N_PSI  = 800   // points for wavefunction

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  cyan: '#00b4d8', orange: '#f77f00', green: '#06d6a0', red: '#ef233c',
  gold: '#ffd166',
}

const LEVEL_COLORS = [
  '#4361ee', '#4895ef', '#4cc9f0', '#06d6a0',
  '#f77f00', '#ef233c', '#9b5de5', '#f72585',
]

const EV = 27.2114   // Hartree → eV

// ── Layout helpers ────────────────────────────────────────────────────────────

function darkLayout(extra: Record<string, unknown> = {}) {
  return {
    paper_bgcolor: DARK.paper, plot_bgcolor: DARK.plot,
    font: { color: DARK.text, size: 12 },
    margin: { l: 58, r: 20, t: 36, b: 50 },
    height: 340,
    showlegend: true,
    legend: { x: 0.65, y: 0.98, bgcolor: 'rgba(0,0,0,0.5)', font: { size: 11 } },
    ...extra,
  }
}

function axis(title: string, extra: Record<string, unknown> = {}) {
  return {
    title: { text: title, font: { color: '#aaa', size: 11 } },
    color: '#aaa', gridcolor: DARK.grid, zerolinecolor: DARK.grid, ...extra,
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export function MorseExplorer() {
  const [De,    setDe]    = useState(8.0)
  const [alpha, setAlpha] = useState(0.7)
  const [n,     setN]     = useState(0)

  const [showPot,   setShowPot]   = useState(true)
  const [showPsi,   setShowPsi]   = useState(true)
  const [showTable, setShowTable] = useState(true)

  const [helpTopic, setHelpTopic] = useState<ScatteringInfoTopic | null>(null)

  // ── Derived scalars ────────────────────────────────────────────────────────
  const lambda  = morseLambda(De, alpha)
  const omega   = morseOmega(De, alpha)
  const nBound  = morseNBound(De, alpha)
  const nSafe   = Math.min(n, nBound - 1)
  const En      = morseEnergy(nSafe, De, alpha)
  const [xTL, xTR] = morseTurningPoints(nSafe, De, alpha)

  // x-axis extent: tightest left turning point − margin … widest right + margin
  const [x0L] = morseTurningPoints(0, De, alpha)
  const [, xNL] = morseTurningPoints(nBound - 1, De, alpha)
  const margin = 2.0 / alpha
  const xMin = x0L - margin
  const xMax = xNL + margin * 1.5

  // ── Section 1: Potential + energy levels + ψ² overlay ─────────────────────

  const { potTraces, potLayout } = useMemo(() => {
    const xs = Array.from({ length: N_POT }, (_, i) => xMin + i * (xMax - xMin) / (N_POT - 1))

    // Potential curve (clip at De*1.1 so the left wall doesn't blow the y-axis)
    const Vmax = De * 0.2
    const Vy   = xs.map(x => Math.min(morseV(x, De, alpha), Vmax))

    // Per-level energy lines and |ψ_n(x)|² overlay for selected n
    const traces: unknown[] = [
      {
        x: xs, y: Vy,
        type: 'scatter', mode: 'lines', name: 'V(x)',
        line: { color: DARK.cyan, width: 2 },
      },
      {
        x: [xMin, xMax], y: [0, 0],
        type: 'scatter', mode: 'lines', name: 'Dissociation (E=0)',
        showlegend: true,
        line: { color: '#555', width: 1.2, dash: 'dash' },
      },
    ]

    // Energy level lines
    for (let i = 0; i < nBound; i++) {
      const Ei = morseEnergy(i, De, alpha)
      const [lL, lR] = morseTurningPoints(i, De, alpha)
      traces.push({
        x: [lL, lR], y: [Ei, Ei],
        type: 'scatter', mode: 'lines', showlegend: false,
        line: { color: i === nSafe ? DARK.gold : LEVEL_COLORS[i % LEVEL_COLORS.length], width: i === nSafe ? 2.2 : 1.2 },
      })
    }

    // |ψ_nSafe|² overlay scaled to fit between E_n and next level (or dissociation)
    const psiXs = Array.from({ length: N_PSI }, (_, i) => xTL - margin * 0.3 + i * (xTR - xTL + margin * 0.6) / (N_PSI - 1))
    const probVals = psiXs.map(x => morseProb(x, nSafe, De, alpha))
    const probMax  = Math.max(...probVals, 1e-30)
    const gap = nSafe < nBound - 1
      ? (morseEnergy(nSafe + 1, De, alpha) - En) * 0.55
      : -En * 0.55
    traces.push({
      x: psiXs, y: probVals.map(p => En + p * gap / probMax),
      type: 'scatter', mode: 'lines', name: `|ψ_${nSafe}|² (scaled)`,
      line: { color: DARK.gold, width: 1.8 },
      fill: 'tozeroy',
      fillcolor: 'rgba(255, 209, 102, 0.10)',
    })

    const yMin = -De * 1.02
    const layout = darkLayout({
      height: 380,
      xaxis: axis('x (a₀)'),
      yaxis: axis('V(x) / E (a.u.)', { range: [yMin, De * 0.22] }),
      shapes: [
        // Highlight selected turning points
        { type: 'line', x0: xTL, x1: xTL, y0: yMin, y1: De * 0.2,
          line: { color: DARK.gold, width: 1, dash: 'dot' } },
        { type: 'line', x0: xTR, x1: xTR, y0: yMin, y1: De * 0.2,
          line: { color: DARK.gold, width: 1, dash: 'dot' } },
      ],
    })
    return { potTraces: traces, potLayout: layout }
  }, [De, alpha, nBound, nSafe, xMin, xMax, xTL, xTR, En, margin])

  // ── Section 2: Wavefunction ψ_n(x) and |ψ_n|² ────────────────────────────

  const { psiTraces, psiLayout } = useMemo(() => {
    const x0 = xTL - margin * 0.5
    const x1 = xTR + margin * 0.8
    const xs  = Array.from({ length: N_PSI }, (_, i) => x0 + i * (x1 - x0) / (N_PSI - 1))

    const psiVals  = xs.map(x => morsePsi(x, nSafe, De, alpha))
    const probVals = psiVals.map(p => p * p)
    const psiMax   = Math.max(...psiVals.map(Math.abs), 1e-30)

    const traces = [
      {
        x: xs, y: psiVals,
        type: 'scatter', mode: 'lines', name: `ψ_${nSafe}(x)`,
        line: { color: DARK.cyan, width: 2 },
      },
      {
        x: xs, y: probVals,
        type: 'scatter', mode: 'lines', name: `|ψ_${nSafe}|²`,
        line: { color: DARK.green, width: 2 },
        fill: 'tozeroy', fillcolor: 'rgba(6,214,160,0.08)',
      },
    ]

    const layout = darkLayout({
      height: 300,
      xaxis: axis('x (a₀)'),
      yaxis: axis('ψ  /  |ψ|²', { range: [-psiMax * 1.3, psiMax * 1.5] }),
      shapes: [
        { type: 'line', x0: xTL, x1: xTL, y0: -psiMax * 1.3, y1: psiMax * 1.5,
          line: { color: '#555', width: 1, dash: 'dash' } },
        { type: 'line', x0: xTR, x1: xTR, y0: -psiMax * 1.3, y1: psiMax * 1.5,
          line: { color: '#555', width: 1, dash: 'dash' } },
      ],
      annotations: [
        { x: (xTL + xTR) / 2, y: psiMax * 1.38,
          text: `n = ${nSafe},  ${nSafe} node${nSafe !== 1 ? 's' : ''}`,
          showarrow: false, font: { size: 11, color: '#888' } },
      ],
    })
    return { psiTraces: traces, psiLayout: layout }
  }, [De, alpha, nSafe, xTL, xTR, margin])

  const cfg = { displayModeBar: false, responsive: true }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {helpTopic && (
        <HelpModal title={morseHelpTitle(helpTopic)} onClose={() => setHelpTopic(null)}>
          <ScatteringInfoPanel topic={helpTopic} />
        </HelpModal>
      )}

      <p style={subtitleStyle}>
        V(r) = Dₑ(1 − e^(−a(r−rₑ)))² — an exactly solvable{' '}
        <strong style={subtitleEmStyle}>anharmonic</strong> model for molecular vibrations. Unlike the harmonic
        oscillator it has a <strong style={subtitleEmStyle}>finite number of bound states</strong> and dissociates
        at V = Dₑ. Wavefunctions are generalized Laguerre polynomials.
      </p>

      <div style={{ maxWidth: 780 }}>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem', marginBottom: '0.5rem' }}>
          <ParameterSlider label="D_e (well depth)" value={De}
            min={1} max={20} step={0.5} unit="a.u." onChange={v => { setDe(v); setN(0) }} />
          <ParameterSlider label="α (range parameter)" value={alpha}
            min={0.2} max={2.0} step={0.05} unit="a₀⁻¹" onChange={v => { setAlpha(v); setN(0) }} />
        </div>

        {/* n selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Quantum number n:</span>
          {Array.from({ length: nBound }, (_, i) => i).map(i => (
            <button key={i} onClick={() => setN(i)}
              style={{
                padding: '2px 10px', border: 'none', borderRadius: 4, cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600,
                background: i === nSafe ? LEVEL_COLORS[i % LEVEL_COLORS.length] : '#222',
                color: i === nSafe ? '#fff' : '#888',
              }}>
              {i}
            </button>
          ))}
        </div>

        {/* Readout */}
        <div style={readoutStyle}>
          <span style={{ color: DARK.orange }}>λ = <strong>{lambda.toFixed(3)}</strong></span>
          <span style={{ color: DARK.cyan }}>ω_e = <strong>{omega.toFixed(4)}</strong> a.u.</span>
          <span style={{ color: '#aaa' }}>N_bound = <strong>{nBound}</strong></span>
          <span style={{ color: LEVEL_COLORS[nSafe % LEVEL_COLORS.length] }}>
            E_{nSafe} = <strong>{En.toFixed(5)}</strong> a.u. = <strong>{(En * EV).toFixed(4)}</strong> eV
          </span>
        </div>

        {/* Section 1: Potential + energy levels */}
        <div style={sectionStyle}>
          <button onClick={() => setShowPot(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showPot ? '▾' : '▸'}</span>
            <span style={titleStyle}>Potential  V(x) and energy levels</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('morsePotential')} />
            </span>
          </button>
          {showPot && (
            <>
              <div style={{ fontSize: '0.74rem', color: '#666', fontStyle: 'italic', marginBottom: 4 }}>
                Cyan: V(x) · Colored bars: E_n levels (turning-point width) · Gold: |ψ_n|² overlay for selected n
              </div>
              <Plot data={potTraces as never} layout={potLayout as never}
                config={cfg} style={{ width: '100%' }} />
            </>
          )}
        </div>

        {/* Section 2: Wavefunction */}
        <div style={sectionStyle}>
          <button onClick={() => setShowPsi(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showPsi ? '▾' : '▸'}</span>
            <span style={titleStyle}>Wavefunction  ψ_n(x) and |ψ_n|²</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('morseWavefunction')} />
            </span>
          </button>
          {showPsi && (
            <>
              <div style={{ fontSize: '0.74rem', color: '#666', fontStyle: 'italic', marginBottom: 4 }}>
                Cyan: ψ_n(x) (signed) · Green: |ψ_n|² · Dashed verticals: classical turning points
              </div>
              <Plot data={psiTraces as never} layout={psiLayout as never}
                config={cfg} style={{ width: '100%' }} />
            </>
          )}
        </div>

        {/* Section 3: Energy level table */}
        <div style={{ ...sectionStyle, borderBottom: 'none' }}>
          <button onClick={() => setShowTable(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showTable ? '▾' : '▸'}</span>
            <span style={titleStyle}>Energy levels and anharmonicity</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('morseAnharmonicity')} />
            </span>
          </button>
          {showTable && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', marginTop: 4 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <th style={thStyle}>n</th>
                  <th style={thStyle}>E_n (a.u.)</th>
                  <th style={thStyle}>E_n (eV)</th>
                  <th style={thStyle}>ΔE_n (a.u.)</th>
                  <th style={thStyle}>ΔE_n / ω_e</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: nBound }, (_, i) => {
                  const Ei   = morseEnergy(i, De, alpha)
                  const dE   = i < nBound - 1 ? morseEnergy(i + 1, De, alpha) - Ei : null
                  const ratio = dE !== null ? dE / omega : null
                  return (
                    <tr key={i} style={{
                      borderBottom: '1px solid #1e1e1e',
                      background: i === nSafe ? 'rgba(255,209,102,0.06)' : 'transparent',
                    }}>
                      <td style={{ ...tdStyle, color: LEVEL_COLORS[i % LEVEL_COLORS.length] }}>{i}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{Ei.toFixed(5)}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace' }}>{(Ei * EV).toFixed(4)}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', color: DARK.orange }}>
                        {dE !== null ? dE.toFixed(5) : '—'}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', color: ratio !== null && ratio < 0.4 ? DARK.red : '#aaa' }}>
                        {ratio !== null ? ratio.toFixed(4) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function morseHelpTitle(topic: ScatteringInfoTopic): string {
  if (topic === 'morsePotential')     return 'Morse Potential — V(x) and Energy Levels'
  if (topic === 'morseWavefunction')  return 'Morse — Exact Wavefunctions'
  return 'Morse — Anharmonic Spacing'
}

// ── Styles ────────────────────────────────────────────────────────────────────

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

const collapseStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4,
  width: '100%', background: 'none', border: 'none',
  cursor: 'pointer', padding: '0.3rem 0', marginBottom: '0.5rem',
  textAlign: 'left',
}

const titleStyle: React.CSSProperties = {
  flex: 1, fontSize: '0.9rem', fontWeight: 600, color: '#c0c0c0',
}

const thStyle: React.CSSProperties = {
  textAlign: 'left', padding: '4px 8px', color: '#666', fontWeight: 600,
}

const tdStyle: React.CSSProperties = {
  padding: '4px 8px', color: '#aaa',
}

const subtitleStyle: React.CSSProperties = {
  margin: '0 0 1rem', fontSize: '0.85rem', color: '#c8c8d8', lineHeight: 1.5,
}
const subtitleEmStyle: React.CSSProperties = { color: '#c8c8d8' }
