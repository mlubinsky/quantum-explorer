import { useState, useMemo, useEffect } from 'react'
import _Plot from 'react-plotly.js'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import { InlineMath } from './KatexMath'
import {
  hydrogenEnergy, meanRadius, radialNodes,
  radialWavefunction, radialDensity, orbitalDensity2D,
  angularShape, orbitalDensity3D, rMax as calcRMax,
} from '../physics/hydrogen'
import { HydrogenInfoPanel } from './HydrogenInfoPanel'
import type { HydrogenInfoTopic } from './HydrogenInfoPanel'

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  blue: '#4361ee', cyan: '#00b4d8', orange: '#f77f00', green: '#06d6a0',
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

const N_RADIAL  = 600
const N_ORBITAL = 130
const L_LABELS  = ['s', 'p', 'd', 'f', 'g']
const SERIES_NAME: Record<number, string> = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen', 4: 'Brackett' }

// hc in nm·Hartree: λ_nm = HC_NM / ΔE_hartree
const HC_NM = 45.5640

// ─── Grotrian helpers ──────────────────────────────────────────────────────

function wavelengthNmGrot(Z: number, nHi: number, nLo: number): number {
  const dE = (Z * Z / 2) * (1 / (nLo * nLo) - 1 / (nHi * nHi))
  return HC_NM / dE
}

function wavelengthToColor(nm: number): string {
  if (nm < 380) return '#9400d3'
  if (nm < 450) return '#8b00ff'
  if (nm < 495) return '#0000ff'
  if (nm < 530) return '#00cc00'
  if (nm < 590) return '#cccc00'
  if (nm < 620) return '#ff7700'
  if (nm < 700) return '#ff0000'
  return '#8b0000'
}

function colorKey(nm: number): string {
  return wavelengthToColor(nm).replace('#', '')
}

const ARROW_COLORS = ['9400d3', '8b00ff', '0000ff', '00cc00', 'cccc00', 'ff7700', 'ff0000', '8b0000']

// ─── Grotrian diagram component ────────────────────────────────────────────

interface GrotTooltip { lines: string[]; cx: number; cy: number; swatch?: { color: string; label: string } }

