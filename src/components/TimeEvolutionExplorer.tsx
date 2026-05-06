import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import _Plot from 'react-plotly.js'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import {
  iswPsi as iswPsiTE,
  iswProb, iswExpectX, iswExpectP, iswExpectX2, iswExpectP2, iswRevivalPeriod,
  hoCoherentProb, hoCoherentExpectX, hoCoherentExpectP,
  hoCoherentDeltaX, hoCoherentDeltaP,
} from '../physics/timeEvolution'
import { iswEnergy } from '../physics/isw'
import { hoEnergy } from '../physics/harmonic'
import { TimeEvolutionInfoPanel } from './TimeEvolutionInfoPanel'

type SubMode = 'isw' | 'ho'
type DisplayMode = 'prob' | 're' | 'im'
const SPEEDS = [0.25, 0.5, 1, 2, 5]
const N_LEVELS = 8
const N_POINTS = 400

const DEFAULT_COEFFS = Array.from({ length: N_LEVELS }, (_, i) => i === 0 ? 1 : 0)

const PRESETS: Record<string, number[]> = {
  'Ground state':   [1,0,0,0,0,0,0,0],
  '1+2 equal mix':  [1/Math.SQRT2, 1/Math.SQRT2, 0,0,0,0,0,0],
  '1+2+3 mix':      [1/Math.sqrt(3), 1/Math.sqrt(3), 1/Math.sqrt(3), 0,0,0,0,0],
  'Gaussian env':   buildGaussianEnv(),
}

function buildGaussianEnv(): number[] {
  const raw = Array.from({ length: N_LEVELS }, (_, i) => Math.exp(-Math.pow(i - 1.5, 2) / 2))
  const norm = Math.sqrt(raw.reduce((s, v) => s + v * v, 0))
  return raw.map(v => v / norm)
}

function normalise(c: number[]): number[] {
  const norm = Math.sqrt(c.reduce((s, v) => s + v * v, 0))
  return norm > 1e-12 ? c.map(v => v / norm) : c
}

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  accent: '#4361ee', orange: '#f77f00', green: '#06d6a0', red: '#ef233c',
}

function darkLayout(extraProps = {}) {
  return {
    paper_bgcolor: DARK.paper, plot_bgcolor: DARK.plot,
    font: { color: DARK.text, size: 12 },
    margin: { l: 55, r: 20, t: 28, b: 50 },
    height: 260,
    showlegend: false,
    ...extraProps,
  }
}

function axis(title: string, extra = {}) {
  return { title: { text: title, font: { color: '#aaa', size: 11 } }, color: '#aaa', gridcolor: DARK.grid, zeroline: false, ...extra }
}

// ── ISW grid helpers ──────────────────────────────────────────────────────────

function makeISWGrid(L: number): number[] {
  return Array.from({ length: N_POINTS }, (_, i) => (i / (N_POINTS - 1)) * L)
}

function makeHOGrid(omega: number): number[] {
  const xMax = Math.sqrt((2 * (N_LEVELS) + 1) / omega) * 1.8 + 1.5
  return Array.from({ length: N_POINTS }, (_, i) => -xMax + (2 * xMax * i) / (N_POINTS - 1))
}

// ── Main component ─────────────────────────────────────────────────────────

