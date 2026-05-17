import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { parseHash, getIntParam, getNumericParam, getStringParam, setUrlParams } from '../physics/urlState'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import {
  wignerFock, wignerCoherent,
  wignerCoherentT, wignerSqueezedT,
  wignerCat, wignerFockSuper,
  computeWignerGrid, xMarginal, pMarginal, wignerNegativity,
} from '../physics/wigner'
import { hoCoherentExpectX, hoCoherentExpectP } from '../physics/timeEvolution'
import { hoWavefunction } from '../physics/harmonic'
import { WignerInfoPanel } from './WignerInfoPanel'

// ── Types & constants ─────────────────────────────────────────────────────────

type StateType = 'fock' | 'coherent' | 'squeezed' | 'cat-even' | 'cat-odd' | 'fock-super'

const NX = 70, NP = 70
const NX_ANIM = 50, NP_ANIM = 50
const NX_SUPER = 40, NP_SUPER = 40

const SPEEDS = [0.25, 0.5, 1, 2, 5]
const T_SCALE_BASE = 0.5   // a.u. per wall-clock second at 1×

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  accent: '#4361ee', orange: '#f77f00', green: '#06d6a0',
}

function darkLayout(extra: Record<string, unknown> = {}) {
  return {
    paper_bgcolor: DARK.paper, plot_bgcolor: DARK.plot,
    font: { color: DARK.text, size: 11 },
    margin: { l: 55, r: 20, t: 28, b: 50 },
    showlegend: false,
    ...extra,
  }
}

function axis(title: string, extra: Record<string, unknown> = {}) {
  return {
    title: { text: title, font: { color: '#aaa', size: 11 } },
    color: '#aaa', gridcolor: DARK.grid, zeroline: false, ...extra,
  }
}

// ── Phase-space range ─────────────────────────────────────────────────────────

function phaseSpaceRange(
  type: StateType, n: number, alpha: number, r: number, omega: number,
): { xMin: number; xMax: number; pMin: number; pMax: number } {
  const base = Math.sqrt((2 * Math.max(n, 1) + 1) / omega) * 1.6 + 1.5

  if (type === 'fock') {
    return { xMin: -base, xMax: base, pMin: -base * omega, pMax: base * omega }
  }
  if (type === 'coherent') {
    // Fixed range that covers the full orbit: x-amplitude α√(2/ω), p-amplitude α√(2ω)
    const xOrb = alpha * Math.sqrt(2 / omega), pOrb = alpha * Math.sqrt(2 * omega)
    const xPad = 4 / Math.sqrt(2 * omega), pPad = 4 * Math.sqrt(omega / 2)
    return { xMin: -(xOrb + xPad), xMax: xOrb + xPad, pMin: -(pOrb + pPad), pMax: pOrb + pPad }
  }
  if (type === 'squeezed') {
    const xOrb = alpha * Math.sqrt(2 / omega), pOrb = alpha * Math.sqrt(2 * omega)
    const xPad = 5 * Math.exp(r) / Math.sqrt(2 * omega)
    const pPad = 5 * Math.exp(r) * Math.sqrt(omega / 2)
    return { xMin: -(xOrb + xPad), xMax: xOrb + xPad, pMin: -(pOrb + pPad), pMax: pOrb + pPad }
  }
  if (type === 'cat-even' || type === 'cat-odd') {
    const xCoh = alpha * Math.sqrt(2 / omega)
    const xMax = xCoh + 4 / Math.sqrt(omega)
    const pCat = 2 * xCoh * omega + 4 * Math.sqrt(omega)
    return { xMin: -xMax, xMax, pMin: -pCat, pMax: pCat }
  }
  return { xMin: -base, xMax: base, pMin: -base * omega, pMax: base * omega }
}

// ── Main component ────────────────────────────────────────────────────────────

const WIGNER_MODES = ['fock', 'coherent', 'squeezed', 'cat-even', 'cat-odd', 'fock-super'] as const