function GrotrianDiagram({
  selN, selL, Z,
  onSelect,
}: {
  selN: number; selL: number; Z: number;
  onSelect: (n: number, l: number) => void
}) {
  const N_MAX = 5
  const SVG_W = 760, SVG_H = 400
  const PAD_L = 54, PAD_R = 48, PAD_T = 28, PAD_B = 36
  const plotW = SVG_W - PAD_L - PAD_R
  const plotH = SVG_H - PAD_T - PAD_B

  const [focusN, setFocusN] = useState<number | null>(selN)
  const [focusL, setFocusL] = useState<number | null>(selL)
  const [focusSeries, setFocusSeries] = useState<number | null>(null)
  const [showForbidden, setShowForbidden] = useState(false)
  const [showLambda, setShowLambda] = useState(false)
  const [tooltip, setTooltip] = useState<GrotTooltip | null>(null)

  useEffect(() => {
    setFocusN(selN)
    setFocusL(selL)
    setFocusSeries(null)
  }, [selN, selL])

  const energy = (nv: number) => -(Z * Z) / (2 * nv * nv)
  const eMin = energy(N_MAX)
  const yFromE = (e: number) => PAD_T + plotH * (1 - (e - eMin) / (0 - eMin))
  const colX = (lv: number) => PAD_L + ((lv + 0.5) / N_MAX) * plotW
  const colHalfW = (plotW / N_MAX) * 0.35

  const hasFocus = focusN !== null && focusL !== null

  function isReachable(nv: number, lv: number): boolean {
    if (!hasFocus) return false
    return Math.abs(lv - focusL!) === 1 && nv < focusN!
  }

  function levelOpacity(nv: number, lv: number): number {
    if (focusSeries !== null) return 1
    if (!hasFocus) return 1
    if (nv === focusN && lv === focusL) return 1
    return isReachable(nv, lv) ? 1 : 0.18
  }

  function arrowOpacity(nUp: number, lUp: number, nLo: number, lLo: number): number {
    if (focusSeries !== null) return nLo === focusSeries ? 0.9 : 0.08
    if (!hasFocus) return 0.65
    const valid = nUp === focusN && lUp === focusL && Math.abs(lLo - focusL!) === 1
    return valid ? 0.9 : 0.1
  }

  function forbiddenOpacity(nUp: number, lUp: number): number {
    if (focusSeries !== null) return 0.12
    if (!hasFocus) return 0.3
    return nUp === focusN && lUp === focusL ? 0.5 : 0.06
  }

  const allowedTrans = useMemo(() => {
    const r: { nUp: number; nLo: number; lUp: number; lLo: number; nm: number }[] = []
    for (let nUp = 2; nUp <= N_MAX; nUp++)
      for (let nLo = 1; nLo < nUp; nLo++)
        for (let lUp = 0; lUp < nUp && lUp < N_MAX; lUp++)
          for (let lLo = 0; lLo < nLo && lLo < N_MAX; lLo++)
            if (Math.abs(lUp - lLo) === 1)
              r.push({ nUp, nLo, lUp, lLo, nm: wavelengthNmGrot(Z, nUp, nLo) })
    return r
  }, [Z])

  const forbiddenTrans = useMemo(() => {
    const r: { nUp: number; nLo: number; lUp: number; lLo: number }[] = []
    for (let nUp = 2; nUp <= N_MAX; nUp++)
      for (let nLo = 1; nLo < nUp; nLo++)
        for (let lUp = 0; lUp < nUp && lUp < N_MAX; lUp++)
          for (let lLo = 0; lLo < nLo && lLo < N_MAX; lLo++)
            if (Math.abs(lUp - lLo) !== 1)
              r.push({ nUp, nLo, lUp, lLo })
    return r
  }, [])

  function showTip(lines: string[], e: React.MouseEvent, swatch?: GrotTooltip['swatch']) {
    setTooltip({ lines, cx: e.clientX, cy: e.clientY, swatch })
  }
  function moveTip(e: React.MouseEvent) {
    setTooltip(t => t ? { ...t, cx: e.clientX, cy: e.clientY } : null)
  }

  return (
    <div>
      {/* Floating tooltip */}
      {tooltip && (
        <div style={{
          position: 'fixed', left: tooltip.cx + 14, top: tooltip.cy - 14,
          background: '#1a1a2e', border: '1px solid #555', borderRadius: 5,
          padding: '5px 10px', fontSize: '0.76rem', color: '#ddd',
          pointerEvents: 'none', zIndex: 9999, lineHeight: 1.7,
          boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        }}>
          {tooltip.lines.map((ln, i) => (
            <div key={i} style={i === 0 ? { fontWeight: 600 } : {}}>{ln}</div>
          ))}
          {tooltip.swatch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <div style={{
                width: 40, height: 10, borderRadius: 2, border: '1px solid #666', flexShrink: 0,
                background: tooltip.swatch.label.includes('UV') || tooltip.swatch.label.includes('IR')
                  ? 'repeating-linear-gradient(45deg,#444 0,#444 3px,#333 3px,#333 6px)'
                  : tooltip.swatch.color,
              }} />
              <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>{tooltip.swatch.label}</span>
            </div>
          )}
        </div>
      )}

      {/* Series filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: '#888' }}>Series:</span>
        {[1, 2, 3, 4].map(nLo => {
          const active = focusSeries === nLo
          return (
            <button key={nLo} onClick={() => {
              setFocusSeries(active ? null : nLo)
              if (!active) { setFocusN(null); setFocusL(null) }
            }} style={{
              fontSize: '0.74rem', padding: '2px 8px', borderRadius: 10,
              border: `1px solid ${active ? '#4361ee' : '#555'}`,
              background: active ? 'rgba(67,97,238,0.2)' : 'none',
              color: active ? '#7b9ef0' : '#bbb', cursor: 'pointer',
            }}>{SERIES_NAME[nLo]} (→n={nLo})</button>
          )
        })}
      </div>

      {/* Controls row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 4, fontSize: '0.8rem', color: '#bbb', flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input type="checkbox" checked={showForbidden}
            onChange={e => setShowForbidden(e.target.checked)} />
          Show forbidden (Δℓ ≠ ±1)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
          <input type="checkbox" checked={showLambda}
            onChange={e => setShowLambda(e.target.checked)} />
          λ labels
        </label>
        {hasFocus && !focusSeries && (
          <span style={{ fontSize: '0.76rem', color: '#06d6a0', marginLeft: 8 }}>
            {focusN === 2 && focusL === 0
              ? '2s — metastable (Δℓ = 0 forbidden, two-photon lifetime ≈ 0.12 s)'
              : `${focusN}${L_LABELS[focusL!]} — click same level to clear focus`}
          </span>
        )}
      </div>

      {/* SVG */}
      <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        style={{ display: 'block', background: '#0d0d0d', borderRadius: 4 }}>
        <defs>
          {ARROW_COLORS.map(c => (
            <marker key={c} id={`arr-${c}`} markerWidth={7} markerHeight={7} refX={7} refY={3.5} orient="auto">
              <path d="M0,0 L0,7 L7,3.5 Z" fill={`#${c}`} />
            </marker>
          ))}
        </defs>

        {/* Y-axis */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + plotH} stroke="#444" strokeWidth={1} />
        <text x={14} y={PAD_T + plotH / 2}
          transform={`rotate(-90,14,${PAD_T + plotH / 2})`}
          textAnchor="middle" fontSize={10} fill="#777">Energy (Eh)</text>

        {/* Ionisation limit */}
        <line x1={PAD_L} x2={SVG_W - PAD_R} y1={PAD_T} y2={PAD_T}
          stroke="#2a2a2a" strokeWidth={1} strokeDasharray="4,4" />
        <text x={SVG_W - PAD_R - 2} y={PAD_T - 5} fill="#444" fontSize={9} textAnchor="end">0 — ionised</text>

        {/* Energy ticks */}
        {Array.from({ length: N_MAX }, (_, i) => i + 1).map(nv => {
          const y = yFromE(energy(nv))
          return (
            <g key={nv}>
              <line x1={PAD_L - 5} x2={PAD_L} y1={y} y2={y} stroke="#444" strokeWidth={0.8} />
              <text x={PAD_L - 7} y={y + 4} textAnchor="end" fontSize={9} fill="#666">
                {energy(nv).toFixed(3)}
              </text>
            </g>
          )
        })}

        {/* X-axis column headers */}
        {L_LABELS.map((lab, lv) => (
          <text key={lab} x={colX(lv)} y={PAD_T + plotH + 20}
            textAnchor="middle" fontSize={11} fill="#888">{lab}</text>
        ))}
        <text x={PAD_L + plotW / 2} y={SVG_H - 3}
          textAnchor="middle" fontSize={10} fill="#555">Angular momentum ℓ</text>

        {/* n= labels on right */}
        {Array.from({ length: N_MAX }, (_, i) => i + 1).map(nv => (
          <text key={nv} x={SVG_W - PAD_R + 4} y={yFromE(energy(nv)) + 4}
            fontSize={9} fill="#666">n={nv}</text>
        ))}

        {/* Forbidden transitions */}
        {showForbidden && forbiddenTrans.map(({ nUp, nLo, lUp, lLo }, i) => {
          const x1 = colX(lUp), x2 = colX(lLo)
          const y1 = yFromE(energy(nUp)), y2 = yFromE(energy(nLo))
          const op = forbiddenOpacity(nUp, lUp)
          return (
            <g key={`f${i}`} opacity={op} style={{ transition: 'opacity 0.15s' }}
              onMouseEnter={e => showTip([
                `${nUp}${L_LABELS[lUp]} → ${nLo}${L_LABELS[lLo]}`,
                `Forbidden: |Δℓ| = ${Math.abs(lUp - lLo)} (photon carries 1ℏ)`,
              ], e)}
              onMouseMove={moveTip}
              onMouseLeave={() => setTooltip(null)}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={10} />
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#555" strokeWidth={0.8} strokeDasharray="3,4" />
            </g>
          )
        })}

        {/* Allowed transitions */}
        {allowedTrans.map(({ nUp, nLo, lUp, lLo, nm }, i) => {
          const x1 = colX(lUp), x2 = colX(lLo)
          const y1 = yFromE(energy(nUp)), y2 = yFromE(energy(nLo))
          const ck = colorKey(nm)
          const stroke = `#${ck}`
          const isDash = nm < 380 || nm > 700
          const dE_eV = Math.abs(energy(nUp) - energy(nLo)) * 27.2114
          const series = SERIES_NAME[nLo] ?? `n=${nLo}`
          const midX = (x1 + x2) / 2, midY = (y1 + y2) / 2
          const op = arrowOpacity(nUp, lUp, nLo, lLo)
          const swatchLabel = nm < 380 ? 'UV — not visible' : nm > 700 ? 'IR — not visible' : 'visible light'
          return (
            <g key={i} opacity={op} style={{ transition: 'opacity 0.15s' }}
              onMouseEnter={e => showTip([
                `${nUp}${L_LABELS[lUp]} → ${nLo}${L_LABELS[lLo]}`,
                `Δℓ = ${lLo - lUp}  ·  ${series} series`,
                `λ = ${Math.round(nm)} nm  ·  ΔE = ${dE_eV.toFixed(3)} eV`,
              ], e, { color: stroke, label: swatchLabel })}
              onMouseMove={moveTip}
              onMouseLeave={() => setTooltip(null)}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={10} />
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={stroke} strokeWidth={1.3}
                strokeDasharray={isDash ? '4,3' : undefined}
                markerEnd={`url(#arr-${ck})`} />
              {showLambda && (
                <text x={midX + 4} y={midY} fontSize={7} fill={stroke}>{Math.round(nm)}</text>
              )}
            </g>
          )
        })}

        {/* Energy levels */}
        {Array.from({ length: N_MAX }, (_, ni) => ni + 1).flatMap(nv =>
          Array.from({ length: nv }, (_, lv) => {
            const y = yFromE(energy(nv))
            const x = colX(lv)
            const isSel = nv === selN && lv === selL
            const reach = hasFocus && isReachable(nv, lv)
            const isMetastable = nv === 2 && lv === 0
            const stroke = isSel ? '#4a9eff' : reach ? '#06d6a0' : '#888'
            const sw = isSel ? 2.5 : reach ? 2.2 : 1.5
            const eLabel = `n=${nv}, ℓ=${lv} (${nv}${L_LABELS[lv]})   E=${energy(nv).toFixed(4)} Eh = ${(energy(nv)*27.2114).toFixed(2)} eV`
            return (
              <g key={`${nv}-${lv}`} opacity={levelOpacity(nv, lv)}
                style={{ cursor: 'pointer', transition: 'opacity 0.15s' }}
                onClick={() => {
                  if (nv === focusN && lv === focusL) {
                    setFocusN(null); setFocusL(null)
                  } else {
                    setFocusN(nv); setFocusL(lv); setFocusSeries(null)
                    onSelect(nv, lv)
                  }
                }}
                onMouseEnter={e => showTip([eLabel], e)}
                onMouseMove={moveTip}
                onMouseLeave={() => setTooltip(null)}>
                <rect x={x - colHalfW - 4} y={y - 7} width={colHalfW * 2 + 8} height={14}
                  fill="transparent" />
                <line x1={x - colHalfW} x2={x + colHalfW} y1={y} y2={y}
                  stroke={stroke} strokeWidth={sw} />
                {isMetastable && (
                  <circle cx={x + colHalfW + 8} cy={y} r={3.5} fill="#ff9f40"
                    onMouseEnter={e => { e.stopPropagation(); showTip([
                      '2s — metastable',
                      'E1 decay to 1s forbidden (Δℓ = 0)',
                      'Two-photon lifetime ≈ 0.12 s',
                    ], e) }}
                    onMouseMove={e => { e.stopPropagation(); moveTip(e) }}
                    onMouseLeave={e => { e.stopPropagation(); setTooltip(null) }}
                  />
                )}
              </g>
            )
          })
        )}
      </svg>

      {/* Legend */}
      <div style={{ marginTop: 8, fontSize: '0.76rem', color: '#aaa' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 5 }}>
          <span style={{ color: '#666', fontStyle: 'italic' }}>Levels:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke="#4a9eff" strokeWidth="2.5"/></svg>
            current orbital
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke="#06d6a0" strokeWidth="2.2"/></svg>
            reachable (Δℓ = ±1)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: 0.45 }}>
            <svg width="18" height="8"><line x1="0" y1="4" x2="18" y2="4" stroke="#888" strokeWidth="1.5"/></svg>
            dimmed
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="8"><circle cx="6" cy="4" r="3.5" fill="#ff9f40"/></svg>
            metastable (2s)
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <span style={{ color: '#666', fontStyle: 'italic', flexShrink: 0 }}>Arrows:</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="22" height="8" style={{ flexShrink: 0 }}>
                <line x1="0" y1="4" x2="16" y2="4" stroke="#ff0000" strokeWidth="1.5"/>
                <path d="M13,1 L13,7 L22,4 Z" fill="#ff0000"/>
              </svg>
              solid colored = E1 allowed, visible light (380–700 nm) · e.g. H-α 656 nm (Balmer 3→2)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="22" height="8" style={{ flexShrink: 0 }}>
                <line x1="0" y1="4" x2="22" y2="4" stroke="#9400d3" strokeWidth="1.2" strokeDasharray="4,3"/>
              </svg>
              <span style={{ color: '#9400d3' }}>colored dashed = UV</span>
              &nbsp;· Lyman series — all transitions to n=1 land in UV
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="22" height="8" style={{ flexShrink: 0 }}>
                <line x1="0" y1="4" x2="22" y2="4" stroke="#8b0000" strokeWidth="1.2" strokeDasharray="4,3"/>
              </svg>
              <span style={{ color: '#8b0000' }}>colored dashed = IR</span>
              &nbsp;· Paschen/Brackett series
            </span>
            {showForbidden && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, opacity: 0.55 }}>
                <svg width="22" height="8" style={{ flexShrink: 0 }}>
                  <line x1="0" y1="4" x2="22" y2="4" stroke="#555" strokeWidth="0.8" strokeDasharray="3,4"/>
                </svg>
                gray dashed = E1 forbidden (Δℓ ≠ ±1)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 3D Isosurface (only mounted when visible) ─────────────────────────────

