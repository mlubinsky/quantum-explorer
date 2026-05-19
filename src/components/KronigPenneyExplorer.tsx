import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import { ScatteringInfoPanel } from './ScatteringInfoPanel'
import type { ScatteringInfoTopic } from './ScatteringInfoPanel'
import { kpP, kpRHS, kpAllowed, kpBlochKa, kpZoneBoundaries } from '../physics/kronigPenney'

// ── Constants ─────────────────────────────────────────────────────────────────

const N_SCAN = 1200   // E-axis points for dispersion + background shading
const N_BAND = 1500   // E-axis points for band structure scatter

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  blue: '#4361ee', cyan: '#00b4d8', orange: '#f77f00', green: '#06d6a0',
  red: '#ef233c',
}

// Per-band colors (cycles for bands beyond 6)
const BAND_COLORS = ['#4361ee', '#06d6a0', '#f77f00', '#ef233c', '#9b5de5', '#00b4d8']

function darkLayout(extra: Record<string, unknown> = {}) {
  return {
    paper_bgcolor: DARK.paper, plot_bgcolor: DARK.plot,
    font: { color: DARK.text, size: 12 },
    margin: { l: 58, r: 20, t: 36, b: 50 },
    height: 300,
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

export function KronigPenneyExplorer() {
  const [alpha, setAlpha] = useState(1.5)
  const [a,     setA]     = useState(4.0)

  const [showDisp,   setShowDisp]   = useState(true)
  const [showBands,  setShowBands]  = useState(true)
  const [showTable,  setShowTable]  = useState(true)

  const [helpTopic, setHelpTopic] = useState<ScatteringInfoTopic | null>(null)

  const P     = kpP(alpha, a)
  const E1    = (Math.PI / a) ** 2 / 2       // first zone-boundary energy
  const E_MAX = 4.5 * 4 * E1                  // covers ~4 full oscillation periods

  // ── Dispersion condition f(E) ──────────────────────────────────────────────

  const { dispTraces, dispLayout } = useMemo(() => {
    const eVals = Array.from({ length: N_SCAN + 1 }, (_, i) => i * E_MAX / N_SCAN)

    // Split into allowed (blue) and forbidden (red/dim) segments
    const allowedE: number[] = [], allowedF: number[] = []
    const forbidE:  number[] = [], forbidF:  number[] = []

    for (const E of eVals) {
      const f = kpRHS(E, P, a)
      if (kpAllowed(E, P, a)) {
        allowedE.push(E); allowedF.push(f)
        // Add null break if previous was forbidden (to split Plotly line)
        if (forbidE.length > 0 && forbidF[forbidF.length - 1] !== null) {
          allowedE.push(NaN); allowedF.push(NaN)
        }
      } else {
        forbidE.push(E); forbidF.push(f)
        if (allowedE.length > 0 && allowedF[allowedF.length - 1] !== null) {
          forbidE.push(NaN); forbidF.push(NaN)
        }
      }
    }

    // Build gap background shapes by scanning for |f| > 1 transitions
    const shapes: unknown[] = []
    let gapStart: number | null = null
    for (let i = 0; i <= N_SCAN; i++) {
      const E = i * E_MAX / N_SCAN
      const inGap = !kpAllowed(E, P, a)
      if (inGap && gapStart === null) gapStart = E
      if (!inGap && gapStart !== null) {
        shapes.push({
          type: 'rect', x0: gapStart, x1: E, y0: 0, y1: 1, yref: 'paper',
          fillcolor: 'rgba(239,35,60,0.10)', line: { width: 0 },
        })
        gapStart = null
      }
    }
    if (gapStart !== null) {
      shapes.push({
        type: 'rect', x0: gapStart, x1: E_MAX, y0: 0, y1: 1, yref: 'paper',
        fillcolor: 'rgba(239,35,60,0.10)', line: { width: 0 },
      })
    }

    // ±1 reference lines
    const refLines = [-1, 1].map(y => ({
      type: 'line', x0: 0, x1: E_MAX, y0: y, y1: y,
      line: { color: '#555', width: 1, dash: 'dash' },
    }))

    const traces = [
      {
        x: allowedE, y: allowedF,
        type: 'scatter', mode: 'lines', name: 'Allowed  |f| ≤ 1',
        line: { color: DARK.cyan, width: 2.2 },
        connectgaps: false,
      },
      {
        x: forbidE, y: forbidF,
        type: 'scatter', mode: 'lines', name: 'Forbidden  |f| > 1',
        line: { color: DARK.red, width: 2.2 },
        connectgaps: false,
      },
      {
        x: [0, E_MAX], y: [0, 0],
        type: 'scatter', mode: 'lines', showlegend: false,
        line: { color: '#2a2a2a', width: 1 },
      },
    ]

    const layout = {
      ...darkLayout({
        height: 320,
        xaxis: axis('E (a.u.)'),
        yaxis: axis('f(ka) = cos(Ka)', { range: [Math.min(-1.6, -(1 + P) * 0.55), (1 + P) * 1.1] }),
        shapes: [...shapes, ...refLines],
        annotations: [
          { x: E_MAX * 0.82, y: 1.12, text: 'f = +1', showarrow: false,
            font: { size: 10, color: '#888' } },
          { x: E_MAX * 0.82, y: -1.12, text: 'f = −1', showarrow: false,
            font: { size: 10, color: '#888' } },
        ],
      }),
    }

    return { dispTraces: traces, dispLayout: layout }
  }, [P, a, E_MAX])

  // ── Band structure E(Ka/π) ─────────────────────────────────────────────────

  const bandTraces = useMemo(() => {
    // Scan E and scatter (Ka/π, E) colored by which zone period we're in
    // Zone n occupies ka ∈ [(n-1)π, nπ]
    type Band = { Ka: number[]; E: number[] }
    const bands: Band[] = []

    for (let i = 0; i <= N_BAND; i++) {
      const E = i * E_MAX / N_BAND
      if (!kpAllowed(E, P, a)) continue

      const Ka = kpBlochKa(E, P, a)
      if (isNaN(Ka)) continue

      // Determine band index from ka
      const ka = a * Math.sqrt(2 * E)
      const n = Math.floor(ka / Math.PI)   // 0-indexed zone period
      while (bands.length <= n) bands.push({ Ka: [], E: [] })
      bands[n].Ka.push(Ka / Math.PI)
      bands[n].E.push(E)
    }

    return bands.map((b, n) => ({
      x: b.Ka, y: b.E,
      type: 'scatter', mode: 'markers',
      name: `Band ${n + 1}`,
      marker: { color: BAND_COLORS[n % BAND_COLORS.length], size: 2.5, opacity: 0.85 },
      hovertemplate: `Band ${n+1}<br>Ka/π=%{x:.3f}<br>E=%{y:.4f} a.u.<extra></extra>`,
    }))
  }, [P, a, E_MAX])

  const bandLayout = useMemo(() => ({
    ...darkLayout({
      height: 340,
      xaxis: axis('Ka/π (reduced Brillouin zone)', { range: [0, 1] }),
      yaxis: axis('E (a.u.)', { range: [0, E_MAX] }),
      legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0.5)', font: { size: 10 } },
      shapes: [
        { type: 'line', x0: 0, x1: 0, y0: 0, y1: E_MAX, line: { color: '#333', width: 1 } },
        { type: 'line', x0: 1, x1: 1, y0: 0, y1: E_MAX, line: { color: '#333', width: 1 } },
      ],
      annotations: [
        { x: 0,   y: E_MAX * 1.04, text: 'Γ', showarrow: false, font: { size: 11, color: '#777' } },
        { x: 1,   y: E_MAX * 1.04, text: 'X', showarrow: false, font: { size: 11, color: '#777' } },
        { x: 0.5, y: E_MAX * 1.04, text: 'Reduced zone  Ka/π ∈ [0, 1]',
          showarrow: false, font: { size: 9, color: '#555' } },
      ],
    }),
  }), [E_MAX])

  // ── Zone boundary table ────────────────────────────────────────────────────

  const zoneBounds = useMemo(() => kpZoneBoundaries(a, 5), [a])

  const cfg = { displayModeBar: false, responsive: true }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {helpTopic && (
        <HelpModal title={kpHelpTitle(helpTopic)} onClose={() => setHelpTopic(null)}>
          <ScatteringInfoPanel topic={helpTopic} />
        </HelpModal>
      )}

      <p style={subtitleStyle}>
        A 1D periodic array of rectangular barriers solved by the exact{' '}
        <strong style={subtitleEmStyle}>transfer-matrix method</strong>. Shows the origin of{' '}
        <strong style={subtitleEmStyle}>energy bands and forbidden gaps</strong> in crystalline solids.
        Explore the Brillouin zone, band edges, and effective mass as barrier height and width vary.
      </p>

      <div style={{ maxWidth: 780 }}>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem', marginBottom: '0.5rem' }}>
          <ParameterSlider label="α (barrier strength)" value={alpha}
            min={0} max={5} step={0.1} unit="a.u." onChange={setAlpha} />
          <ParameterSlider label="a (lattice constant)" value={a}
            min={1} max={8} step={0.5} unit="a₀" onChange={setA} />
        </div>

        {/* Readout */}
        <div style={readoutStyle}>
          <span style={{ color: DARK.orange }}>P = αa = <strong>{P.toFixed(2)}</strong></span>
          {P === 0 && <span style={{ color: DARK.green }}>  Free particle — no band gaps</span>}
          <span style={{ color: '#aaa' }}>E₁ = (π/a)²/2 = <strong>{E1.toFixed(4)}</strong> a.u.</span>
          <span style={{ color: DARK.cyan }}>= <strong>{(E1 * 27.2114).toFixed(3)}</strong> eV</span>
        </div>

        {/* Section 1: Dispersion condition */}
        <div style={sectionStyle}>
          <button onClick={() => setShowDisp(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showDisp ? '▾' : '▸'}</span>
            <span style={titleStyle}>
              Dispersion condition  f(E) = cos(Ka)
            </span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('kpDispersion')} />
            </span>
          </button>
          {showDisp && (
            <>
              <div style={{ fontSize: '0.74rem', color: '#666', fontStyle: 'italic', marginBottom: 4 }}>
                Blue: allowed band |f| ≤ 1 · Red: forbidden gap |f| &gt; 1 · Red shading marks gap regions
              </div>
              <Plot data={dispTraces as never} layout={dispLayout as never}
                config={cfg} style={{ width: '100%' }} />
            </>
          )}
        </div>

        {/* Section 2: Band structure */}
        <div style={sectionStyle}>
          <button onClick={() => setShowBands(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showBands ? '▾' : '▸'}</span>
            <span style={titleStyle}>
              Band structure  E(Ka/π) — reduced Brillouin zone
            </span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('kpBandStructure')} />
            </span>
          </button>
          {showBands && (
            <>
              <div style={{ fontSize: '0.74rem', color: '#666', fontStyle: 'italic', marginBottom: 4 }}>
                Each coloured trace is one band. Gaps appear as empty horizontal strips.
              </div>
              <Plot data={bandTraces as never} layout={bandLayout as never}
                config={cfg} style={{ width: '100%' }} />
            </>
          )}
        </div>

        {/* Section 3: Zone-boundary table */}
        <div style={{ ...sectionStyle, borderBottom: 'none' }}>
          <button onClick={() => setShowTable(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showTable ? '▾' : '▸'}</span>
            <span style={titleStyle}>Zone-boundary energies  E_n = (nπ/a)²/2</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('kpBands')} />
            </span>
          </button>
          {showTable && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', marginTop: 4 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <th style={thStyle}>n</th>
                  <th style={thStyle}>E_n (a.u.)</th>
                  <th style={thStyle}>E_n (eV)</th>
                  <th style={thStyle}>ka = nπ</th>
                  <th style={thStyle}>f = (−1)ⁿ</th>
                  <th style={thStyle}>Gap above?</th>
                </tr>
              </thead>
              <tbody>
                {zoneBounds.map((En, i) => {
                  const n = i + 1
                  const fHere = (-1) ** n
                  // Check if a gap exists just above En: f should dip below -1 or rise above +1
                  // Probe slightly above En
                  const Eprobe = En * (1 + 0.002)
                  const hasGap = !kpAllowed(Eprobe, P, a)
                  return (
                    <tr key={n} style={{ borderBottom: '1px solid #1e1e1e' }}>
                      <td style={tdStyle}>{n}</td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace', color: BAND_COLORS[(n - 1) % BAND_COLORS.length] }}>
                        {En.toFixed(4)}
                      </td>
                      <td style={{ ...tdStyle, fontFamily: 'monospace' }}>
                        {(En * 27.2114).toFixed(3)}
                      </td>
                      <td style={tdStyle}>{n}π</td>
                      <td style={tdStyle}>{fHere > 0 ? '+1' : '−1'}</td>
                      <td style={{ ...tdStyle, color: hasGap ? DARK.red : DARK.green }}>
                        {P === 0 ? 'No (P=0)' : hasGap ? 'Yes' : 'No (P too small)'}
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

function kpHelpTitle(topic: ScatteringInfoTopic): string {
  if (topic === 'kpDispersion')    return 'Kronig-Penney — Dispersion Condition'
  if (topic === 'kpBandStructure') return 'Kronig-Penney — Band Structure'
  return 'Kronig-Penney — Band Gaps'
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
  display: 'flex', alignItems: 'center', gap: 0, width: '100%',
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#e0e0e0', padding: '0.25rem 0', marginBottom: '0.5rem', textAlign: 'left',
}

const titleStyle: React.CSSProperties = {
  fontWeight: 600, fontSize: '0.9rem', flex: 1,
}

const thStyle: React.CSSProperties = {
  padding: '4px 8px', textAlign: 'left', color: '#777',
  fontWeight: 600, fontSize: '0.8rem',
}

const tdStyle: React.CSSProperties = {
  padding: '4px 8px',
}

const subtitleStyle: React.CSSProperties = {
  margin: '0 0 1rem', fontSize: '0.85rem', color: '#aaa', lineHeight: 1.5,
}
const subtitleEmStyle: React.CSSProperties = { color: '#c8c8d8' }