export function WignerExplorer() {
  const [stateType, setStateType] = useState<StateType>(() =>
    getStringParam(parseHash(window.location.hash).params, 'mode', 'fock', WIGNER_MODES) as StateType
  )
  const [n, setN]         = useState(() => getIntParam(parseHash(window.location.hash).params, 'n', 1, 0, 6))
  const [n2, setN2]       = useState(2)
  const [alpha, setAlpha] = useState(() => getNumericParam(parseHash(window.location.hash).params, 'alpha', 2.0, 0, 3))
  const [phiAlpha, setPhiAlpha] = useState(0.0)
  const [omega, setOmega] = useState(1.0)
  const [r, setR]         = useState(() => getNumericParam(parseHash(window.location.hash).params, 'r', 0.8, 0, 2))

  useEffect(() => { setUrlParams({ mode: stateType, n, alpha, r }) }, [stateType, n, alpha, r])

  // Animation
  const [t, setT]           = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(2)

  // UI toggles
  const [showMarginals, setShowMarginals] = useState(true)
  const [showHelp, setShowHelp]           = useState(false)

  const rafRef    = useRef<number | undefined>(undefined)
  const lastTsRef = useRef<number | undefined>(undefined)

  const isAnimated = stateType === 'coherent' || stateType === 'squeezed'
  const tPeriod    = 2 * Math.PI / omega
  const tScale     = SPEEDS[speedIdx] * T_SCALE_BASE

  // ── RAF loop ────────────────────────────────────────────────────────────────

  const tick = useCallback((ts: number) => {
    const dt = (ts - (lastTsRef.current ?? ts)) / 1000
    lastTsRef.current = ts
    setT(prev => (prev + dt * tScale) % tPeriod)
    rafRef.current = requestAnimationFrame(tick)
  }, [tScale, tPeriod])

  useEffect(() => {
    if (playing && isAnimated) {
      lastTsRef.current = undefined
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [playing, isAnimated, tick])

  // Stop animation when switching to non-animated state
  useEffect(() => {
    if (!isAnimated) { setPlaying(false); setT(0) }
  }, [isAnimated])

  function resetAnim() { setT(0); setPlaying(false) }

  // ── Wigner evaluator ────────────────────────────────────────────────────────

  const wignerFn = useMemo<(x: number, p: number) => number>(() => {
    const xCoh = alpha * Math.sqrt(2 / omega)
    switch (stateType) {
      case 'fock':
        return (x, p) => wignerFock(n, x, p, omega)
      case 'coherent':
        return (x, p) => wignerCoherentT(x, p, t, alpha, phiAlpha, omega)
      case 'squeezed':
        return (x, p) => wignerSqueezedT(x, p, t, alpha, phiAlpha, omega, r)
      case 'cat-even':
        return (x, p) => wignerCat(x, p, alpha, omega, 1)
      case 'cat-odd':
        return (x, p) => wignerCat(x, p, alpha, omega, -1)
      case 'fock-super':
        return (x, p) => wignerFockSuper(n, n2, x, p, omega)
      default:
        return (x, p) => wignerCoherent(x, p, xCoh, 0, omega)
    }
  }, [stateType, n, n2, alpha, phiAlpha, omega, r, t])

  // ── Grid ────────────────────────────────────────────────────────────────────

  const { xMin, xMax: xMaxR, pMin, pMax: pMaxR } =
    phaseSpaceRange(stateType, n, alpha, r, omega)

  const grid = useMemo(() => {
    const nx = stateType === 'fock-super' ? NX_SUPER : (playing ? NX_ANIM : NX)
    const np = stateType === 'fock-super' ? NP_SUPER : (playing ? NP_ANIM : NP)
    return computeWignerGrid(wignerFn, xMin, xMaxR, nx, pMin, pMaxR, np)
  }, [wignerFn, xMin, xMaxR, pMin, pMaxR, stateType, playing])

  const negativity = useMemo(() => wignerNegativity(grid), [grid])

  // Marginals — skip during playback for rendering speed
  const showMarginalsNow = showMarginals && !playing
  const xMarg = useMemo(() => showMarginalsNow ? xMarginal(grid) : [], [grid, showMarginalsNow])
  const pMarg = useMemo(() => showMarginalsNow ? pMarginal(grid) : [], [grid, showMarginalsNow])

  const psi2Line = useMemo(() => {
    if (!showMarginalsNow) return []
    return grid.xVals.map(x => {
      if (stateType === 'fock') return hoWavefunction(n, x, omega) ** 2
      if (stateType === 'fock-super') {
        const psi = (hoWavefunction(n, x, omega) + hoWavefunction(n2, x, omega)) / Math.SQRT2
        return psi * psi
      }
      return null
    }).filter((v): v is number => v !== null)
  }, [stateType, n, n2, omega, grid.xVals, showMarginalsNow])

  // ── Heatmap ─────────────────────────────────────────────────────────────────

  const absMax = Math.max(Math.abs(grid.zMin), Math.abs(grid.zMax), 1e-9)
  const colorscale = [
    [0,   '#2166ac'],
    [0.5, '#f7f7f7'],
    [1,   '#d6604d'],
  ]

  // Orbit ellipse for coherent/squeezed (constant — doesn't depend on t)
  const orbitTrace = useMemo(() => {
    if (!isAnimated || alpha < 0.05) return null
    const xOrb = alpha * Math.sqrt(2 / omega)
    const pOrb = alpha * Math.sqrt(2 * omega)
    const NPTS = 120
    const ox = Array.from({ length: NPTS + 1 }, (_, i) => xOrb * Math.cos(2 * Math.PI * i / NPTS))
    const oy = Array.from({ length: NPTS + 1 }, (_, i) => -pOrb * Math.sin(2 * Math.PI * i / NPTS))
    return { x: ox, y: oy, mode: 'lines', type: 'scatter',
      line: { color: 'rgba(255,255,255,0.25)', width: 1, dash: 'dot' },
      hoverinfo: 'skip', showlegend: false }
  }, [isAnimated, alpha, omega])

  // Moving centre dot
  const xNow = isAnimated ? hoCoherentExpectX(t, alpha, phiAlpha, omega) : 0
  const pNow = isAnimated ? hoCoherentExpectP(t, alpha, phiAlpha, omega) : 0
  const centreTrace = isAnimated ? {
    x: [xNow], y: [pNow], mode: 'markers', type: 'scatter',
    marker: { color: DARK.orange, size: 7, symbol: 'cross-thin-open', line: { width: 2 } },
    hoverinfo: 'skip', showlegend: false,
  } : null

  const heatmapTrace = {
    type: 'heatmap',
    x: grid.xVals, y: grid.pVals, z: grid.W,
    colorscale, zmin: -absMax, zmax: absMax,
    showscale: true,
    colorbar: {
      thickness: 12, len: 0.85,
      title: { text: 'W(x,p)', side: 'right' },
      tickfont: { color: '#aaa', size: 10 },
      titlefont: { color: '#aaa', size: 10 },
    },
    hovertemplate: 'x=%{x:.2f} p=%{y:.2f} W=%{z:.4f}<extra></extra>',
  }

  const heatmapData = [
    heatmapTrace as any,
    ...(orbitTrace ? [orbitTrace] : []),
    ...(centreTrace ? [centreTrace] : []),
  ]

  const heatmapLayout = {
    ...darkLayout({ height: 390 }),
    xaxis: axis('x (a.u.)', { range: [xMin, xMaxR] }),
    yaxis: axis('p (a.u.)', { range: [pMin, pMaxR] }),
    margin: { l: 55, r: 85, t: 32, b: 50 },
  }

  // ── Marginal plots ───────────────────────────────────────────────────────────

  const xMargTraces: object[] = showMarginalsNow ? [
    { x: grid.xVals, y: xMarg, mode: 'lines',
      line: { color: DARK.accent, width: 2 }, name: '∫W dp' },
    ...(psi2Line.length > 0 ? [{
      x: grid.xVals, y: psi2Line, mode: 'lines',
      line: { color: DARK.orange, width: 1.5, dash: 'dot' }, name: '|ψ(x)|²',
    }] : []),
  ] : []

  const pMargTraces: object[] = showMarginalsNow ? [
    { x: grid.pVals, y: pMarg, mode: 'lines',
      line: { color: DARK.green, width: 2 }, name: '∫W dx' },
  ] : []

  const margLayout = (xLabel: string, yLabel: string) => ({
    ...darkLayout({ height: 180 }),
    xaxis: axis(xLabel), yaxis: axis(yLabel),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 10 } },
    margin: { l: 55, r: 20, t: 20, b: 45 },
  })

  const cfg = { displayModeBar: false, responsive: true }
  const isNegativable = stateType !== 'coherent' && stateType !== 'squeezed'

  return (
    <>
      {showHelp && (
        <HelpModal title="Wigner Function" onClose={() => setShowHelp(false)}>
          <WignerInfoPanel />
        </HelpModal>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

        {/* ── Controls ── */}
        <div style={{ flex: '0 0 220px', minWidth: 190 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Wigner Function</h3>
            <HelpButton onClick={() => setShowHelp(true)} />
          </div>

          {/* State selector */}
          <div style={{ marginBottom: '0.6rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem' }}>Quantum state</div>
            {([
              ['fock',      'Fock |n⟩'],
              ['coherent',  'Coherent |α⟩  ▶'],
              ['squeezed',  'Squeezed D(α)S(r)|0⟩  ▶'],
              ['cat-even',  'Even cat (|α⟩+|−α⟩)'],
              ['cat-odd',   'Odd cat  (|α⟩−|−α⟩)'],
              ['fock-super','Fock super (|n⟩+|m⟩)/√2'],
            ] as [StateType, string][]).map(([id, label]) => (
              <button key={id} onClick={() => setStateType(id)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.25rem 0.5rem', marginBottom: '0.2rem',
                border: '1px solid', borderRadius: 4,
                cursor: 'pointer', fontSize: '0.76rem',
                background:  stateType === id ? '#4361ee' : '#1a1a1a',
                color:       stateType === id ? '#fff'    : '#aaa',
                borderColor: stateType === id ? '#4361ee' : '#333',
              }}>{label}</button>
            ))}
          </div>

          {/* Parameters */}
          <ParameterSlider label="Frequency ω" value={omega} min={0.3} max={3.0} step={0.1} unit="a.u."
            onChange={v => { setOmega(v); resetAnim() }} />

          {(stateType === 'fock' || stateType === 'fock-super') && (
            <ParameterSlider label={stateType === 'fock-super' ? '|n⟩' : 'Fock n'}
              value={n} min={0} max={6} step={1} digits={0} onChange={setN} />
          )}
          {stateType === 'fock-super' && (
            <ParameterSlider label="|m⟩" value={n2} min={0} max={6} step={1} digits={0} onChange={setN2} />
          )}
          {(stateType === 'coherent' || stateType === 'squeezed' || stateType === 'cat-even' || stateType === 'cat-odd') && (
            <ParameterSlider label="Displacement |α|" value={alpha} min={0} max={4} step={0.1}
              description="orbit radius α√(2/ω)" onChange={v => { setAlpha(v); resetAnim() }} />
          )}
          {(stateType === 'coherent' || stateType === 'squeezed') && (
            <ParameterSlider label="Phase φ_α" value={phiAlpha} min={0} max={2 * Math.PI} step={0.05}
              unit="rad" description="start position on orbit" onChange={v => { setPhiAlpha(v); resetAnim() }} />
          )}
          {stateType === 'squeezed' && (
            <ParameterSlider label="Squeeze r" value={r} min={0} max={2} step={0.05}
              description="ellipse aspect ratio e^r" onChange={v => { setR(v); resetAnim() }} />
          )}

          {/* Readout */}
          <div style={{ borderTop: '1px solid #222', paddingTop: '0.6rem', marginTop: '0.5rem' }}>
            <table style={{ fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums', width: '100%' }}>
              <tbody>
                <tr><td style={tdL}>W max</td><td style={tdR}>{grid.zMax.toFixed(4)}</td></tr>
                <tr><td style={tdL}>W min</td>
                  <td style={{ ...tdR, color: grid.zMin < -0.001 ? '#ef233c' : '#4361ee' }}>
                    {grid.zMin.toFixed(4)}
                  </td>
                </tr>
                <tr>
                  <td style={tdL}>Negativity 𝒩</td>
                  <td style={{ ...tdR, color: negativity > 0.001 ? '#ef233c' : '#06d6a0' }}>
                    {negativity.toFixed(4)}
                  </td>
                </tr>
              </tbody>
            </table>
            {!isNegativable && (
              <div style={{ fontSize: '0.72rem', color: '#06d6a0', marginTop: '0.3rem' }}>
                Classical state — W ≥ 0 everywhere
              </div>
            )}
          </div>

          {/* Animation controls (coherent / squeezed only) */}
          {isAnimated && (
            <div style={{ borderTop: '1px solid #222', paddingTop: '0.6rem', marginTop: '0.6rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.4rem' }}>
                HO time evolution  T = {tPeriod.toFixed(2)} a.u.
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.4rem' }}>
                <button onClick={() => setPlaying(p => !p)} style={ctrlBtn}>
                  {playing ? '⏸' : '▶'}
                </button>
                <button onClick={resetAnim} style={ctrlBtn}>⏹</button>
              </div>
              <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
                {SPEEDS.map((s, i) => (
                  <button key={s} onClick={() => setSpeedIdx(i)} style={{
                    ...ctrlBtn, padding: '0.15rem 0.35rem', fontSize: '0.7rem',
                    background: speedIdx === i ? '#2a2a2a' : '#1a1a1a',
                    borderColor: speedIdx === i ? '#555' : '#333',
                    color: speedIdx === i ? '#fff' : '#888',
                  }}>{s}×</button>
                ))}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#888', fontVariantNumeric: 'tabular-nums' }}>
                t = {t.toFixed(2)}  ({(t / tPeriod * 100).toFixed(0)}% T)
              </div>
              {stateType === 'squeezed' && (
                <div style={{ fontSize: '0.72rem', color: '#555', marginTop: '0.3rem', lineHeight: 1.4 }}>
                  Ellipse rotates at ω, breathes at 2ω
                </div>
              )}
            </div>
          )}

          {/* Marginals toggle */}
          <button onClick={() => setShowMarginals(m => !m)} style={{
            marginTop: '0.8rem', width: '100%', padding: '0.3rem',
            border: '1px solid #333', borderRadius: 4, cursor: 'pointer',
            fontSize: '0.78rem', background: '#1a1a1a',
            color: showMarginals ? '#4361ee' : '#666',
          }}>
            {showMarginals ? '▾' : '▸'} Marginals {playing ? '(paused during playback)' : ''}
          </button>
        </div>

        {/* ── Plots ── */}
        <div style={{ flex: '1 1 400px', minWidth: 300 }}>

          {/* Phase-space heatmap */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#aaa', fontWeight: 600, marginBottom: 4 }}>
              W(x,p{isAnimated ? ',t' : ''}) — phase space
              {isAnimated && (
                <span style={{ marginLeft: 8, fontSize: '0.72rem', color: DARK.orange }}>
                  {stateType === 'coherent' ? 'blob rigidly orbits' : 'ellipse rotates & breathes'}
                </span>
              )}
              {!isAnimated && grid.zMin < -0.001 && (
                <span style={{ marginLeft: 8, fontSize: '0.72rem', color: '#ef233c' }}>
                  (negative regions = non-classical)
                </span>
              )}
            </div>
            <Plot
              data={heatmapData}
              layout={heatmapLayout as any}
              config={cfg}
              style={{ width: '100%' }}
            />
          </div>

          {/* Marginals */}
          {showMarginalsNow && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px' }}>
                <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 2 }}>
                  x-marginal ∫W dp = |ψ(x)|²
                </div>
                <Plot data={xMargTraces as any} layout={margLayout('x (a.u.)', '|ψ|²') as any}
                  config={cfg} style={{ width: '100%' }} />
              </div>
              <div style={{ flex: '1 1 280px' }}>
                <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 2 }}>
                  p-marginal ∫W dx = |φ̃(p)|²
                </div>
                <Plot data={pMargTraces as any} layout={margLayout('p (a.u.)', '|φ̃|²') as any}
                  config={cfg} style={{ width: '100%' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const tdL: React.CSSProperties = { color: '#aaa', paddingBottom: '0.25rem', fontSize: '0.8rem' }
const tdR: React.CSSProperties = { color: '#4361ee', textAlign: 'right', paddingBottom: '0.25rem', fontSize: '0.8rem' }
const ctrlBtn: React.CSSProperties = {
  padding: '0.25rem 0.55rem', border: '1px solid #333', borderRadius: 4,
  cursor: 'pointer', fontSize: '0.85rem', background: '#1a1a1a', color: '#ccc',
}