function OrbitalIsosurface3D({ n, l, m, Z }: { n: number; l: number; m: number; Z: number }) {
  const { ix, iy, iz, ivals } = useMemo(() => {
    const N = Math.min(32, 24 + n * 2)
    const half = calcRMax(n, Z) * 0.72
    const coords = Array.from({ length: N }, (_, i) => -half + 2 * half * i / (N - 1))
    const ix: number[] = [], iy: number[] = [], iz: number[] = [], ivals: number[] = []
    for (const xi of coords) for (const yi of coords) for (const zi of coords) {
      ix.push(xi); iy.push(yi); iz.push(zi)
      ivals.push(orbitalDensity3D(n, l, m, xi, yi, zi, Z))
    }
    return { ix, iy, iz, ivals }
  }, [n, l, m, Z])

  const maxVal = Math.max(...ivals)
  if (maxVal < 1e-30) return <p style={{ color: '#555', fontSize: '0.85rem' }}>No density to display.</p>

  const trace = {
    type: 'isosurface' as const,
    x: ix, y: iy, z: iz, value: ivals,
    isomin: maxVal * 0.1,
    isomax: maxVal,
    surface: { count: 2 },
    colorscale: 'Viridis',
    opacity: 0.65,
    showscale: false,
    caps: { x: { show: false }, y: { show: false }, z: { show: false } },
    hovertemplate: 'x:%{x:.1f}<br>y:%{y:.1f}<br>z:%{z:.1f}<extra></extra>',
  }

  const layout = {
    paper_bgcolor: '#0d0d0d',
    margin: { t: 36, b: 0, l: 0, r: 0 },
    height: 420,
    title: {
      text: `|ψ<sub>${n}${L_LABELS[l]}</sub>|² isosurface — 10% of peak`,
      font: { color: '#ccc', size: 12 },
    },
    scene: {
      bgcolor: '#111111',
      xaxis: { title: { text: 'x (a₀)' }, color: '#888', gridcolor: '#1e1e1e', zerolinecolor: '#2a2a2a' },
      yaxis: { title: { text: 'y (a₀)' }, color: '#888', gridcolor: '#1e1e1e', zerolinecolor: '#2a2a2a' },
      zaxis: { title: { text: 'z (a₀)' }, color: '#888', gridcolor: '#1e1e1e', zerolinecolor: '#2a2a2a' },
      aspectmode: 'cube',
    },
  }

  return (
    <Plot data={[trace as never]} layout={layout as never}
      config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
  )
}

