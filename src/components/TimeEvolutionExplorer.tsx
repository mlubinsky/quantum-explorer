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
  hoSqueezedProb, hoSqueezedDeltaX, hoSqueezedDeltaP, hoSqueezedSigmaX,
  squeezedFockDist,
} from '../physics/timeEvolution'
import {
  iswMomentumProbTE, hoCoherentMomentumProb, hoSqueezedMomentumProb,
} from '../physics/momentumSpace'
import { TimeEvolutionInfoPanel } from './TimeEvolutionInfoPanel'

type SubMode = 'isw' | 'ho' | 'ho-sq'
type DisplayMode = 'prob' | 're' | 'im'

const SPEEDS = [0.25, 0.5, 1, 2, 5]
const N_LEVELS = 8
const N_POINTS = 400
const N_MOM = 300

const DEFAULT_COEFFS = Array.from({ length: N_LEVELS }, (_, i) => i === 0 ? 1 : 0)

const PRESETS: Record<string, number[]> = {
  'Ground state':  [1,0,0,0,0,0,0,0],
  '1+2 equal mix': [1/Math.SQRT2, 1/Math.SQRT2, 0,0,0,0,0,0],
  '1+2+3 mix':     [1/Math.sqrt(3), 1/Math.sqrt(3), 1/Math.sqrt(3), 0,0,0,0,0],
  'Gaussian env':  buildGaussianEnv(),
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

function darkLayout(extra: Record<string, unknown> = {}) {
  return {
    paper_bgcolor: DARK.paper, plot_bgcolor: DARK.plot,
    font: { color: DARK.text, size: 12 },
    margin: { l: 55, r: 20, t: 28, b: 50 },
    height: 260,
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

function makeISWGrid(L: number): number[] {
  return Array.from({ length: N_POINTS }, (_, i) => (i / (N_POINTS - 1)) * L)
}

function makeHOGrid(omega: number): number[] {
  const xMax = Math.sqrt((2 * N_LEVELS + 1) / omega) * 1.8 + 1.5
  return Array.from({ length: N_POINTS }, (_, i) => -xMax + (2 * xMax * i) / (N_POINTS - 1))
}

function makeISWMomGrid(L: number): number[] {
  const kMax = Math.max(5 * N_LEVELS * Math.PI / L, 10 / L)
  return Array.from({ length: N_MOM }, (_, i) => -kMax + (2 * kMax * i) / (N_MOM - 1))
}

function makeHOMomGrid(omega: number, alpha: number, r = 0): number[] {
  const halfWidth = Math.exp(r) * Math.sqrt(omega / 2) * 5 + Math.abs(alpha) * Math.sqrt(2 * omega) + 1
  return Array.from({ length: N_MOM }, (_, i) => -halfWidth + (2 * halfWidth * i) / (N_MOM - 1))
}

// ── Main component ───────────────────────────────────────────────────────────

export function TimeEvolutionExplorer() {
  const [subMode, setSubMode] = useState<SubMode>('isw')

  // ISW state
  const [L, setL] = useState(10)
  const [coeffs, setCoeffs] = useState<number[]>(DEFAULT_COEFFS)

  // HO shared state
  const [omega, setOmega] = useState(1.0)
  const [alpha, setAlpha] = useState(1.5)
  const [phiAlpha, setPhiAlpha] = useState(0)

  // HO squeezed extra
  const [r, setR] = useState(0.8)

  // Animation
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(2)
  const [loop, setLoop] = useState(true)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('prob')

  // Collapsible sections
  const [showDecomp, setShowDecomp] = useState(true)
  const [showExpect, setShowExpect] = useState(true)
  const [showMom,    setShowMom]    = useState(false)
  const [showNorm,   setShowNorm]   = useState(false)

  // Help modals
  const [showHelpModes,    setShowHelpModes]    = useState(false)
  const [showHelpMain,     setShowHelpMain]     = useState(false)
  const [showHelpDecomp,   setShowHelpDecomp]   = useState(false)
  const [showHelpExpect,   setShowHelpExpect]   = useState(false)
  const [showHelpNorm,     setShowHelpNorm]     = useState(false)
  const [showHelpMomentum, setShowHelpMomentum] = useState(false)

  const rafRef    = useRef<number>()
  const lastTsRef = useRef<number>()

  const tMax   = subMode === 'isw' ? 2 * iswRevivalPeriod(L) : 4 * Math.PI / omega
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

  const normCoeffs = useMemo(() => normalise(coeffs), [coeffs])
  const tRev       = iswRevivalPeriod(L)

  function setCoeff(i: number, v: number) {
    setCoeffs(prev => { const c = [...prev]; c[i] = v; return c })
  }
  function applyPreset(name: string) { setCoeffs(PRESETS[name] ?? DEFAULT_COEFFS); reset() }

  // ── Position-space data ───────────────────────────────────────────────────

  const iswData = useMemo(() => {
    const xGrid = makeISWGrid(L)
    const yProb = xGrid.map(x => iswProb(x, t, normCoeffs, L))
    const yPsi: number[] | null = (displayMode === 're' || displayMode === 'im')
      ? xGrid.map(x => { const { re, im } = iswPsiTE(x, t, normCoeffs, L); return displayMode === 're' ? re : im })
      : null
    return { xGrid, yProb, yPsi, xExp: iswExpectX(t, normCoeffs, L) }
  }, [t, normCoeffs, L, displayMode])

  const hoData = useMemo(() => {
    const xGrid = makeHOGrid(omega)
    const yProb = xGrid.map(x => hoCoherentProb(x, t, alpha, phiAlpha, omega))
    return { xGrid, yProb, xExp: hoCoherentExpectX(t, alpha, phiAlpha, omega) }
  }, [t, alpha, phiAlpha, omega])

  const hoSqData = useMemo(() => {
    const xGrid = makeHOGrid(omega)
    const yProb = xGrid.map(x => hoSqueezedProb(x, t, alpha, phiAlpha, omega, r))
    return { xGrid, yProb, xExp: hoCoherentExpectX(t, alpha, phiAlpha, omega) }
  }, [t, alpha, phiAlpha, omega, r])

  // ── Momentum-space data ───────────────────────────────────────────────────

  const momData = useMemo(() => {
    if (subMode === 'isw') {
      const kGrid = makeISWMomGrid(L)
      const yMom = kGrid.map(k => iswMomentumProbTE(k, t, normCoeffs, L))
      return { kGrid, yMom }
    } else if (subMode === 'ho') {
      const kGrid = makeHOMomGrid(omega, alpha, 0)
      const yMom = kGrid.map(k => hoCoherentMomentumProb(k, t, alpha, phiAlpha, omega))
      return { kGrid, yMom }
    } else {
      const kGrid = makeHOMomGrid(omega, alpha, r)
      const yMom = kGrid.map(k => hoSqueezedMomentumProb(k, t, alpha, phiAlpha, omega, r))
      return { kGrid, yMom }
    }
  }, [subMode, t, normCoeffs, L, alpha, phiAlpha, omega, r])

  // ── Expectation-values history ────────────────────────────────────────────

  const histRef = useRef<{ t: number; x: number; p: number; dx: number; dp: number; dxdp: number }[]>([])

  // Reset history whenever physical parameters change so old values don't mix with new regime
  useEffect(() => {
    histRef.current = []
  }, [subMode, normCoeffs, L, alpha, phiAlpha, omega, r])

  useEffect(() => {
    let entry: { t: number; x: number; p: number; dx: number; dp: number; dxdp: number }
    if (subMode === 'isw') {
      const x  = iswExpectX(t, normCoeffs, L)
      const p  = iswExpectP(t, normCoeffs, L)
      const x2 = iswExpectX2(t, normCoeffs, L)
      const p2 = iswExpectP2(normCoeffs, L)
      const dx = Math.sqrt(Math.max(0, x2 - x * x))
      const dp = Math.sqrt(Math.max(0, p2 - p * p))
      entry = { t, x, p, dx, dp, dxdp: dx * dp }
    } else if (subMode === 'ho') {
      const x  = hoCoherentExpectX(t, alpha, phiAlpha, omega)
      const p  = hoCoherentExpectP(t, alpha, phiAlpha, omega)
      const dx = hoCoherentDeltaX(omega)
      const dp = hoCoherentDeltaP(omega)
      entry = { t, x, p, dx, dp, dxdp: dx * dp }
    } else {
      const x  = hoCoherentExpectX(t, alpha, phiAlpha, omega)
      const p  = hoCoherentExpectP(t, alpha, phiAlpha, omega)
      const dx = hoSqueezedDeltaX(t, omega, r)
      const dp = hoSqueezedDeltaP(t, omega, r)
      entry = { t, x, p, dx, dp, dxdp: dx * dp }
    }
    histRef.current = [...histRef.current.slice(-399), entry]
  }, [t, subMode, normCoeffs, L, alpha, phiAlpha, omega, r])

  // ── Energy decomposition ──────────────────────────────────────────────────

  const decompData = useMemo(() => {
    if (subMode === 'isw') {
      return {
        labels:  normCoeffs.map((_, i) => `n=${i + 1}`),
        weights: normCoeffs.map(c => c * c),
      }
    }
    const nMax = 16
    if (subMode === 'ho-sq') {
      const weights = squeezedFockDist(alpha, phiAlpha, omega, r, nMax)
      return { labels: Array.from({ length: nMax }, (_, n) => `n=${n}`), weights }
    }
    // Coherent state: Poisson distribution P(n) = e^{-|α|²} |α|^{2n} / n!
    const exp2 = Math.exp(-alpha * alpha)
    let pow = 1, fac = 1
    const weights = Array.from({ length: nMax }, (_, n) => {
      if (n > 0) { pow *= alpha * alpha; fac *= n }
      return exp2 * pow / fac
    })
    return { labels: Array.from({ length: nMax }, (_, n) => `n=${n}`), weights }
  }, [subMode, normCoeffs, alpha, phiAlpha, omega, r])

  // ── Render ────────────────────────────────────────────────────────────────

  const hist = histRef.current
  const curPosData = subMode === 'isw' ? iswData : subMode === 'ho' ? hoData : hoSqData

  // Current squeezed uncertainties for readout
  const sqDx = subMode === 'ho-sq' ? hoSqueezedDeltaX(t, omega, r) : null
  const sqDp = subMode === 'ho-sq' ? hoSqueezedDeltaP(t, omega, r) : null

  return (
    <>
      {showHelpModes    && <HelpModal title="Time Evolution — Sub-modes"   onClose={() => setShowHelpModes(false)}>    <TimeEvolutionInfoPanel topic="modes"    subMode={subMode} /></HelpModal>}
      {showHelpMain     && <HelpModal title="Time Evolution — Physics"    onClose={() => setShowHelpMain(false)}>    <TimeEvolutionInfoPanel topic="main"     subMode={subMode} /></HelpModal>}
      {showHelpDecomp   && <HelpModal title="Energy Decomposition"        onClose={() => setShowHelpDecomp(false)}>  <TimeEvolutionInfoPanel topic="decomp"   subMode={subMode} /></HelpModal>}
      {showHelpExpect   && <HelpModal title="Expectation Values"          onClose={() => setShowHelpExpect(false)}>  <TimeEvolutionInfoPanel topic="expect"   subMode={subMode} /></HelpModal>}
      {showHelpNorm     && <HelpModal title="Norm Conservation"           onClose={() => setShowHelpNorm(false)}>    <TimeEvolutionInfoPanel topic="norm"     subMode={subMode} /></HelpModal>}
      {showHelpMomentum && <HelpModal title="Momentum-space |φ(k,t)|²"   onClose={() => setShowHelpMomentum(false)}><TimeEvolutionInfoPanel topic="momentum" subMode={subMode} /></HelpModal>}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

        {/* ── Controls ── */}
        <div style={{ flex: '0 0 240px', minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Time Evolution</h3>
            <HelpButton onClick={() => setShowHelpModes(true)} />
          </div>

          {/* Sub-mode buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.5rem' }}>
            {([
              ['isw',   'ISW Superposition'],
              ['ho',    'HO Coherent'],
              ['ho-sq', 'HO Squeezed'],
            ] as [SubMode, string][]).map(([m, label]) => (
              <button key={m} onClick={() => { setSubMode(m); reset(); if (m !== 'isw') setDisplayMode('prob') }} style={{
                ...btnStyle,
                background:  subMode === m ? '#4361ee' : '#1a1a1a',
                color:       subMode === m ? '#fff'    : '#aaa',
                borderColor: subMode === m ? '#4361ee' : '#333',
              }}>{label}</button>
            ))}
          </div>

          {/* One-line description for selected mode */}
          <div style={{ fontSize: '0.72rem', color: '#666', marginBottom: '0.8rem', lineHeight: 1.4 }}>
            {subMode === 'isw' && 'Superposition Σ cₙ ψₙ e⁻ⁱEₙᵗ — beating, revivals at T_rev = 4L²/π'}
            {subMode === 'ho'  && 'Coherent state |α⟩ — Gaussian oscillates at ω, shape invariant, Δx·Δp = ħ/2'}
            {subMode === 'ho-sq' && 'Squeezed state D(α)S(r)|0⟩ — Gaussian breathes at 2ω, width oscillates ±e^r'}
          </div>

          {subMode === 'isw' && (
            <ISWControls L={L} setL={setL} coeffs={coeffs} setCoeff={setCoeff}
              normCoeffs={normCoeffs} applyPreset={applyPreset} tRev={tRev} t={t} />
          )}
          {subMode === 'ho' && (
            <HOCoherentControls omega={omega} setOmega={setOmega} alpha={alpha} setAlpha={setAlpha}
              phiAlpha={phiAlpha} setPhiAlpha={setPhiAlpha}
              xExp={hoCoherentExpectX(t, alpha, phiAlpha, omega)}
              pExp={hoCoherentExpectP(t, alpha, phiAlpha, omega)} />
          )}
          {subMode === 'ho-sq' && (
            <HOSqueezedControls omega={omega} setOmega={setOmega} alpha={alpha} setAlpha={setAlpha}
              phiAlpha={phiAlpha} setPhiAlpha={setPhiAlpha} r={r} setR={setR}
              t={t}
              xExp={hoCoherentExpectX(t, alpha, phiAlpha, omega)}
              pExp={hoCoherentExpectP(t, alpha, phiAlpha, omega)}
              dx={sqDx!} dp={sqDp!} />
          )}

          {/* Animation controls */}
          <div style={{ borderTop: '1px solid #222', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.5rem' }}>
              <button onClick={() => setPlaying(p => !p)} style={controlBtnStyle}>{playing ? '⏸' : '▶'}</button>
              <button onClick={reset} style={controlBtnStyle}>⏹</button>
              <button onClick={() => setLoop(l => !l)}
                style={{ ...controlBtnStyle, borderColor: loop ? '#4361ee' : '#333', color: loop ? '#4361ee' : '#888' }}
                title="Loop">↺</button>
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
                <span style={{ color: '#555', marginLeft: 6 }}>({(t / tRev * 100).toFixed(0)}% T<sub>rev</sub>)</span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.5rem' }}>
              {(subMode === 'isw' ? ['prob', 're', 'im'] : ['prob'] as DisplayMode[]).map(m => (
                <button key={m} onClick={() => setDisplayMode(m as DisplayMode)} style={{
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

        {/* ── Plots ── */}
        <div style={{ flex: '1 1 420px', minWidth: 320, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Main wavepacket */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
              <span style={{ fontSize: '0.82rem', color: '#aaa', fontWeight: 600 }}>
                {displayMode === 'prob' ? '|ψ(x,t)|²' : displayMode === 're' ? 'Re ψ(x,t)' : 'Im ψ(x,t)'}
              </span>
              <HelpButton onClick={() => setShowHelpMain(true)} />
            </div>
            <MainWavepacketPlot subMode={subMode} displayMode={displayMode}
              posData={curPosData} iswPsiData={iswData} L={L} />
          </div>

          {/* Energy decomposition */}
          <div style={detailsStyle}>
            <div style={sectionHeaderStyle}>
              <button style={sectionToggleStyle} onClick={() => setShowDecomp(p => !p)}>
                {showDecomp ? '▾' : '▸'} Energy decomposition |cₙ|²
              </button>
              <HelpButton onClick={() => setShowHelpDecomp(true)} />
            </div>
            {showDecomp && <EnergyDecompPlot labels={decompData.labels} weights={decompData.weights} />}
          </div>

          {/* Expectation values */}
          <div style={detailsStyle}>
            <div style={sectionHeaderStyle}>
              <button style={sectionToggleStyle} onClick={() => setShowExpect(p => !p)}>
                {showExpect ? '▾' : '▸'} Expectation values ⟨x(t)⟩, ⟨p(t)⟩
              </button>
              <HelpButton onClick={() => setShowHelpExpect(true)} />
            </div>
            {showExpect && <ExpectationValuesPlot hist={hist} />}
          </div>

          {/* Momentum-space */}
          <div style={detailsStyle}>
            <div style={sectionHeaderStyle}>
              <button style={sectionToggleStyle} onClick={() => setShowMom(p => !p)}>
                {showMom ? '▾' : '▸'} Momentum-space |φ(k,t)|²
              </button>
              <HelpButton onClick={() => setShowHelpMomentum(true)} />
            </div>
            {showMom && <MomentumTEPlot kGrid={momData.kGrid} yMom={momData.yMom} />}
          </div>

          {/* Norm history */}
          <div style={detailsStyle}>
            <div style={sectionHeaderStyle}>
              <button style={sectionToggleStyle} onClick={() => setShowNorm(p => !p)}>
                {showNorm ? '▾' : '▸'} Norm conservation
              </button>
              <HelpButton onClick={() => setShowHelpNorm(true)} />
            </div>
            {showNorm && <NormPlot hist={hist} />}
          </div>

        </div>
      </div>
    </>
  )
}

// ── ISW controls ──────────────────────────────────────────────────────────────

function ISWControls({ L, setL, coeffs, setCoeff, normCoeffs, applyPreset, tRev, t: _t }: {
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
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.5rem' }}>
        {Object.keys(PRESETS).map(name => (
          <button key={name} onClick={() => applyPreset(name)}
            style={{ ...btnStyle, fontSize: '0.67rem', padding: '0.2rem 0.4rem' }}>{name}</button>
        ))}
      </div>
      <div style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
        {coeffs.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#888', width: 20 }}>n={i + 1}</span>
            <input type="range" min={-1} max={1} step={0.01} value={c}
              style={{ flex: 1, accentColor: '#4361ee' }}
              onChange={e => setCoeff(i, Number(e.target.value))} />
            <span style={{ fontSize: '0.7rem', width: 36, textAlign: 'right',
              color: normCoeffs[i] * normCoeffs[i] > 0.01 ? '#4361ee' : '#444' }}>
              {c.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

// ── HO coherent controls ──────────────────────────────────────────────────────

function HOCoherentControls({ omega, setOmega, alpha, setAlpha, phiAlpha, setPhiAlpha, xExp, pExp }: {
  omega: number; setOmega: (v: number) => void
  alpha: number; setAlpha: (v: number) => void
  phiAlpha: number; setPhiAlpha: (v: number) => void
  xExp: number; pExp: number
}) {
  return (
    <>
      <ParameterSlider label="Frequency ω" value={omega} min={0.2} max={3.0} step={0.05} unit="a.u."
        description="Period T = 2π/ω" onChange={setOmega} />
      <ParameterSlider label="Displacement |α|" value={alpha} min={0} max={4} step={0.05}
        description="n̄ = |α|² (mean energy level)" onChange={setAlpha} />
      <ParameterSlider label="Phase φ_α" value={phiAlpha} min={0} max={2 * Math.PI} step={0.05} unit="rad"
        description="Initial phase" onChange={setPhiAlpha} />
      <table style={{ fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums', width: '100%', marginTop: '0.5rem' }}>
        <tbody>
          <tr><td style={tdL}>⟨x(t)⟩</td><td style={tdR}>{xExp.toFixed(4)}</td></tr>
          <tr><td style={tdL}>⟨p(t)⟩</td><td style={tdR}>{pExp.toFixed(4)}</td></tr>
          <tr><td style={tdL}>Δx</td><td style={tdR}>{hoCoherentDeltaX(omega).toFixed(4)}</td></tr>
          <tr><td style={tdL}>Δp</td><td style={tdR}>{hoCoherentDeltaP(omega).toFixed(4)}</td></tr>
          <tr><td style={tdL}>Δx·Δp</td>
            <td style={{ ...tdR, color: '#06d6a0' }}>
              {(hoCoherentDeltaX(omega) * hoCoherentDeltaP(omega)).toFixed(4)} (= ħ/2)
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

// ── HO squeezed controls ──────────────────────────────────────────────────────

function HOSqueezedControls({ omega, setOmega, alpha, setAlpha, phiAlpha, setPhiAlpha,
    r, setR, t: _t, xExp, pExp, dx, dp }: {
  omega: number; setOmega: (v: number) => void
  alpha: number; setAlpha: (v: number) => void
  phiAlpha: number; setPhiAlpha: (v: number) => void
  r: number; setR: (v: number) => void
  t: number; xExp: number; pExp: number; dx: number; dp: number
}) {
  const dxdp = dx * dp
  const isMinUncertainty = Math.abs(dxdp - 0.5) < 0.01
  return (
    <>
      <ParameterSlider label="Frequency ω" value={omega} min={0.2} max={3.0} step={0.05} unit="a.u."
        description="Breathing T_sq = π/ω" onChange={setOmega} />
      <ParameterSlider label="Displacement |α|" value={alpha} min={0} max={4} step={0.05}
        description="Centre of oscillation" onChange={setAlpha} />
      <ParameterSlider label="Phase φ_α" value={phiAlpha} min={0} max={2 * Math.PI} step={0.05} unit="rad"
        description="Initial phase" onChange={setPhiAlpha} />
      <ParameterSlider label="Squeeze r" value={r} min={0} max={2} step={0.05}
        description={`Δx range: ${Math.exp(-r).toFixed(2)}–${Math.exp(r).toFixed(2)} × 1/√(2ω)`}
        onChange={setR} />
      <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.3rem' }}>
        Breathing period T<sub>sq</sub> = π/ω = {(Math.PI / omega).toFixed(2)} a.u.
      </div>
      <table style={{ fontSize: '0.82rem', fontVariantNumeric: 'tabular-nums', width: '100%', marginTop: '0.3rem' }}>
        <tbody>
          <tr><td style={tdL}>⟨x(t)⟩</td><td style={tdR}>{xExp.toFixed(4)}</td></tr>
          <tr><td style={tdL}>⟨p(t)⟩</td><td style={tdR}>{pExp.toFixed(4)}</td></tr>
          <tr><td style={tdL}>Δx(t)</td><td style={tdR}>{dx.toFixed(4)}</td></tr>
          <tr><td style={tdL}>Δp(t)</td><td style={tdR}>{dp.toFixed(4)}</td></tr>
          <tr><td style={tdL}>Δx·Δp</td>
            <td style={{ ...tdR, color: isMinUncertainty ? '#06d6a0' : '#f77f00' }}>
              {dxdp.toFixed(4)} {isMinUncertainty ? '(= ħ/2)' : '(> ħ/2)'}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  )
}

// ── Plot sub-components ───────────────────────────────────────────────────────

function MainWavepacketPlot({ subMode, displayMode, posData, iswPsiData, L }: {
  subMode: SubMode; displayMode: DisplayMode
  posData: { xGrid: number[]; yProb: number[]; xExp: number }
  iswPsiData: { yPsi: number[] | null }
  L: number
}) {
  const { xGrid, yProb, xExp } = posData
  const yData = (subMode === 'isw' && displayMode !== 'prob' && iswPsiData.yPsi)
    ? iswPsiData.yPsi
    : yProb
  const yLabel   = displayMode === 'prob' ? '|ψ|²' : displayMode === 're' ? 'Re ψ' : 'Im ψ'
  const lineColor = displayMode === 'prob' ? DARK.accent : displayMode === 're' ? DARK.green : DARK.orange
  const yPeak = Math.max(...yData.map(Math.abs)) || 1

  const traces: object[] = [
    { x: xGrid, y: yData, mode: 'lines', line: { color: lineColor, width: 2 }, name: yLabel },
    { x: [xExp, xExp], y: [0, yPeak * 1.08], mode: 'lines',
      line: { color: DARK.orange, width: 1.5, dash: 'dash' }, name: '⟨x⟩' },
  ]

  const xRange = subMode === 'isw'
    ? [-0.05 * L, 1.05 * L]
    : [xGrid[0], xGrid[xGrid.length - 1]]

  const layout = {
    ...darkLayout({ height: 280 }),
    xaxis: axis('x (a.u.)', { range: xRange }),
    yaxis: axis(yLabel),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 11 } },
  }
  return <Plot data={traces as any} layout={layout as any} config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
}

function EnergyDecompPlot({ labels, weights }: { labels: string[]; weights: number[] }) {
  const traces = [{
    type: 'bar', x: labels, y: weights,
    marker: { color: weights.map((w, i) => `hsl(${220 + i * 15}, 70%, ${40 + w * 40}%)`) },
    hovertemplate: '%{x}: %{y:.3f}<extra></extra>',
  }]
  const layout = { ...darkLayout({ height: 220 }), xaxis: axis('n'), yaxis: axis('|cₙ|²', { range: [0, 1.05] }), bargap: 0.25 }
  return <Plot data={traces as any} layout={layout as any} config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
}

function MomentumTEPlot({ kGrid, yMom }: { kGrid: number[]; yMom: number[] }) {
  const traces = [{
    x: kGrid, y: yMom, mode: 'lines',
    line: { color: '#9b59b6', width: 2 }, name: '|φ(k,t)|²',
  }]
  const layout = {
    ...darkLayout({ height: 240 }),
    xaxis: axis('k (a.u.)'),
    yaxis: axis('|φ(k,t)|²'),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 11 } },
  }
  return <Plot data={traces as any} layout={layout as any} config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
}

function ExpectationValuesPlot({ hist }: {
  hist: { t: number; x: number; p: number; dx: number; dp: number; dxdp: number }[]
}) {
  if (hist.length === 0) return null
  const ts    = hist.map(h => h.t)
  const tEnd  = ts[ts.length - 1] ?? 1
  const traces: object[] = [
    { x: ts, y: hist.map(h => h.x),    mode: 'lines', line: { color: DARK.accent, width: 1.5 }, name: '⟨x⟩', xaxis: 'x', yaxis: 'y' },
    { x: ts, y: hist.map(h => h.p),    mode: 'lines', line: { color: DARK.orange, width: 1.5 }, name: '⟨p⟩', xaxis: 'x', yaxis: 'y' },
    { x: ts, y: hist.map(h => h.dx),   mode: 'lines', line: { color: DARK.accent, width: 1.5, dash: 'dot' }, name: 'Δx', xaxis: 'x2', yaxis: 'y2' },
    { x: ts, y: hist.map(h => h.dp),   mode: 'lines', line: { color: DARK.orange, width: 1.5, dash: 'dot' }, name: 'Δp', xaxis: 'x2', yaxis: 'y2' },
    { x: ts, y: hist.map(h => h.dxdp), mode: 'lines', line: { color: DARK.green,  width: 2 }, name: 'Δx·Δp', xaxis: 'x2', yaxis: 'y2' },
    { x: [ts[0] ?? 0, tEnd], y: [0.5, 0.5], mode: 'lines',
      line: { color: DARK.red, width: 1, dash: 'dash' }, name: 'ħ/2', xaxis: 'x2', yaxis: 'y2' },
  ]
  const layout = {
    ...darkLayout({ height: 360 }),
    grid: { rows: 2, columns: 1, pattern: 'independent', roworder: 'top to bottom' },
    xaxis:  axis('t (a.u.)'),
    yaxis:  axis('⟨x⟩, ⟨p⟩'),
    xaxis2: axis('t (a.u.)'),
    yaxis2: axis('Δx, Δp, Δx·Δp'),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 10 } },
    margin: { l: 55, r: 20, t: 16, b: 50 },
  }
  return <Plot data={traces as any} layout={layout as any} config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
}

function NormPlot({ hist }: { hist: { t: number }[] }) {
  if (hist.length === 0) return null
  const ts = hist.map(h => h.t)
  const traces = [{
    x: ts, y: ts.map(() => 1.0), mode: 'lines',
    line: { color: DARK.green, width: 2 }, name: '||ψ||² = 1 (exact)',
  }]
  const layout = {
    ...darkLayout({ height: 180 }),
    xaxis: axis('t (a.u.)'),
    yaxis: axis('norm', { range: [0.9, 1.1] }),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 11 } },
  }
  return <Plot data={traces as any} layout={layout as any} config={{ displayModeBar: false, responsive: true }} style={{ width: '100%' }} />
}

// ── Styles ────────────────────────────────────────────────────────────────────

const detailsStyle: React.CSSProperties = { borderTop: '1px solid #222', paddingTop: '0.75rem' }
const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem',
}
const sectionToggleStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', userSelect: 'none',
  fontSize: '0.9rem', fontWeight: 600, color: '#aaa', padding: 0, textAlign: 'left',
}
const btnStyle: React.CSSProperties = {
  padding: '0.3rem 0.5rem', border: '1px solid #333', borderRadius: 4,
  cursor: 'pointer', fontSize: '0.78rem', background: '#1a1a1a', color: '#aaa',
}
const controlBtnStyle: React.CSSProperties = {
  padding: '0.25rem 0.55rem', border: '1px solid #333', borderRadius: 4,
  cursor: 'pointer', fontSize: '0.85rem', background: '#1a1a1a', color: '#ccc',
}
const tdL: React.CSSProperties = { color: '#aaa', paddingBottom: '0.25rem', fontSize: '0.82rem' }
const tdR: React.CSSProperties = { color: '#4361ee', textAlign: 'right', paddingBottom: '0.25rem', fontSize: '0.82rem' }