export function TimeEvolutionExplorer() {
  const [subMode, setSubMode] = useState<SubMode>('isw')

  // ISW state
  const [L, setL] = useState(10)
  const [coeffs, setCoeffs] = useState<number[]>(DEFAULT_COEFFS)

  // HO state
  const [omega, setOmega] = useState(1.0)
  const [alpha, setAlpha] = useState(1.5)
  const [phiAlpha, setPhiAlpha] = useState(0)

  // Animation state
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(2)   // 1×
  const [loop, setLoop] = useState(true)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('prob')

  // Help modals
  const [showHelpMain, setShowHelpMain] = useState(false)
  const [showHelpDecomp, setShowHelpDecomp] = useState(false)
  const [showHelpExpect, setShowHelpExpect] = useState(false)
  const [showHelpNorm, setShowHelpNorm] = useState(false)

  const rafRef = useRef<number>()
  const lastTsRef = useRef<number>()

  const tMax = subMode === 'isw' ? 2 * iswRevivalPeriod(L) : 4 * Math.PI / omega
  // t advances at speed * 0.1 a.u./ms (so 1× = 0.1 a.u./s)
  const tScale = SPEEDS[speedIdx] * 0.1

  const tick = useCallback((ts: number) => {
    const dt = (ts - (lastTsRef.current ?? ts)) / 1000
    lastTsRef.current = ts
    setT(prev => {
      let next = prev + dt * tScale
      if (loop && next > tMax) next = next % tMax
      else if (!loop && next > tMax) { next = tMax; setPlaying(false) }
      return next
    })
    rafRef.current = requestAnimationFrame(tick)
  }, [tScale, tMax, loop])

  useEffect(() => {
    if (playing) {
      lastTsRef.current = undefined
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [playing, tick])

  function reset() { setT(0); setPlaying(false) }

  // Derived quantities
  const normCoeffs = useMemo(() => normalise(coeffs), [coeffs])
  const tRev = iswRevivalPeriod(L)

  function setCoeff(i: number, v: number) {
    setCoeffs(prev => { const c = [...prev]; c[i] = v; return c })
  }

  function applyPreset(name: string) {
    setCoeffs(PRESETS[name] ?? DEFAULT_COEFFS)
    reset()
  }

  // ── ISW plots ─────────────────────────────────────────────────────────────

  const iswData = useMemo(() => {
    const xGrid = makeISWGrid(L)
    const yProb = xGrid.map(x => iswProb(x, t, normCoeffs, L))
    const yPsi: number[] | null = (displayMode === 're' || displayMode === 'im')
      ? xGrid.map(x => {
          const { re, im } = iswPsiTE(x, t, normCoeffs, L)
          return displayMode === 're' ? re : im
        })
      : null
    const xExp = iswExpectX(t, normCoeffs, L)
    return { xGrid, yProb, yPsi, xExp }
  }, [t, normCoeffs, L, displayMode])

  // ── HO plots ──────────────────────────────────────────────────────────────

  const hoData = useMemo(() => {
    const xGrid = makeHOGrid(omega)
    const yProb = xGrid.map(x => hoCoherentProb(x, t, alpha, phiAlpha, omega))
    const xExp = hoCoherentExpectX(t, alpha, phiAlpha, omega)
    return { xGrid, yProb, xExp }
  }, [t, alpha, phiAlpha, omega])

  // Expectation values history (last 200 frames)
  const histRef = useRef<{ t: number; x: number; p: number; dx: number; dp: number; dxdp: number }[]>([])
  useEffect(() => {
    const entry = subMode === 'isw'
      ? (() => {
          const x = iswExpectX(t, normCoeffs, L)
          const p = iswExpectP(t, normCoeffs, L)
          const x2 = iswExpectX2(t, normCoeffs, L)
          const p2 = iswExpectP2(normCoeffs, L)
          const dx = Math.sqrt(Math.max(0, x2 - x * x))
          const dp = Math.sqrt(Math.max(0, p2 - p * p))
          return { t, x, p, dx, dp, dxdp: dx * dp }
        })()
      : (() => {
          const x = hoCoherentExpectX(t, alpha, phiAlpha, omega)
          const p = hoCoherentExpectP(t, alpha, phiAlpha, omega)
          const dx = hoCoherentDeltaX(omega)
          const dp = hoCoherentDeltaP(omega)
          return { t, x, p, dx, dp, dxdp: dx * dp }
        })()
    histRef.current = [...histRef.current.slice(-399), entry]
  }, [t, subMode, normCoeffs, L, alpha, phiAlpha, omega])

  // Energy decomposition weights |cₙ|²
  const decompData = useMemo(() => {
    if (subMode === 'isw') {
      const labels = normCoeffs.map((_, i) => `n=${i + 1}`)
      const weights = normCoeffs.map(c => c * c)
      return { labels, weights }
    } else {
      const nMax = 12
      const expMinusAlpha2 = Math.exp(-alpha * alpha)
      let alphaPow2n = 1
      let factN = 1
      const weights = Array.from({ length: nMax }, (_, n) => {
        if (n > 0) { alphaPow2n *= alpha * alpha; factN *= n }
        return expMinusAlpha2 * alphaPow2n / factN
      })
      return { labels: Array.from({ length: nMax }, (_, n) => `n=${n}`), weights }
    }
  }, [subMode, normCoeffs, alpha])

  // ── Render ─────────────────────────────────────────────────────────────────

  const hist = histRef.current

  return (
    <>
      {showHelpMain && (
        <HelpModal title="Time Evolution — Physics Reference" onClose={() => setShowHelpMain(false)}>
          <TimeEvolutionInfoPanel topic="main" subMode={subMode} />
        </HelpModal>
      )}
      {showHelpDecomp && (
        <HelpModal title="Energy Decomposition — Physics Reference" onClose={() => setShowHelpDecomp(false)}>
          <TimeEvolutionInfoPanel topic="decomp" subMode={subMode} />
        </HelpModal>
      )}
      {showHelpExpect && (
        <HelpModal title="Expectation Values — Physics Reference" onClose={() => setShowHelpExpect(false)}>
          <TimeEvolutionInfoPanel topic="expect" subMode={subMode} />
        </HelpModal>
      )}
      {showHelpNorm && (
        <HelpModal title="Norm Conservation — Physics Reference" onClose={() => setShowHelpNorm(false)}>
          <TimeEvolutionInfoPanel topic="norm" subMode={subMode} />
        </HelpModal>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

        {/* ── Left: Controls ── */}
        <div style={{ flex: '0 0 240px', minWidth: 200 }}>
          <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem' }}>Time Evolution</h3>

          {/* Sub-mode selector */}
          <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.2rem' }}>
            {(['isw', 'ho'] as SubMode[]).map(m => (
              <button key={m} onClick={() => { setSubMode(m); reset() }} style={{
                ...btnStyle,
                background:  subMode === m ? '#4361ee' : '#1a1a1a',
                color:       subMode === m ? '#fff'    : '#aaa',
                borderColor: subMode === m ? '#4361ee' : '#333',
              }}>
                {m === 'isw' ? 'ISW Superposition' : 'HO Coherent'}
              </button>
            ))}
          </div>

          {subMode === 'isw' ? (
            <ISWControls
              L={L} setL={setL}
              coeffs={coeffs} setCoeff={setCoeff}
              normCoeffs={normCoeffs}
              applyPreset={applyPreset}
              tRev={tRev}
              t={t}
            />
          ) : (
            <HOControls
              omega={omega} setOmega={setOmega}
              alpha={alpha} setAlpha={setAlpha}
              phiAlpha={phiAlpha} setPhiAlpha={setPhiAlpha}
              t={t} xExp={hoCoherentExpectX(t, alpha, phiAlpha, omega)}
              pExp={hoCoherentExpectP(t, alpha, phiAlpha, omega)}
            />
          )}

          {/* Animation controls */}
          <div style={{ borderTop: '1px solid #222', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <button onClick={() => setPlaying(p => !p)} style={controlBtnStyle}>
                {playing ? '⏸' : '▶'}
              </button>
              <button onClick={reset} style={controlBtnStyle}>⏹</button>
              <button
                onClick={() => setLoop(l => !l)}
                style={{ ...controlBtnStyle, borderColor: loop ? '#4361ee' : '#333', color: loop ? '#4361ee' : '#888' }}
                title="Loop"
              >↺</button>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              {SPEEDS.map((s, i) => (
                <button key={s} onClick={() => setSpeedIdx(i)} style={{
                  ...controlBtnStyle, padding: '0.15rem 0.35rem', fontSize: '0.72rem',
                  background: speedIdx === i ? '#2a2a2a' : '#1a1a1a',
                  borderColor: speedIdx === i ? '#555' : '#333',
                  color: speedIdx === i ? '#fff' : '#888',
                }}>{s}×</button>
              ))}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#888', fontVariantNumeric: 'tabular-nums' }}>
              t = {t.toFixed(2)} a.u.
              {subMode === 'isw' && (
                <span style={{ color: '#555', marginLeft: 6 }}>
                  ({(t / tRev * 100).toFixed(0)}% T<sub>rev</sub>)
                </span>
              )}
            </div>

            {/* Display mode */}
            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
              {(['prob', 're', 'im'] as DisplayMode[]).map(m => (
                <button key={m} onClick={() => setDisplayMode(m)} style={{
                  ...controlBtnStyle, fontSize: '0.72rem',
                  background: displayMode === m ? '#2a2a2a' : '#1a1a1a',
                  borderColor: displayMode === m ? '#555' : '#333',
                  color: displayMode === m ? '#fff' : '#888',
                }}>
                  {m === 'prob' ? '|ψ|²' : m === 're' ? 'Re(ψ)' : 'Im(ψ)'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Plots ── */}
        <div style={{ flex: '1 1 420px', minWidth: 320, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Main wavepacket plot */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.82rem', color: '#aaa', fontWeight: 600 }}>
                {displayMode === 'prob' ? '|ψ(x,t)|²' : displayMode === 're' ? 'Re ψ(x,t)' : 'Im ψ(x,t)'}
              </span>
              <HelpButton onClick={() => setShowHelpMain(true)} />
            </div>
            <MainWavepacketPlot
              subMode={subMode}
              displayMode={displayMode}
              iswData={iswData}
              hoData={hoData}
              L={L}
            />
          </div>

          {/* Energy decomposition */}
          <details style={detailsStyle} open>
            <summary style={summaryStyle}>
              Energy decomposition |cₙ|²
              <span onClick={e => { e.preventDefault(); e.stopPropagation(); setShowHelpDecomp(true) }}
                style={{ marginLeft: 8 }}>
                <HelpButton onClick={() => setShowHelpDecomp(true)} />
              </span>
            </summary>
            <EnergyDecompPlot labels={decompData.labels} weights={decompData.weights} />
          </details>

          {/* Expectation values */}
          <details style={detailsStyle} open>
            <summary style={summaryStyle}>
              Expectation values ⟨x(t)⟩, ⟨p(t)⟩
              <span onClick={e => { e.preventDefault(); e.stopPropagation(); setShowHelpExpect(true) }}
                style={{ marginLeft: 8 }}>
                <HelpButton onClick={() => setShowHelpExpect(true)} />
              </span>
            </summary>
            <ExpectationValuesPlot hist={hist} t={t} />
          </details>

          {/* Norm history */}
          <details style={detailsStyle}>
            <summary style={summaryStyle}>
              Norm history
              <span onClick={e => { e.preventDefault(); e.stopPropagation(); setShowHelpNorm(true) }}
                style={{ marginLeft: 8 }}>
                <HelpButton onClick={() => setShowHelpNorm(true)} />
              </span>
            </summary>
            <NormPlot hist={hist} />
          </details>

        </div>
      </div>
    </>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ISWControls({ L, setL, coeffs, setCoeff, normCoeffs, applyPreset, tRev, t }: {
  L: number; setL: (v: number) => void
  coeffs: number[]; setCoeff: (i: number, v: number) => void
  normCoeffs: number[]; applyPreset: (name: string) => void
  tRev: number; t: number
}) {
  const norm2 = coeffs.reduce((s, c) => s + c * c, 0)

  return (
    <>
      <ParameterSlider label="Well width L" value={L} min={2} max={20} step={0.5} unit="a.u."
        description="T_rev = 4L²/π" onChange={setL} />

      <div style={{ fontSize: '0.78rem', color: '#aaa', marginBottom: '0.4rem' }}>
        T<sub>rev</sub> = {tRev.toFixed(1)} a.u.
      </div>

      <div style={{ fontSize: '0.8rem', color: '#aaa', fontWeight: 600, marginBottom: '0.3rem' }}>
        Coefficients cₙ
        <span style={{ color: Math.abs(norm2 - 1) < 0.005 ? '#06d6a0' : '#f77f00', marginLeft: 8, fontSize: '0.72rem' }}>
          Σ|cₙ|² = {norm2.toFixed(3)}
        </span>
      </div>

      {/* Preset buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
        {Object.keys(PRESETS).map(name => (
          <button key={name} onClick={() => applyPreset(name)} style={{
            ...btnStyle, fontSize: '0.67rem', padding: '0.2rem 0.4rem',
          }}>{name}</button>
        ))}
      </div>

      {/* Per-level sliders */}
      <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
        {coeffs.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#888', width: 20 }}>n={i + 1}</span>
            <input
              type="range" min={-1} max={1} step={0.01} value={c}
              style={{ flex: 1, accentColor: '#4361ee' }}
              onChange={e => setCoeff(i, Number(e.target.value))}
            />
            <span style={{ fontSize: '0.7rem', color: normCoeffs[i] * normCoeffs[i] > 0.01 ? '#4361ee' : '#444', width: 36, textAlign: 'right' }}>
              {c.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

function HOControls({ omega, setOmega, alpha, setAlpha, phiAlpha, setPhiAlpha, t, xExp, pExp }: {
  omega: number; setOmega: (v: number) => void
  alpha: number; setAlpha: (v: number) => void
  phiAlpha: number; setPhiAlpha: (v: number) => void
  t: number; xExp: number; pExp: number
}) {
  return (
    <>
      <ParameterSlider label="Frequency ω" value={omega} min={0.2} max={3.0} step={0.05} unit="a.u."
        description="Period T = 2π/ω" onChange={setOmega} />
      <ParameterSlider label="Displacement |α|" value={alpha} min={0} max={4} step={0.05}
        description="Mean photon number n̄ = |α|²" onChange={setAlpha} />
      <ParameterSlider label="Phase φ_α" value={phiAlpha} min={0} max={2 * Math.PI} step={0.05} unit="rad"
        description="Initial phase of oscillation" onChange={setPhiAlpha} />

      <table style={{ fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums', width: '100%', marginTop: '0.5rem' }}>
        <tbody>
          <tr><td style={tdL}>⟨x(t)⟩</td><td style={tdR}>{xExp.toFixed(4)} a.u.</td></tr>
          <tr><td style={tdL}>⟨p(t)⟩</td><td style={tdR}>{pExp.toFixed(4)} a.u.</td></tr>
          <tr><td style={tdL}>Δx</td><td style={tdR}>{hoCoherentDeltaX(omega).toFixed(4)} a.u.</td></tr>
          <tr><td style={tdL}>Δp</td><td style={tdR}>{hoCoherentDeltaP(omega).toFixed(4)} a.u.</td></tr>
          <tr>
            <td style={tdL}>Δx·Δp</td>
            <td style={{ ...tdR, color: '#06d6a0' }}>
              {(hoCoherentDeltaX(omega) * hoCoherentDeltaP(omega)).toFixed(4)} (= ħ/2)
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

function MainWavepacketPlot({ subMode, displayMode, iswData, hoData, L }: {
  subMode: SubMode
  displayMode: DisplayMode
  iswData: { xGrid: number[]; yProb: number[]; yPsi: number[] | null; xExp: number }
  hoData: { xGrid: number[]; yProb: number[]; xExp: number }
  L: number
}) {
  const { xGrid, yProb, yPsi, xExp } = subMode === 'isw'
    ? { ...iswData, yPsi: iswData.yPsi }
    : { ...hoData, yPsi: null }

  const yData = (displayMode !== 'prob' && yPsi) ? yPsi : yProb
  const yLabel = displayMode === 'prob' ? '|ψ|²' : displayMode === 're' ? 'Re ψ' : 'Im ψ'
  const traceColor = displayMode === 'prob' ? DARK.accent : displayMode === 're' ? DARK.green : DARK.orange

  const traces: object[] = [
    {
      x: xGrid, y: yData,
      mode: 'lines', line: { color: traceColor, width: 2 },
      name: yLabel,
    },
    // ⟨x⟩ marker
    {
      x: [xExp, xExp], y: [0, Math.max(...yData.map(Math.abs)) * 1.05],
      mode: 'lines', line: { color: '#f77f00', width: 1.5, dash: 'dash' },
      name: '⟨x⟩',
    },
  ]

  if (subMode === 'isw' && displayMode === 'prob') {
    // show Re and Im as faint overlays
    // (computed lazily — skip to keep render fast)
  }

  const xRange = subMode === 'isw' ? [-0.05 * L, 1.05 * L] : [xGrid[0], xGrid[xGrid.length - 1]]

  const layout = {
    ...darkLayout({ height: 280 }),
    xaxis: axis('x (a.u.)', { range: xRange }),
    yaxis: axis(yLabel),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 11 } },
  }

  return (
    <Plot
      data={traces as any}
      layout={layout as any}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: '100%' }}
    />
  )
}

function EnergyDecompPlot({ labels, weights }: { labels: string[]; weights: number[] }) {
  const traces = [{
    type: 'bar',
    x: labels,
    y: weights,
    marker: {
      color: weights.map((w, i) => `hsl(${220 + i * 15}, 70%, ${40 + w * 40}%)`)
    },
    hovertemplate: '%{x}: %{y:.3f}<extra></extra>',
  }]

  const layout = {
    ...darkLayout({ height: 220 }),
    xaxis: axis('n'),
    yaxis: axis('|cₙ|²', { range: [0, 1.05] }),
    bargap: 0.25,
  }

  return (
    <Plot
      data={traces as any}
      layout={layout as any}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: '100%' }}
    />
  )
}

function ExpectationValuesPlot({ hist, t }: {
  hist: { t: number; x: number; p: number; dx: number; dp: number; dxdp: number }[]
  t: number
}) {
  if (hist.length === 0) return null

  const ts = hist.map(h => h.t)
  const xs = hist.map(h => h.x)
  const ps = hist.map(h => h.p)
  const dxs = hist.map(h => h.dx)
  const dps = hist.map(h => h.dp)
  const dxdps = hist.map(h => h.dxdp)

  const traces: object[] = [
    { x: ts, y: xs, mode: 'lines', line: { color: DARK.accent, width: 1.5 }, name: '⟨x⟩', xaxis: 'x', yaxis: 'y' },
    { x: ts, y: ps, mode: 'lines', line: { color: DARK.orange, width: 1.5 }, name: '⟨p⟩', xaxis: 'x', yaxis: 'y' },
    { x: ts, y: dxs, mode: 'lines', line: { color: DARK.accent, width: 1.5, dash: 'dot' }, name: 'Δx', xaxis: 'x', yaxis: 'y2' },
    { x: ts, y: dps, mode: 'lines', line: { color: DARK.orange, width: 1.5, dash: 'dot' }, name: 'Δp', xaxis: 'x', yaxis: 'y2' },
    { x: ts, y: dxdps, mode: 'lines', line: { color: DARK.green, width: 2 }, name: 'Δx·Δp', xaxis: 'x', yaxis: 'y2' },
    // ħ/2 bound
    { x: [ts[0] ?? 0, ts[ts.length - 1] ?? 1], y: [0.5, 0.5], mode: 'lines',
      line: { color: DARK.red, width: 1, dash: 'dash' }, name: 'ħ/2', xaxis: 'x', yaxis: 'y2' },
  ]

  const layout = {
    ...darkLayout({ height: 320 }),
    grid: { rows: 2, columns: 1, pattern: 'independent', roworder: 'top to bottom' },
    xaxis: axis('t (a.u.)'),
    yaxis: axis('⟨x⟩, ⟨p⟩'),
    xaxis2: axis('t (a.u.)'),
    yaxis2: axis('Δx, Δp, Δx·Δp'),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 10 } },
    margin: { l: 55, r: 20, t: 16, b: 50 },
    height: 360,
  }

  return (
    <Plot
      data={traces as any}
      layout={layout as any}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: '100%' }}
    />
  )
}

function NormPlot({ hist }: {
  hist: { t: number }[]
}) {
  if (hist.length === 0) return null
  const ts = hist.map(h => h.t)

  const traces = [{
    x: ts, y: ts.map(() => 1.0),
    mode: 'lines', line: { color: DARK.green, width: 2 },
    name: '||ψ||² = 1 (exact)',
  }]

  const layout = {
    ...darkLayout({ height: 180 }),
    xaxis: axis('t (a.u.)'),
    yaxis: axis('norm', { range: [0.9, 1.1] }),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 11 } },
  }

  return (
    <Plot
      data={traces as any}
      layout={layout as any}
      config={{ displayModeBar: false, responsive: true }}
      style={{ width: '100%' }}
    />
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────

const detailsStyle: React.CSSProperties = { borderTop: '1px solid #222', paddingTop: '0.75rem' }
const summaryStyle: React.CSSProperties = {
  cursor: 'pointer', userSelect: 'none',
  fontSize: '0.9rem', fontWeight: 600, color: '#aaa', marginBottom: '0.75rem',
  display: 'flex', alignItems: 'center',
}
const btnStyle: React.CSSProperties = {
  flex: 1, padding: '0.3rem 0.5rem',
  border: '1px solid #333', borderRadius: 4, cursor: 'pointer', fontSize: '0.78rem',
  background: '#1a1a1a', color: '#aaa',
}
const controlBtnStyle: React.CSSProperties = {
  padding: '0.25rem 0.55rem', border: '1px solid #333', borderRadius: 4,
  cursor: 'pointer', fontSize: '0.85rem', background: '#1a1a1a', color: '#ccc',
}
const tdL: React.CSSProperties = { color: '#aaa', paddingBottom: '0.25rem', fontSize: '0.82rem' }
const tdR: React.CSSProperties = { color: '#4361ee', textAlign: 'right', paddingBottom: '0.25rem', fontSize: '0.82rem' }