// ─── Main component ────────────────────────────────────────────────────────

export function HydrogenExplorer() {
  const [n, setN] = useState(1)
  const [l, setL] = useState(0)
  const [m, setM] = useState(0)
  const [Z, setZ] = useState(1)

  const [showRwf,      setShowRwf]      = useState(false)
  const [showOrbital,  setShowOrbital]  = useState(true)
  const [showIso,      setShowIso]      = useState(false)
  const [showGrotrian, setShowGrotrian] = useState(true)

  const [helpTopic, setHelpTopic] = useState<HydrogenInfoTopic | null>(null)

  const En   = hydrogenEnergy(n, Z)
  const rMean = meanRadius(n, l, Z)
  const rNodes = radialNodes(n, l)
  const rmax = calcRMax(n, Z)

  // Radial density & wavefunction
  const { rVals, pVals, rwfVals } = useMemo(() => {
    const rVals   = Array.from({ length: N_RADIAL }, (_, i) => i / (N_RADIAL - 1) * rmax)
    const pVals   = rVals.map(r => radialDensity(n, l, r, Z))
    const rwfVals = rVals.map(r => radialWavefunction(n, l, r, Z))
    return { rVals, pVals, rwfVals }
  }, [n, l, Z, rmax])

  const radialLayout = {
    ...darkLayout({ height: 260, margin: { l: 60, r: 20, t: 30, b: 50 } }),
    xaxis: axis('r (a₀)'),
    yaxis: axis('P(r) = r² |R|²', { rangemode: 'tozero' }),
    shapes: [{ type: 'line', x0: rMean, x1: rMean, y0: 0, y1: 1, yref: 'paper',
      line: { color: DARK.orange, width: 1.5, dash: 'dash' } }],
    annotations: [{ x: rMean, y: 1.03, yref: 'paper', text: '⟨r⟩',
      showarrow: false, font: { size: 10, color: DARK.orange }, xanchor: 'center' }],
  }

  // 2D orbital density heatmap
  const { orbX, orbZ, orbDensity } = useMemo(() => {
    const half = rmax * 0.88
    const xs = Array.from({ length: N_ORBITAL }, (_, i) => -half + 2 * half * i / (N_ORBITAL - 1))
    const zs = Array.from({ length: N_ORBITAL }, (_, i) => -half + 2 * half * i / (N_ORBITAL - 1))
    // Trim to displayable range based on max density
    const raw = zs.map(z => xs.map(x => orbitalDensity2D(n, l, m, x, z, Z)))
    const peak = Math.max(...raw.map(row => Math.max(...row)), 1e-30)
    const density = raw.map(row => row.map(v => v / peak))
    return { orbX: xs, orbZ: zs, orbDensity: density }
  }, [n, l, m, Z, rmax])

  // Angular shape (polar plot)
  const { angX, angZ } = useMemo(() => {
    const { x, z } = angularShape(l, m)
    return { angX: x, angZ: z }
  }, [l, m])

  const orbAndAngCollapsed = !showOrbital

  return (
    <>
      {helpTopic && (
        <HelpModal title={helpTitle(helpTopic)} onClose={() => setHelpTopic(null)}>
          <HydrogenInfoPanel topic={helpTopic} />
        </HelpModal>
      )}

      <div style={{ maxWidth: 820 }}>
        {/* Controls */}
        <div style={controlsRow}>
          <div>
            <label style={labelStyle}>n</label>
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
            <label style={labelStyle}>ℓ</label>
            <select value={l} onChange={e => {
              const ll = +e.target.value
              setL(ll); setM(Math.max(-ll, Math.min(ll, m)))
            }} style={selectStyle}>
              {Array.from({ length: n }, (_, i) => (
                <option key={i} value={i}>{i} ({L_LABELS[i]})</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>m</label>
            <select value={m} onChange={e => setM(+e.target.value)} style={selectStyle}>
              {Array.from({ length: 2*l+1 }, (_, i) => i - l).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1.5, minWidth: 140 }}>
            <ParameterSlider label="Z (nuclear charge)" value={Z} min={1} max={10} step={1}
              unit="" onChange={setZ} />
          </div>
        </div>

        {/* Readout */}
        <div style={readoutStyle}>
          <span>State: <strong>{n}{L_LABELS[l]}</strong>, m = {m}</span>
          <span style={{ color: DARK.blue }}>E<sub>n</sub> = <strong>{En.toFixed(5)}</strong> Eh</span>
          <span style={{ color: DARK.cyan }}>= <strong>{(En * 27.2114).toFixed(3)}</strong> eV</span>
          <span style={{ color: DARK.orange }}>⟨r⟩ = <strong>{rMean.toFixed(3)}</strong> a₀</span>
          <span style={{ color: '#aaa' }}>n−l−1 = <strong>{rNodes}</strong> radial nodes</span>
        </div>

        {/* Potential formula */}
        <div style={formulaRowStyle}>
          <span style={{ color: '#666', marginRight: 12 }}>Schrödinger equation:</span>
          <InlineMath math="\hat{H}\psi = E\psi" />
          <span style={{ color: '#444', margin: '0 10px' }}>·</span>
          <InlineMath math="\hat{H} = -\tfrac{1}{2}\nabla^2 + V(r)" />
          <span style={{ color: '#444', margin: '0 10px' }}>·</span>
          <span style={{ color: DARK.orange }}>
            <InlineMath math="V(r) = -Z/r" />
          </span>
          <span style={{ color: '#555', marginLeft: 10, fontSize: '0.78rem' }}>Coulomb potential (a.u.)</span>
        </div>

        {/* Radial density */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <span style={sectionTitleStyle}>Radial probability density P(r)</span>
            <HelpButton onClick={() => setHelpTopic('radialDensity')} />
          </div>
          <Plot data={[
            { x: rVals, y: pVals, type: 'scatter', mode: 'lines', name: `P(r) [${n}${L_LABELS[l]}]`,
              line: { color: DARK.blue, width: 2 } },
          ] as never} layout={radialLayout as never}
            config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
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
            <Plot data={[
              { x: rVals, y: rwfVals, type: 'scatter', mode: 'lines', name: `R_${n}${l}(r)`,
                line: { color: DARK.cyan, width: 2 } },
              { x: [0, rmax], y: [0, 0], type: 'scatter', mode: 'lines', showlegend: false,
                line: { color: '#2a2a2a', width: 1 } },
            ] as never} layout={{
              ...darkLayout({ height: 220, margin: { l: 60, r: 20, t: 20, b: 45 } }),
              xaxis: axis('r (a₀)'), yaxis: axis(`R_${n}${l}(r)`),
            } as never}
              config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
          )}
        </div>

        {/* 2D orbital + angular shape (collapsible, side by side) */}
        <div style={sectionStyle}>
          <button onClick={() => setShowOrbital(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{!orbAndAngCollapsed ? '▾' : '▸'}</span>
            <span style={sectionTitleStyle}>
              Orbital cross-section |ψ(x,z)|²
              <span style={{ fontWeight: 400, color: '#777', marginLeft: 8, fontSize: '0.82rem' }}>
                + angular shape |Y|²
              </span>
            </span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('orbital2D')} />
            </span>
          </button>
          {!orbAndAngCollapsed && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              {/* 2D heatmap */}
              <div style={{ flex: '1 1 0', minWidth: 0 }}>
                <Plot data={[{
                  x: orbX, y: orbZ, z: orbDensity, type: 'heatmap',
                  colorscale: 'Viridis', zmin: 0, zmax: 1,
                  showscale: true,
                  colorbar: {
                    title: { text: '|ψ|²/max', font: { size: 10, color: '#aaa' } },
                    thickness: 12, tickfont: { size: 9, color: '#aaa' },
                    tickvals: [0, 0.5, 1], ticktext: ['0', '0.5', '1'],
                  },
                  hovertemplate: 'x:%{x:.1f}<br>z:%{y:.1f}<br>|ψ|²:%{z:.4f}<extra></extra>',
                }] as never} layout={{
                  paper_bgcolor: DARK.paper, plot_bgcolor: DARK.plot,
                  margin: { l: 50, r: 70, t: 30, b: 55 }, height: 320,
                  showlegend: false,
                  xaxis: { ...axis('x (a₀)'), scaleanchor: 'y', scaleratio: 1 },
                  yaxis: axis('z (a₀)'),
                  font: { color: DARK.text, size: 11 },
                  title: { text: 'Cross-section through nucleus (y = 0)',
                    font: { size: 10, color: '#666' }, x: 0.5, y: 0.02, xref: 'paper', yref: 'paper' },
                } as never}
                  config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
              </div>

              {/* Angular shape polar plot */}
              <div style={{ flex: '1 1 0', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                  paddingRight: 4, marginBottom: -24, position: 'relative', zIndex: 1 }}>
                  <HelpButton onClick={() => setHelpTopic('angularShape')} />
                </div>
                <Plot data={[{
                  x: angX, y: angZ, type: 'scatter', mode: 'lines',
                  fill: 'toself', fillcolor: 'rgba(67,97,238,0.15)',
                  line: { color: DARK.blue, width: 2 },
                  hoverinfo: 'skip',
                }] as never} layout={{
                  paper_bgcolor: DARK.paper, plot_bgcolor: DARK.plot,
                  margin: { l: 40, r: 20, t: 36, b: 55 }, height: 320,
                  showlegend: false,
                  font: { color: DARK.text, size: 11 },
                  xaxis: {
                    title: { text: 'x', font: { color: '#aaa', size: 11 } },
                    color: '#aaa', gridcolor: '#1a1a1a', zerolinecolor: '#333',
                    showgrid: false, scaleanchor: 'y', scaleratio: 1,
                  },
                  yaxis: {
                    title: { text: 'z', font: { color: '#aaa', size: 11 } },
                    color: '#aaa', gridcolor: '#1a1a1a', zerolinecolor: '#333',
                    showgrid: false,
                  },
                  title: {
                    text: `|Y<sub>${l}</sub><sup>${m}</sup>(θ)|² — angular shape`,
                    font: { size: 12, color: '#ccc' },
                  },
                  annotations: [{
                    text: 'Rotate around z-axis for 3D shape',
                    x: 0.5, y: -0.15, xref: 'paper', yref: 'paper',
                    showarrow: false, font: { size: 9, color: '#555' },
                  }],
                } as never}
                  config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
              </div>
            </div>
          )}
        </div>

        {/* 3D Isosurface (collapsible) */}
        <div style={sectionStyle}>
          <button onClick={() => setShowIso(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showIso ? '▾' : '▸'}</span>
            <span style={sectionTitleStyle}>3D orbital isosurface |ψ|²</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('isosurface')} />
            </span>
          </button>
          {showIso && <OrbitalIsosurface3D n={n} l={l} m={m} Z={Z} />}
        </div>

        {/* Grotrian (collapsible) */}
        <div style={{ ...sectionStyle, borderBottom: 'none' }}>
          <button onClick={() => setShowGrotrian(s => !s)} style={collapseStyle}>
            <span style={{ marginRight: 6 }}>{showGrotrian ? '▾' : '▸'}</span>
            <span style={sectionTitleStyle}>Energy level diagram (Grotrian)</span>
            <span onClick={e => e.stopPropagation()}>
              <HelpButton onClick={() => setHelpTopic('grotrian')} />
            </span>
          </button>
          {showGrotrian && (
            <GrotrianDiagram selN={n} selL={l} Z={Z} onSelect={(nn, ll) => {
              setN(nn); setL(ll); setM(0)
            }} />
          )}
        </div>
      </div>
    </>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function helpTitle(t: HydrogenInfoTopic): string {
  if (t === 'radialDensity')     return 'Radial Probability Density P(r)'
  if (t === 'radialWavefunction') return 'Radial Wavefunction R_nl(r)'
  if (t === 'orbital2D')          return 'Orbital Cross-Section |ψ(x,z)|²'
  if (t === 'angularShape')       return 'Angular Shape |Y_l^m(θ)|²'
  if (t === 'isosurface')         return '3D Orbital Isosurface |ψ|²'
  return 'Energy Level Diagram (Grotrian)'
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const controlsRow: React.CSSProperties = {
  display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: '0.75rem',
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
  borderRadius: '5px 5px 0 0', marginBottom: 0,
}
const formulaRowStyle: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center',
  background: '#0e0e0e', padding: '0.35rem 0.75rem',
  borderRadius: '0 0 5px 5px', marginBottom: '1rem',
  fontSize: '0.85rem', borderTop: '1px solid #1a1a1a',
}
const sectionStyle: React.CSSProperties = {
  marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #1e1e1e',
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
