import { useState, useMemo, useEffect } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import {
  hydrogenEnergy, meanRadius, radialNodes,
  radialWavefunction, radialDensity, orbitalDensity2D,
  angularShape, orbitalDensity3D, rMax as calcRMax,
  MU_B, zeemanSublevels, zeemanTriplet,
  landeG, jTerms, anomalousSublevels, anomalousZeemanLines,
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
  const eMin = energy(1)   // ground state — most negative, maps to BOTTOM
  const eMax = 0            // ionisation limit — maps to TOP
  const yFromE = (e: number) => PAD_T + plotH * (1 - (e - eMin) / (eMax - eMin))
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
        <div style={{ fontSize: '0.72rem', color: '#666', fontStyle: 'italic', marginBottom: 5 }}>
          Simplified nonrelativistic model: E depends only on n, so all same-n sublevels are
          degenerate (columns show allowed ℓ values, not distinct energies). E1 selection rule
          shown is Δℓ = ±1 only; Δm is not displayed.
        </div>
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
  const [showZeeman,          setShowZeeman]          = useState(true)
  const [showAnomalousZeeman, setShowAnomalousZeeman] = useState(true)

  const [B, setB] = useState(0)
  const [zeemanLoN, setZeemanLoN] = useState(1)
  const [zeemanLoL, setZeemanLoL] = useState(0)

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
              unit="" digits={0} onChange={setZ} />
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
                {m < 0 && (
                  <div style={{
                    fontSize: '0.74rem', color: '#f77f00', background: 'rgba(247,127,0,0.08)',
                    border: '1px solid rgba(247,127,0,0.25)', borderRadius: 4,
                    padding: '4px 8px', marginBottom: 4,
                  }}>
                    m = {m} (sin-type real orbital) has no density in the xz cross-section.
                    Its lobes lie in {Math.abs(m) === 1 ? 'the yz-plane' : 'planes rotated from xz'}.
                    Select m ≥ 0 to see lobes here.
                  </div>
                )}
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
                  title: { text: 'xz cross-section (y = 0) — color normalized to peak',
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
                    text: `∫|Y<sub>${l}</sub><sup>${m}</sup>|² dφ — φ-integrated θ-profile`,
                    font: { size: 12, color: '#ccc' },
                  },
                  annotations: [
                    {
                      text: 'Same shape for m and −m; φ-factor (cos vs sin) not shown.',
                      x: 0.5, y: -0.14, xref: 'paper', yref: 'paper',
                      showarrow: false, font: { size: 9, color: '#666' },
                    },
                    ...(m < 0 ? [{
                      text: `m < 0 (sin(${Math.abs(m)}φ) factor): xz-plane density is zero — lobes live in yz-plane`,
                      x: 0.5, y: -0.22, xref: 'paper', yref: 'paper',
                      showarrow: false, font: { size: 9, color: '#f4a261' },
                    }] : []),
                  ],
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
        <div style={sectionStyle}>
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

        {/* Normal Zeeman effect (collapsible) */}
        <ZeemanSection
          n={n} l={l} Z={Z} B={B} onBChange={setB}
          loN={zeemanLoN} loL={zeemanLoL}
          onLoChange={(nn, ll) => { setZeemanLoN(nn); setZeemanLoL(ll) }}
          show={showZeeman} onToggle={() => setShowZeeman(s => !s)}
          onHelpClick={() => setHelpTopic('zeeman')}
        />

        {/* Anomalous Zeeman effect (collapsible) */}
        <AnomalousZeemanSection
          n={n} l={l} Z={Z} B={B}
          loN={zeemanLoN} loL={zeemanLoL}
          show={showAnomalousZeeman} onToggle={() => setShowAnomalousZeeman(s => !s)}
          onHelpClick={() => setHelpTopic('anomalousZeeman')}
        />
      </div>
    </>
  )
}

// ─── Zeeman section component ─────────────────────────────────────────────────

const HC_NM_ZEEMAN = 45.5640  // hc in nm·Hartree: λ_nm = HC_NM / ΔE_hartree

const POL_COLOR: Record<string, string> = {
  'sigma+': '#ff7070',
  'pi':     '#e0e0e0',
  'sigma-': '#70b0ff',
}
const POL_LABEL: Record<string, string> = {
  'sigma+': 'σ+ (Δm=+1)',
  'pi':     'π  (Δm=0)',
  'sigma-': 'σ− (Δm=−1)',
}

