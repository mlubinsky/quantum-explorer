import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import {
  hydrogenEnergy, meanRadius, radialNodes,
  radialWavefunction, radialDensity, orbitalDensity2D, rMax as calcRMax,
} from '../physics/hydrogen'
import { HydrogenInfoPanel } from './HydrogenInfoPanel'
import type { HydrogenInfoTopic } from './HydrogenInfoPanel'

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  blue: '#4361ee', cyan: '#00b4d8', orange: '#f77f00', green: '#06d6a0',
  violet: '#7b2fff', red: '#ef233c', yellow: '#ffd166',
}

function darkLayout(extra: Record<string, unknown> = {}) {
  return {
    paper_bgcolor: DARK.paper, plot_bgcolor: DARK.plot,
    font: { color: DARK.text, size: 12 },
    margin: { l: 60, r: 20, t: 30, b: 50 },
    height: 280,
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

const N_RADIAL = 600
const N_ORBITAL = 140

// Spectroscopic labels
const L_LABELS = ['s', 'p', 'd', 'f', 'g']

// Series colours for Grotrian transitions
function seriesColor(nFinal: number): string {
  if (nFinal === 1) return DARK.violet   // Lyman UV
  if (nFinal === 2) return DARK.cyan     // Balmer visible
  if (nFinal === 3) return DARK.orange   // Paschen IR
  return DARK.red                        // Brackett+ IR
}

// Wavelength in nm via Rydberg formula (Z=1 convention, scaled for general Z)
function wavelengthNm(ni: number, nf: number, Z: number): number {
  const Rinf = 1.097e7  // m⁻¹
  const inv = Z * Z * Rinf * (1 / (nf * nf) - 1 / (ni * ni))
  return 1e9 / Math.abs(inv)
}

export function HydrogenExplorer() {
  const [n, setN] = useState(1)
  const [l, setL] = useState(0)
  const [m, setM] = useState(0)
  const [Z, setZ] = useState(1)

  const [showRadial]    = useState(true)
  const [showRwf,       setShowRwf]       = useState(false)
  const [showOrbital,   setShowOrbital]   = useState(true)
  const [showGrotrian,  setShowGrotrian]  = useState(true)

  const [helpTopic, setHelpTopic] = useState<HydrogenInfoTopic | null>(null)
  const [grotHover, setGrotHover] = useState<string | null>(null)

  const En = hydrogenEnergy(n, Z)
  const rMean = meanRadius(n, l, Z)
  const rNodes = radialNodes(n, l)
  const rmax = calcRMax(n, Z)

  // Radial density P(r)
  const { rVals, pVals, rwfVals } = useMemo(() => {
    const rVals = Array.from({ length: N_RADIAL }, (_, i) => (i / (N_RADIAL - 1)) * rmax)
    const pVals = rVals.map(r => radialDensity(n, l, r, Z))
    const rwfVals = rVals.map(r => radialWavefunction(n, l, r, Z))
    return { rVals, pVals, rwfVals }
  }, [n, l, Z, rmax])

  const radialLayout = {
    ...darkLayout({ legend: { x: 0.65, y: 0.98, bgcolor: 'rgba(0,0,0,0.5)', font: { size: 11 } } }),
    xaxis: axis('r (a₀)'),
    yaxis: axis('P(r) = r² |R|²', { rangemode: 'tozero' }),
    shapes: [{ type: 'line', x0: rMean, x1: rMean, y0: 0, y1: 1,
      line: { color: DARK.orange, width: 1.5, dash: 'dash' }, yref: 'paper' }],
    annotations: [{
      x: rMean, y: 1.02, yref: 'paper', text: '⟨r⟩', showarrow: false,
      font: { size: 10, color: DARK.orange }, xanchor: 'center',
    }],
  }

  const pTraces = [
    { x: rVals, y: pVals, type: 'scatter', mode: 'lines', name: `P(r) [${n}${L_LABELS[l]}]`,
      line: { color: DARK.blue, width: 2 } },
  ]

  const rwfTraces = [
    { x: rVals, y: rwfVals, type: 'scatter', mode: 'lines', name: `R_${n}${l}(r)`,
      line: { color: DARK.cyan, width: 2 } },
    { x: [0, rmax], y: [0, 0], type: 'scatter', mode: 'lines', showlegend: false,
      line: { color: '#333', width: 1 } },
  ]

  const rwfLayout = {
    ...darkLayout(),
    xaxis: axis('r (a₀)'),
    yaxis: axis(`R_${n}${l}(r)`),
  }

  // 2D orbital heatmap in xz-plane
  const { orbZ, orbX, orbDensity } = useMemo(() => {
    const half = rmax * 0.9
    const xs = Array.from({ length: N_ORBITAL }, (_, i) => -half + (2 * half) * i / (N_ORBITAL - 1))
    const zs = Array.from({ length: N_ORBITAL }, (_, i) => -half + (2 * half) * i / (N_ORBITAL - 1))
    const density: number[][] = zs.map(z =>
      xs.map(x => orbitalDensity2D(n, l, m, x, z, Z))
    )
    return { orbZ: zs, orbX: xs, orbDensity: density }
  }, [n, l, m, Z, rmax])

  const orbTraces = [
    { x: orbX, y: orbZ, z: orbDensity, type: 'heatmap',
      colorscale: 'Viridis', showscale: false,
      hovertemplate: 'x: %{x:.1f}<br>z: %{y:.1f}<br>|ψ|²: %{z:.4f}<extra></extra>' },
  ]

  const orbLayout = {
    ...darkLayout({ height: 340, margin: { l: 55, r: 20, t: 30, b: 50 }, showlegend: false }),
    xaxis: axis('x (a₀)', { scaleanchor: 'y', scaleratio: 1 }),
    yaxis: axis('z (a₀)'),
    title: { text: `${n}${L_LABELS[l]}, m=${m} orbital  (xz cross-section)`,
      font: { size: 12, color: '#bbb' }, x: 0.5 },
  }

  // Grotrian diagram (SVG-based)
  const grotrianEl = useMemo(() => buildGrotrian(n, l, Z, grotHover, setGrotHover), [n, l, Z, grotHover])

  return (
    <>
      {helpTopic && (
        <HelpModal title={helpTitle(helpTopic)} onClose={() => setHelpTopic(null)}>
          <HydrogenInfoPanel topic={helpTopic} />
        </HelpModal>
      )}

      <div style={{ maxWidth: 800 }}>
        {/* Controls */}
        <div style={controlsRow}>
          <div>
            <label style={labelStyle}>n (principal)</label>
            <select value={n} onChange={e => {
              const nn = +e.target.value
              const ll = Math.min(l, nn - 1)
              const mm = Math.max(-ll, Math.min(ll, m))
              setN(nn); setL(ll); setM(mm)
            }} style={selectStyle}>
              {[1,2,3,4,5].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>l (angular)</label>
            <select value={l} onChange={e => {
              const ll = +e.target.value
              const mm = Math.max(-ll, Math.min(ll, m))
              setL(ll); setM(mm)
            }} style={selectStyle}>
              {Array.from({ length: n }, (_, i) => (
                <option key={i} value={i}>{i} ({L_LABELS[i]})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>m (magnetic)</label>
            <select value={m} onChange={e => setM(+e.target.value)} style={selectStyle}>
              {Array.from({ length: 2*l+1 }, (_, i) => i - l).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1.5 }}>
            <ParameterSlider label="Z (nuclear charge)" value={Z} min={1} max={10} step={1}
              unit="" onChange={setZ} />
          </div>
        </div>

        {/* Readout */}
        <div style={readoutStyle}>
          <span>State: <strong>{n}{L_LABELS[l]}</strong>, m = {m}</span>
          <span style={{ color: DARK.blue }}>E<sub>n</sub> = <strong>{En.toFixed(5)}</strong> Eh</span>
          <span style={{ color: DARK.cyan }}>E<sub>n</sub> = <strong>{(En * 27.2114).toFixed(3)}</strong> eV</span>
          <span style={{ color: DARK.orange }}>⟨r⟩ = <strong>{rMean.toFixed(3)}</strong> a₀</span>
          <span style={{ color: '#aaa' }}>Radial nodes: <strong>{rNodes}</strong></span>
          <span style={{ color: '#aaa' }}>Angular nodes: <strong>{l}</strong></span>
        </div>

        {/* Radial density */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <span style={sectionTitleStyle}>Radial probability density P(r)</span>
            <HelpButton onClick={() => setHelpTopic('radialDensity')} />
          </div>
          {showRadial && (
            <Plot data={pTraces as never} layout={radialLayout as never}
              config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
          )}
        </div>

        {/* Radial wavefunction (collapsible) */}
        <div style={sectionStyle}>
          <button onClick={() => setShowRwf(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showRwf ? '▾' : '▸'}</span>
            <span style={sectionTitleStyle}>Radial wavefunction R<sub>nl</sub>(r)</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('radialWavefunction')} />
            </span>
          </button>
          {showRwf && (
            <Plot data={rwfTraces as never} layout={rwfLayout as never}
              config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
          )}
        </div>

        {/* 2D orbital heatmap (collapsible) */}
        <div style={sectionStyle}>
          <button onClick={() => setShowOrbital(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showOrbital ? '▾' : '▸'}</span>
            <span style={sectionTitleStyle}>Orbital cross-section |ψ(x,z)|²</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('orbital2D')} />
            </span>
          </button>
          {showOrbital && (
            <Plot data={orbTraces as never} layout={orbLayout as never}
              config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
          )}
        </div>

        {/* Grotrian diagram (collapsible) */}
        <div style={{ ...sectionStyle, borderBottom: 'none' }}>
          <button onClick={() => setShowGrotrian(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showGrotrian ? '▾' : '▸'}</span>
            <span style={sectionTitleStyle}>Energy level diagram (Grotrian)</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('grotrian')} />
            </span>
          </button>
          {showGrotrian && (
            <div style={{ position: 'relative' }}>
              {grotHover && (
                <div style={tooltipStyle}>{grotHover}</div>
              )}
              {grotrianEl}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ─── Grotrian SVG ─────────────────────────────────────────────────────────────

const GROT_W = 780
const GROT_H = 380
const GROT_PAD_L = 60
const GROT_PAD_R = 20
const GROT_PAD_T = 30
const GROT_PAD_B = 40

function buildGrotrian(
  selN: number, selL: number, Z: number,
  _hover: string | null,
  setHover: (s: string | null) => void
): React.ReactElement {
  const N_MAX = 5
  // Energy range
  const eMin = hydrogenEnergy(N_MAX, Z)
  const eMax = 0  // ionisation limit

  function yFromE(e: number) {
    // map [eMin, eMax] → [GROT_PAD_T, GROT_H - GROT_PAD_B]
    const frac = (e - eMin) / (eMax - eMin)
    return GROT_H - GROT_PAD_B - frac * (GROT_H - GROT_PAD_T - GROT_PAD_B)
  }

  const nCols = 5  // l = 0..4
  const colW = (GROT_W - GROT_PAD_L - GROT_PAD_R) / nCols

  function xFromL(l: number) {
    return GROT_PAD_L + (l + 0.5) * colW
  }

  // Build level lines and labels
  const levelLines: React.ReactElement[] = []
  const levelLabels: React.ReactElement[] = []
  for (let ni = 1; ni <= N_MAX; ni++) {
    for (let li = 0; li < ni && li < nCols; li++) {
      const e = hydrogenEnergy(ni, Z)
      const y = yFromE(e)
      const x = xFromL(li)
      const isSelected = ni === selN && li === selL
      levelLines.push(
        <line key={`l${ni}${li}`}
          x1={x - colW * 0.35} x2={x + colW * 0.35} y1={y} y2={y}
          stroke={isSelected ? '#fff' : '#555'} strokeWidth={isSelected ? 2.5 : 1.2} />
      )
      if (li === 0) {
        levelLabels.push(
          <text key={`e${ni}`} x={6} y={y + 4} fill="#666" fontSize={10}>{
            (e * 27.2114).toFixed(1)
          } eV</text>
        )
      }
      levelLabels.push(
        <text key={`n${ni}${li}`} x={x} y={y - 5} fill={isSelected ? '#fff' : '#666'}
          fontSize={9} textAnchor="middle">{ni}{L_LABELS[li]}</text>
      )
    }
  }

  // Transition arrows: Δl = ±1
  const arrows: React.ReactElement[] = []
  for (let ni = 2; ni <= N_MAX; ni++) {
    for (let nf = 1; nf < ni; nf++) {
      for (let li = 0; li < ni && li < nCols; li++) {
        const lf = li - 1
        if (lf < 0 || lf >= nCols) continue
        const yi = yFromE(hydrogenEnergy(ni, Z))
        const yf = yFromE(hydrogenEnergy(nf, Z))
        const xi = xFromL(li)
        const xf = xFromL(lf)
        const color = seriesColor(nf)
        const lam = wavelengthNm(ni, nf, Z)
        const deltaE = Math.abs(hydrogenEnergy(ni, Z) - hydrogenEnergy(nf, Z))
        const label = `${ni}${L_LABELS[li]} → ${nf}${L_LABELS[lf]}: ΔE=${deltaE.toFixed(4)} Eh, λ≈${lam.toFixed(0)} nm`
        arrows.push(
          <line key={`a${ni}${nf}${li}`}
            x1={xi} y1={yi} x2={xf} y2={yf}
            stroke={color} strokeWidth={1.2} opacity={0.7}
            markerEnd="url(#arrowhead)"
            style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHover(label)}
            onMouseLeave={() => setHover(null)}
          />
        )
      }
    }
  }

  // Column headers
  const headers = Array.from({ length: nCols }, (_, li) => (
    <text key={`h${li}`} x={xFromL(li)} y={GROT_H - 8}
      fill="#888" fontSize={11} textAnchor="middle">{L_LABELS[li]}</text>
  ))

  // Ionisation limit line
  const yIon = yFromE(0)
  const ionLine = (
    <line x1={GROT_PAD_L} x2={GROT_W - GROT_PAD_R} y1={yIon} y2={yIon}
      stroke="#333" strokeWidth={1} strokeDasharray="4,4" />
  )
  const ionLabel = (
    <text x={GROT_W - GROT_PAD_R - 2} y={yIon - 4} fill="#444" fontSize={9} textAnchor="end">ionisation</text>
  )

  return (
    <svg width="100%" viewBox={`0 0 ${GROT_W} ${GROT_H}`}
      style={{ background: '#0d0d0d', borderRadius: 4, display: 'block' }}>
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
        </marker>
      </defs>
      {ionLine}
      {ionLabel}
      {arrows}
      {levelLines}
      {levelLabels}
      {headers}
    </svg>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const helpTitle = (t: HydrogenInfoTopic): string => {
  if (t === 'radialDensity') return 'Radial Probability Density'
  if (t === 'radialWavefunction') return 'Radial Wavefunction R_nl(r)'
  if (t === 'orbital2D') return '2D Orbital Cross-Section'
  return 'Energy Level Diagram (Grotrian)'
}

const controlsRow: React.CSSProperties = {
  display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end',
  marginBottom: '1rem',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.78rem', color: '#aaa', marginBottom: '0.25rem',
}

const selectStyle: React.CSSProperties = {
  background: '#1a1a1a', border: '1px solid #333', color: '#e0e0e0',
  padding: '0.3rem 0.5rem', borderRadius: 4, fontSize: '0.85rem', cursor: 'pointer',
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

const sectionTitleStyle: React.CSSProperties = {
  fontWeight: 600, fontSize: '0.9rem', flex: 1,
}

const collapseStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 0, width: '100%',
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#e0e0e0', padding: '0.25rem 0', marginBottom: '0.5rem', textAlign: 'left',
}

const tooltipStyle: React.CSSProperties = {
  position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
  background: 'rgba(20,20,20,0.95)', border: '1px solid #333',
  color: '#e0e0e0', fontSize: '0.78rem', padding: '0.3rem 0.6rem',
  borderRadius: 4, zIndex: 10, pointerEvents: 'none', whiteSpace: 'nowrap',
}