function ZeemanSection({
  n, l, Z, B, onBChange,
  loN, loL, onLoChange,
  show, onToggle, onHelpClick,
}: {
  n: number; l: number; Z: number; B: number; onBChange: (v: number) => void
  loN: number; loL: number; onLoChange: (n: number, l: number) => void
  show: boolean; onToggle: () => void; onHelpClick: () => void
}) {
  // Valid lower levels reachable from (n, l) via E1: Δl = ±1, nLo < n, lLo ≥ 0, lLo < nLo
  const validLower = useMemo(() => {
    const pairs: { nLo: number; lLo: number; label: string }[] = []
    for (let nLo = 1; nLo < n; nLo++) {
      for (const lLo of [l - 1, l + 1]) {
        if (lLo >= 0 && lLo < nLo) {
          pairs.push({ nLo, lLo, label: `${nLo}${L_LABELS[lLo]} (n=${nLo}, ℓ=${lLo})` })
        }
      }
    }
    return pairs.sort((a, b) => a.nLo - b.nLo || a.lLo - b.lLo)
  }, [n, l])

  // Clamp loN/loL to a valid choice whenever (n, l) changes
  useEffect(() => {
    if (validLower.length === 0) return
    const stillValid = validLower.some(p => p.nLo === loN && p.lLo === loL)
    if (!stillValid) onLoChange(validLower[0].nLo, validLower[0].lLo)
  }, [n, l])  // eslint-disable-line react-hooks/exhaustive-deps

  const B_MAX = 0.3
  const N_B   = 120

  // Sublevel fan: E(m_l, B) vs B for selected (n, l)
  const fanTraces = useMemo(() => {
    const bVals = Array.from({ length: N_B + 1 }, (_, i) => i * B_MAX / N_B)
    const sublevels = zeemanSublevels(n, l, Z, 0).map(s => s.ml)
    return sublevels.map(ml => {
      const color = ml > 0 ? `hsl(${10 + ml * 18},80%,60%)`
                  : ml < 0 ? `hsl(${210 + ml * (-18)},80%,60%)`
                  : '#e0e0e0'
      return {
        x: bVals,
        y: bVals.map(b => hydrogenEnergy(n, Z) + MU_B * b * ml),
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: `m = ${ml > 0 ? '+' : ''}${ml}`,
        line: { color, width: ml === 0 ? 2.5 : 1.8 },
        hovertemplate: `m<sub>l</sub>=${ml}, B=%{x:.3f}, E=%{y:.5f} Eh<extra></extra>`,
      }
    })
  }, [n, l, Z])

  const fanLayout = useMemo(() => {
    const base = hydrogenEnergy(n, Z)
    const spread = Math.max(MU_B * B_MAX * l, 0.02)
    return {
      ...darkLayout({ height: 240, margin: { l: 72, r: 20, t: 28, b: 48 } }),
      xaxis: axis('B (a.u.)'),
      yaxis: axis('Energy (Eh)', { range: [base - spread * 1.25, base + spread * 1.25] }),
      shapes: B > 0 ? [{ type: 'line', x0: B, x1: B, y0: 0, y1: 1, yref: 'paper',
        line: { color: '#888', width: 1, dash: 'dot' } }] : [],
      annotations: B > 0 ? [{ x: B, y: 1.04, yref: 'paper', text: 'B',
        showarrow: false, font: { size: 10, color: '#888' }, xanchor: 'center' }] : [],
      title: { text: `${n}${L_LABELS[l]} sublevel splitting  (2l+1 = ${2*l+1} lines)`,
        font: { size: 11, color: '#aaa' }, x: 0.5, xref: 'paper' },
    }
  }, [n, l, Z, B])

  // Spectral triplet bar chart
  const { tripletTraces, tripletLayout, tripletReadout } = useMemo(() => {
    if (validLower.length === 0) return { tripletTraces: [], tripletLayout: {}, tripletReadout: [] }

    const triplet = zeemanTriplet(n, loN, Z, B)
    // dE can be ≤ 0 for the σ− component when B·μ_B > dE0 (e.g. high-n transitions at large B)
    const nm = triplet.map(c => c.dE > 0 ? HC_NM_ZEEMAN / c.dE : null)

    const barWidth = Math.max(0.6, MU_B * B * HC_NM_ZEEMAN / (triplet[1].dE ** 2) * 0.5)

    const traces = triplet
      .filter((_, i) => nm[i] !== null)
      .map(c => {
        const origIdx = triplet.indexOf(c)
        return {
          x: [nm[origIdx]],
          y: [1],
          type: 'bar' as const,
          name: POL_LABEL[c.pol],
          marker: { color: POL_COLOR[c.pol], line: { color: POL_COLOR[c.pol], width: 1 } },
          width: [barWidth],
          hovertemplate: `${POL_LABEL[c.pol]}<br>λ = %{x:.2f} nm<br>ΔE = ${c.dE.toFixed(5)} Eh<extra></extra>`,
        }
      })

    const λ0 = HC_NM_ZEEMAN / (hydrogenEnergy(n, Z) - hydrogenEnergy(loN, Z))
    const validNm = nm.filter((v): v is number => v !== null)
    const Δλ = validNm.length >= 2 ? Math.abs(validNm[0] - validNm[validNm.length - 1]) : 1.5
    const rangeHalf = Math.max(Δλ * 3, 1.5)
    const layout = {
      ...darkLayout({ height: 220, margin: { l: 50, r: 20, t: 38, b: 52 } }),
      xaxis: axis('Wavelength (nm)', { range: [λ0 - rangeHalf, λ0 + rangeHalf] }),
      yaxis: { ...axis('Intensity'), range: [0, 1.5], showticklabels: false },
      barmode: 'overlay',
      title: {
        text: `${n}${L_LABELS[l]} → ${loN}${L_LABELS[loL]}  Lorentz triplet`,
        font: { size: 11, color: '#aaa' }, x: 0.5, xref: 'paper',
      },
    }

    const readout = triplet.map((c, i) => ({ pol: c.pol, dE: c.dE, nm: nm[i] }))
    return { tripletTraces: traces, tripletLayout: layout, tripletReadout: readout }
  }, [n, l, loN, loL, Z, B, validLower.length])

  const hasLower = validLower.length > 0

  return (
    <div style={{ ...sectionStyle, borderBottom: 'none' }}>
      <button onClick={onToggle} style={collapseStyle}>
        <span style={{ marginRight: 6 }}>{show ? '▾' : '▸'}</span>
        <span style={sectionTitleStyle}>
          Normal Zeeman Effect
          {B > 0 && <span style={{ fontWeight: 400, color: '#06d6a0', marginLeft: 8, fontSize: '0.82rem' }}>
            B = {B.toFixed(3)} a.u.
          </span>}
        </span>
        <span onClick={e => e.stopPropagation()}>
          <HelpButton onClick={onHelpClick} />
        </span>
      </button>

      {show && (
        <div>
          {/* B slider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <label style={{ ...labelStyle, marginBottom: 0, whiteSpace: 'nowrap' }}>B (a.u.)</label>
            <input type="range" min={0} max={B_MAX} step={0.005} value={B}
              onChange={e => onBChange(+e.target.value)}
              style={{ flex: 1, accentColor: '#4361ee' }} />
            <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#e0e0e0', minWidth: 52 }}>
              {B.toFixed(3)}
            </span>
            <button onClick={() => onBChange(0)}
              style={{ fontSize: '0.74rem', padding: '2px 8px', borderRadius: 4, border: '1px solid #444',
                background: 'none', color: '#aaa', cursor: 'pointer' }}>reset</button>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#666', fontStyle: 'italic', marginBottom: 10 }}>
            B in atomic units; 1 a.u. ≈ 2.35 × 10⁵ T. Slider is scaled for visual clarity.
            Simplified nonrelativistic model — orbital angular momentum only.
          </div>

          {/* Fan diagram */}
          {l === 0 ? (
            <div style={{ color: '#888', fontSize: '0.85rem', padding: '8px 0' }}>
              ℓ = 0 (s orbital): no splitting — only m<sub>l</sub> = 0 sublevel.
              Select ℓ ≥ 1 to see degeneracy lifting.
            </div>
          ) : (
            <Plot data={fanTraces as never} layout={fanLayout as never}
              config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
          )}

          {/* Transition selector + triplet */}
          {!hasLower ? (
            <div style={{ color: '#888', fontSize: '0.85rem', padding: '6px 0' }}>
              No E1 transition available from {n}{L_LABELS[l]} — select n ≥ 2 with ℓ ≥ 1 to show the spectral triplet.
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: '0.82rem', color: '#aaa' }}>Transition to:</span>
                <select value={`${loN},${loL}`}
                  onChange={e => {
                    const [nn, ll] = e.target.value.split(',').map(Number)
                    onLoChange(nn, ll)
                  }} style={selectStyle}>
                  {validLower.map(p => (
                    <option key={`${p.nLo},${p.lLo}`} value={`${p.nLo},${p.lLo}`}>{p.label}</option>
                  ))}
                </select>
              </div>

              <Plot data={tripletTraces as never} layout={tripletLayout as never}
                config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />

              {/* Readout */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 6,
                fontSize: '0.8rem', fontFamily: 'monospace' }}>
                {tripletReadout.map(r => (
                  <span key={r.pol} style={{ color: r.nm !== null ? POL_COLOR[r.pol] : '#555' }}>
                    {POL_LABEL[r.pol]}: {r.nm !== null
                      ? <strong>{r.nm.toFixed(2)} nm</strong>
                      : <strong style={{ color: '#666' }}>N/A (B·μ_B &gt; ΔE₀)</strong>}
                    <span style={{ color: '#777', marginLeft: 4 }}>({r.dE.toFixed(4)} Eh)</span>
                  </span>
                ))}
              </div>
              {B > 0 && tripletReadout.length === 3 && tripletReadout[1].nm !== null && (
                <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>
                  {tripletReadout[0].nm !== null && tripletReadout[2].nm !== null
                    ? <>Splitting: Δλ = ±{Math.abs(tripletReadout[0].nm - tripletReadout[1].nm).toFixed(3)} nm
                      from π line  · </>
                    : <>σ± suppressed (B·μ_B &gt; ΔE₀)  · </>}
                  μ<sub>B</sub>B = {(MU_B * B).toFixed(4)} Eh
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Anomalous Zeeman section component ──────────────────────────────────────

const HC_NM_AZ = 45.5640  // hc in nm·Hartree

function AnomalousZeemanSection({
  n, l, Z, B,
  loN, loL,
  show, onToggle, onHelpClick,
}: {
  n: number; l: number; Z: number; B: number
  loN: number; loL: number
  show: boolean; onToggle: () => void; onHelpClick: () => void
}) {
  const B_MAX = 0.3
  const N_B   = 120

  const terms = jTerms(l)
  const upperJ = Math.max(...terms)
  const lowerJ = terms.length > 1 ? Math.min(...terms) : null

  // Valid lower levels (same ΔL = ±1 as normal Zeeman)
  const validLower = useMemo(() => {
    const pairs: { nLo: number; lLo: number; label: string }[] = []
    for (let nLo = 1; nLo < n; nLo++) {
      for (const lLo of [l - 1, l + 1]) {
        if (lLo >= 0 && lLo < nLo) {
          pairs.push({ nLo, lLo, label: `${nLo}${L_LABELS[lLo]} (n=${nLo}, ℓ=${lLo})` })
        }
      }
    }
    return pairs.sort((a, b) => a.nLo - b.nLo || a.lLo - b.lLo)
  }, [n, l])

  // Fan traces: E(J, m_J, B) vs B for selected (n, l)
  const fanTraces = useMemo(() => {
    const bVals = Array.from({ length: N_B + 1 }, (_, i) => i * B_MAX / N_B)
    const subs = anomalousSublevels(n, l, Z, 0)  // get (J, mJ, g) at B=0
    return subs.map(({ J, mJ, g }) => {
      const isUpper = Math.abs(J - upperJ) < 0.01
      // Warm reds for upper J, cool blues for lower J; intensity by |mJ|
      const hue = isUpper
        ? (mJ > 0 ? 5  + Math.round(Math.abs(mJ) * 2) * 12 : 345 - Math.round(Math.abs(mJ) * 2) * 12)
        : (mJ > 0 ? 195 - Math.round(Math.abs(mJ) * 2) * 12 : 215 + Math.round(Math.abs(mJ) * 2) * 12)
      const color = `hsl(${(hue + 360) % 360}, 80%, 60%)`
      const dash = isUpper ? 'solid' : 'dash'
      const sign = mJ > 0 ? '+' : ''
      return {
        x: bVals,
        y: bVals.map(b => hydrogenEnergy(n, Z) + g * MU_B * b * mJ),
        type: 'scatter' as const,
        mode: 'lines' as const,
        name: `J=${J < 1 ? '½' : J === 1.5 ? '³⁄₂' : J === 2.5 ? '⁵⁄₂' : J}, m<sub>J</sub>=${sign}${mJ}`,
        line: { color, width: isUpper ? 2 : 1.5, dash: dash as 'solid' | 'dash' },
        hovertemplate: `J=${J}, m<sub>J</sub>=${sign}${mJ}<br>g<sub>J</sub>=${g.toFixed(4)}<br>B=%{x:.3f}, E=%{y:.5f} Eh<extra></extra>`,
      }
    })
  }, [n, l, Z, upperJ])

  const fanLayout = useMemo(() => {
    const base = hydrogenEnergy(n, Z)
    const maxG = landeG(upperJ, l, 0.5)
    const spread = Math.max(maxG * MU_B * B_MAX * upperJ, 0.02)
    return {
      ...darkLayout({ height: 260, margin: { l: 72, r: 20, t: 28, b: 48 } }),
      xaxis: axis('B (a.u.)'),
      yaxis: axis('Energy (Eh)', { range: [base - spread * 1.25, base + spread * 1.25] }),
      shapes: B > 0 ? [{ type: 'line', x0: B, x1: B, y0: 0, y1: 1, yref: 'paper',
        line: { color: '#888', width: 1, dash: 'dot' } }] : [],
      annotations: B > 0 ? [{ x: B, y: 1.04, yref: 'paper', text: 'B',
        showarrow: false, font: { size: 10, color: '#888' }, xanchor: 'center' }] : [],
      title: {
        text: `${n}${L_LABELS[l]} sublevel fan — anomalous Zeeman (${2 * (2 * l + 1)} levels)`,
        font: { size: 11, color: '#aaa' }, x: 0.5, xref: 'paper',
      },
    }
  }, [n, l, Z, B, upperJ])

  // Spectral lines chart
  const { lineTraces, lineLayout, lineCount } = useMemo(() => {
    if (validLower.length === 0) return { lineTraces: [], lineLayout: {}, lineCount: 0 }
    const lines = anomalousZeemanLines(n, l, loN, loL, Z, B)
    const nm = lines.map(c => c.dE > 0 ? HC_NM_AZ / c.dE : null)

    const dE0_val = hydrogenEnergy(n, Z) - hydrogenEnergy(loN, Z)
    const λ0 = HC_NM_AZ / dE0_val
    const validNm = nm.filter((v): v is number => v !== null)
    const spread = validNm.length >= 2 ? Math.max(Math.abs(validNm[0] - validNm[validNm.length - 1]) * 1.6, 2) : 5
    const rangeHalf = Math.max(spread, 2)

    // Narrow bar width
    const barW = Math.max(0.3, MU_B * B * HC_NM_AZ / (dE0_val ** 2) * 0.3)

    const traces = ([1, 0, -1] as const).map(dMJ => {
      const group = lines.map((l, i) => ({ ...l, nm: nm[i] })).filter(x => x.dMJ === dMJ && x.nm !== null)
      return {
        x: group.map(g => g.nm),
        y: group.map(() => 1),
        type: 'bar' as const,
        name: dMJ ===  1 ? 'σ+ (Δm=+1)' : dMJ === 0 ? 'π  (Δm=0)' : 'σ− (Δm=−1)',
        marker: { color: POL_COLOR[dMJ === 1 ? 'sigma+' : dMJ === 0 ? 'pi' : 'sigma-'],
          line: { color: '#111', width: 0.5 } },
        width: group.map(() => barW),
        hovertemplate: `%{fullData.name}<br>λ=%{x:.2f} nm<extra></extra>`,
      }
    })

    const layout = {
      ...darkLayout({ height: 220, margin: { l: 50, r: 20, t: 38, b: 52 } }),
      xaxis: axis('Wavelength (nm)', { range: [λ0 - rangeHalf, λ0 + rangeHalf] }),
      yaxis: { ...axis('Intensity'), range: [0, 1.5], showticklabels: false },
      barmode: 'overlay',
      title: {
        text: `${n}${L_LABELS[l]} → ${loN}${L_LABELS[loL]}  anomalous Zeeman pattern`,
        font: { size: 11, color: '#aaa' }, x: 0.5, xref: 'paper',
      },
    }

    return { lineTraces: traces, lineLayout: layout, lineCount: lines.length }
  }, [n, l, loN, loL, Z, B, validLower.length])

  const hasLower = validLower.length > 0

  return (
    <div style={{ ...sectionStyle, borderBottom: 'none' }}>
      <button onClick={onToggle} style={collapseStyle}>
        <span style={{ marginRight: 6 }}>{show ? '▾' : '▸'}</span>
        <span style={sectionTitleStyle}>
          Anomalous Zeeman Effect
          {B > 0 && <span style={{ fontWeight: 400, color: '#06d6a0', marginLeft: 8, fontSize: '0.82rem' }}>
            B = {B.toFixed(3)} a.u.
          </span>}
        </span>
        <span onClick={e => e.stopPropagation()}>
          <HelpButton onClick={onHelpClick} />
        </span>
      </button>

      {show && (
        <div>
          <div style={{ fontSize: '0.72rem', color: '#666', fontStyle: 'italic', marginBottom: 10 }}>
            Includes electron spin S=½. Uses Landé g-factor g<sub>J</sub> — slopes differ per J term.
            Shares the B slider above. Fine-structure splitting ignored (all J terms degenerate at B=0).
          </div>

          {/* g_J readout */}
          <div style={{ ...readoutStyle, marginBottom: 10, gap: 20 }}>
            {terms.map(J => (
              <span key={J}>
                J={J}: g<sub>J</sub> = <strong style={{ color: Math.abs(J - upperJ) < 0.01 ? '#f77f00' : '#00b4d8' }}>
                  {landeG(J, l, 0.5).toFixed(4)}
                </strong>
              </span>
            ))}
            <span style={{ color: '#555', fontSize: '0.75rem' }}>
              (normal Zeeman: g<sub>l</sub> = 1 for all m<sub>l</sub>)
            </span>
          </div>

          {/* Fan diagram */}
          <Plot data={fanTraces as never} layout={fanLayout as never}
            config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />

          {l === 0 && (
            <div style={{ fontSize: '0.78rem', color: '#4361ee', marginTop: 4, marginBottom: 8 }}>
              s orbital (ℓ=0): <strong>no normal Zeeman splitting</strong> (m<sub>l</sub>=0 only),
              but <strong>anomalous Zeeman gives a spin doublet</strong> (m<sub>J</sub>=±½, g=2).
            </div>
          )}

          {/* Spectral lines */}
          {!hasLower ? (
            <div style={{ color: '#888', fontSize: '0.85rem', padding: '6px 0' }}>
              No E1 transition from {n}{L_LABELS[l]} — select n≥2 with ℓ≥1 to see the spectral pattern.
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', color: '#aaa' }}>Transition to:</span>
                <select value={`${loN},${loL}`} disabled
                  style={{ ...selectStyle, opacity: 0.7, cursor: 'default' }}>
                  {validLower.map(p => (
                    <option key={`${p.nLo},${p.lLo}`} value={`${p.nLo},${p.lLo}`}>{p.label}</option>
                  ))}
                </select>
                <span style={{ fontSize: '0.8rem', color: '#06d6a0', fontFamily: 'monospace' }}>
                  {lineCount} lines
                  {B > 0 ? ` (vs 3 for normal Zeeman)` : ` (merge to 1 at B=0)`}
                </span>
              </div>

              <Plot data={lineTraces as never} layout={lineLayout as never}
                config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />

              {lowerJ !== null && B > 0 && (
                <div style={{ fontSize: '0.78rem', color: '#888', marginTop: 4, fontFamily: 'monospace' }}>
                  g<sub>J</sub> = {landeG(upperJ, l, 0.5).toFixed(4)} (J={upperJ})
                  {' · '}
                  g<sub>J</sub> = {landeG(lowerJ, l, 0.5).toFixed(4)} (J={lowerJ})
                  {' · '}
                  splitting: ±{(MU_B * B).toFixed(4)} Eh × g<sub>J</sub>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function helpTitle(t: HydrogenInfoTopic): string {
  if (t === 'radialDensity')      return 'Radial Probability Density P(r)'
  if (t === 'radialWavefunction') return 'Radial Wavefunction R_nl(r)'
  if (t === 'orbital2D')          return 'Orbital Cross-Section |ψ(x,z)|²'
  if (t === 'angularShape')       return 'Angular Shape |Y_l^m(θ)|²'
  if (t === 'isosurface')         return '3D Orbital Isosurface |ψ|²'
  if (t === 'zeeman')             return 'Normal Zeeman Effect'
  if (t === 'anomalousZeeman')    return 'Anomalous Zeeman Effect'
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
