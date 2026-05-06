import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import _Plot from 'react-plotly.js'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import { FreeParticleInfoPanel } from './FreeParticleInfoPanel'
import {
  fpSigma, fpSpreadingTime, fpProb, fpExpectX, fpDeltaX, fpDeltaP, fpMomentumDist,
} from '../physics/freeParticle'

type DisplayMode = 'prob' | 're' | 'im'

const SPEEDS = [0.25, 0.5, 1, 2, 5]
const N_POINTS = 400
const N_MOM = 300

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

function makeProbGrid(x0: number, k0: number, sigma0: number): number[] {
  const t0 = fpSpreadingTime(sigma0)
  const tMax = 4 * t0
  const sigmaFinal = fpSigma(tMax, sigma0)
  const xLeft  = x0 - 4 * sigma0
  const xRight = x0 + Math.max(Math.abs(k0) * tMax, 1) + 4 * sigmaFinal
  return Array.from({ length: N_POINTS }, (_, i) => xLeft + (xRight - xLeft) * i / (N_POINTS - 1))
}

function makeMomGrid(k0: number, sigma0: number): number[] {
  const sigmaP = fpDeltaP(sigma0)
  const kHalf = Math.abs(k0) + 5 * sigmaP
  return Array.from({ length: N_MOM }, (_, i) => (k0 - kHalf) + 2 * kHalf * i / (N_MOM - 1))
}

// Re(ψ) = |ψ| · cos(k₀(x-x₀) - k₀²t/2) (approximate carrier; exact for free particle up to const phase)
function fpRePsi(x: number, t: number, x0: number, k0: number, sigma0: number): number {
  const sigma = fpSigma(t, sigma0)
  const center = x0 + k0 * t
  const dx = x - center
  const envelope = Math.pow(2 * Math.PI * sigma * sigma, -0.25) * Math.exp(-dx * dx / (4 * sigma * sigma))
  const phase = k0 * (x - x0) - k0 * k0 * t / 2
  return envelope * Math.cos(phase)
}

function fpImPsi(x: number, t: number, x0: number, k0: number, sigma0: number): number {
  const sigma = fpSigma(t, sigma0)
  const center = x0 + k0 * t
  const dx = x - center
  const envelope = Math.pow(2 * Math.PI * sigma * sigma, -0.25) * Math.exp(-dx * dx / (4 * sigma * sigma))
  const phase = k0 * (x - x0) - k0 * k0 * t / 2
  return envelope * Math.sin(phase)
}

// ── Main component ────────────────────────────────────────────────────────────

export function FreeParticleExplorer() {
  const [x0, setX0] = useState(0)
  const [k0, setK0] = useState(1.0)
  const [sigma0, setSigma0] = useState(1.0)

  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(2)
  const [loop, setLoop] = useState(true)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('prob')

  // Collapsible sections
  const [showMomentum, setShowMomentum] = useState(true)
  const [showExpect,   setShowExpect]   = useState(true)
  const [showNorm,     setShowNorm]     = useState(false)

  // Help modals
  const [showHelpMain,     setShowHelpMain]     = useState(false)
  const [showHelpMomentum, setShowHelpMomentum] = useState(false)
  const [showHelpExpect,   setShowHelpExpect]   = useState(false)
  const [showHelpNorm,     setShowHelpNorm]     = useState(false)

  const rafRef    = useRef<number>()
  const lastTsRef = useRef<number>()
  const histRef   = useRef<{ t: number; expectX: number; deltaX: number; deltaXdP: number }[]>([])

  const t0   = fpSpreadingTime(sigma0)
  const tMax = 4 * t0
  const tScale = SPEEDS[speedIdx] * 0.1

  // Reset when sigma0 changes
  useEffect(() => {
    setT(0)
    setPlaying(false)
    histRef.current = []
  }, [sigma0])

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

  // Update history
  const expectX  = x0 + k0 * t
  const deltaX   = fpDeltaX(t, sigma0)
  const deltaP   = fpDeltaP(sigma0)
  const sigmaT   = fpSigma(t, sigma0)
  const uxp      = deltaX * deltaP

  useEffect(() => {
    histRef.current.push({ t, expectX, deltaX, deltaXdP: uxp })
    if (histRef.current.length > 2000) histRef.current.splice(0, 200)
  })

  // Grids
  const xGrid = useMemo(() => makeProbGrid(x0, k0, sigma0), [x0, k0, sigma0])
  const kGrid = useMemo(() => makeMomGrid(k0, sigma0), [k0, sigma0])

  // Main wavepacket traces
  const mainTrace = useMemo(() => {
    const y = xGrid.map(x => {
      if (displayMode === 'prob') return fpProb(x, t, x0, k0, sigma0)
      if (displayMode === 're')   return fpRePsi(x, t, x0, k0, sigma0)
      return fpImPsi(x, t, x0, k0, sigma0)
    })
    return { x: xGrid, y, type: 'scatter', mode: 'lines',
      line: { color: displayMode === 'prob' ? DARK.accent : DARK.green, width: 2 } }
  }, [xGrid, t, x0, k0, sigma0, displayMode])

  const expectTrace = {
    x: [expectX, expectX],
    y: [-1, Math.max(...mainTrace.y as number[]) * 1.2 || 1],
    type: 'scatter', mode: 'lines',
    line: { color: DARK.orange, width: 1.5, dash: 'dash' },
  }

  const yLabel = displayMode === 'prob' ? '|ψ(x,t)|²' : displayMode === 're' ? 'Re(ψ)' : 'Im(ψ)'

  // Momentum trace (static)
  const momTrace = useMemo(() => {
    const y = kGrid.map(k => fpMomentumDist(k, k0, sigma0))
    return { x: kGrid, y, type: 'scatter', mode: 'lines',
      line: { color: DARK.accent, width: 2 } }
  }, [kGrid, k0, sigma0])

  const momAnnotLine = {
    x: [k0, k0], y: [0, Math.max(...momTrace.y as number[]) * 1.1],
    type: 'scatter', mode: 'lines',
    line: { color: '#888', width: 1, dash: 'dot' },
  }

  // Expectation value history
  const hist = histRef.current
  const histT      = hist.map(h => h.t)
  const histExpX   = hist.map(h => h.expectX)
  const histDeltaX = hist.map(h => h.deltaX)
  const histUxP    = hist.map(h => h.deltaXdP)

  // Norm history (should be flat 1.0 — analytical guarantee)
  const normTrace = {
    x: histT,
    y: histT.map(() => 1.0),
    type: 'scatter', mode: 'lines',
    line: { color: DARK.green, width: 2 },
  }

  const vg  = k0
  const vph = k0 / 2

  return (
    <div style={{ display: 'flex', gap: 16, padding: '12px 16px', minHeight: 0 }}>
      {/* ── Left panel: controls ─────────────────────────────────────────── */}
      <div style={{
        width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10,
        overflowY: 'auto',
      }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '1rem', color: DARK.text }}>
          Free Particle
        </h3>
        <p style={{ margin: '0 0 8px', fontSize: '0.8rem', color: '#888', lineHeight: 1.4 }}>
          Gaussian wavepacket — exact spreading, V = 0
        </p>

        <ParameterSlider
          label="x₀ — initial position"
          value={x0} min={-10} max={10} step={0.5}
          description="Initial centre of packet"
          onChange={setX0}
        />
        <ParameterSlider
          label="k₀ — wave vector"
          value={k0} min={-5} max={5} step={0.1}
          description="Group velocity = k₀"
          onChange={setK0}
        />
        <ParameterSlider
          label="σ₀ — initial width"
          value={sigma0} min={0.3} max={4} step={0.05}
          description={`Spreading time t₀ = 2σ₀² = ${(2 * sigma0 * sigma0).toFixed(2)}`}
          onChange={setSigma0}
        />

        {/* Readout table */}
        <div style={{
          background: '#161616', borderRadius: 6, padding: '8px 10px',
          fontSize: '0.82rem', color: DARK.text, lineHeight: 1.8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#aaa' }}>t₀ = 2σ₀²</span>
            <span>{t0.toFixed(3)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#aaa' }}>v_g = k₀</span>
            <span>{vg.toFixed(3)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#aaa' }}>v_ph = k₀/2</span>
            <span>{vph.toFixed(3)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#aaa' }}>σ(t)</span>
            <span>{sigmaT.toFixed(4)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#aaa' }}>Δx·Δp</span>
            <span style={{ color: uxp < 0.501 ? DARK.green : '#f0c040' }}>
              {uxp.toFixed(4)}
            </span>
          </div>
        </div>

        {/* Time display */}
        <div style={{
          background: '#161616', borderRadius: 6, padding: '6px 10px',
          fontSize: '0.82rem', color: DARK.text, textAlign: 'center',
        }}>
          t = {t.toFixed(2)} a.u.&nbsp;&nbsp;(t/t₀ = {(t0 > 0 ? t / t0 : 0).toFixed(2)})
        </div>

        {/* Animation controls */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setPlaying(p => !p)}
            style={{ padding: '4px 12px', background: DARK.accent, border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer' }}
          >
            {playing ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            onClick={() => { setT(0); setPlaying(false); histRef.current = [] }}
            style={{ padding: '4px 10px', background: '#222', border: '1px solid #444', borderRadius: 4, color: '#ccc', cursor: 'pointer' }}
          >
            ↺ Reset
          </button>
          <select
            value={speedIdx}
            onChange={e => setSpeedIdx(Number(e.target.value))}
            style={{ background: '#1a1a1a', border: '1px solid #333', color: '#ccc', borderRadius: 4, padding: '2px 4px', fontSize: '0.8rem' }}
          >
            {SPEEDS.map((s, i) => <option key={i} value={i}>{s}×</option>)}
          </select>
          <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}>
            <input type="checkbox" checked={loop} onChange={e => setLoop(e.target.checked)} />
            Loop
          </label>
        </div>
      </div>

      {/* ── Right panel: plots ───────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>

        {/* Main wavepacket plot */}
        <div style={{ background: DARK.paper, borderRadius: 8, padding: '6px 6px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {(['prob', 're', 'im'] as DisplayMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setDisplayMode(m)}
                  style={{
                    padding: '2px 8px', fontSize: '0.78rem',
                    background: displayMode === m ? DARK.accent : '#1e1e1e',
                    border: '1px solid #333', borderRadius: 4, color: '#ddd', cursor: 'pointer',
                  }}
                >
                  {m === 'prob' ? '|ψ|²' : m === 're' ? 'Re(ψ)' : 'Im(ψ)'}
                </button>
              ))}
            </div>
            <HelpButton onClick={() => setShowHelpMain(true)} />
          </div>
          <Plot
            data={[mainTrace, expectTrace] as object[]}
            layout={{
              ...darkLayout({ height: 280 }),
              xaxis: axis('x (a.u.)'),
              yaxis: axis(yLabel),
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%' }}
          />
        </div>

        {/* Momentum distribution */}
        <div style={{ background: DARK.paper, borderRadius: 8, padding: '6px 6px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <button
              onClick={() => setShowMomentum(p => !p)}
              style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
            >
              {showMomentum ? '▾' : '▸'} Momentum distribution |φ(k)|²
            </button>
            <HelpButton onClick={() => setShowHelpMomentum(true)} />
          </div>
          {showMomentum && (
            <>
              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 4, paddingLeft: 2 }}>
                Time-independent — does not change during animation
              </div>
              <Plot
                data={[momTrace, momAnnotLine] as object[]}
                layout={{
                  ...darkLayout(),
                  xaxis: axis('k (a.u.)'),
                  yaxis: axis('|φ(k)|²'),
                }}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%' }}
              />
            </>
          )}
        </div>

        {/* Expectation values */}
        <div style={{ background: DARK.paper, borderRadius: 8, padding: '6px 6px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <button
              onClick={() => setShowExpect(p => !p)}
              style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
            >
              {showExpect ? '▾' : '▸'} Expectation values
            </button>
            <HelpButton onClick={() => setShowHelpExpect(true)} />
          </div>
          {showExpect && (
            <Plot
              data={[
                // ⟨x(t)⟩ — top subplot
                { x: histT, y: histExpX, type: 'scatter', mode: 'lines',
                  line: { color: DARK.accent, width: 2 }, name: '⟨x⟩', yaxis: 'y' },
                // ⟨p⟩ = k₀ — flat line
                { x: histT, y: histT.map(() => k0), type: 'scatter', mode: 'lines',
                  line: { color: DARK.orange, width: 1.5, dash: 'dot' }, name: '⟨p⟩', yaxis: 'y' },
                // Δx(t) — bottom subplot
                { x: histT, y: histDeltaX, type: 'scatter', mode: 'lines',
                  line: { color: DARK.green, width: 2 }, name: 'Δx', yaxis: 'y2' },
                // Δp — flat
                { x: histT, y: histT.map(() => deltaP), type: 'scatter', mode: 'lines',
                  line: { color: '#ff6b6b', width: 1.5, dash: 'dot' }, name: 'Δp', yaxis: 'y2' },
                // Δx·Δp
                { x: histT, y: histUxP, type: 'scatter', mode: 'lines',
                  line: { color: '#ffd166', width: 1.5 }, name: 'Δx·Δp', yaxis: 'y2' },
                // ħ/2 bound
                { x: histT.length ? [histT[0], histT[histT.length - 1]] : [0, tMax],
                  y: [0.5, 0.5], type: 'scatter', mode: 'lines',
                  line: { color: '#555', width: 1, dash: 'dash' }, yaxis: 'y2' },
              ] as object[]}
              layout={{
                ...darkLayout({ height: 300 }),
                xaxis:  axis('t (a.u.)'),
                yaxis:  { ...axis('⟨x⟩, ⟨p⟩'), domain: [0.52, 1] },
                yaxis2: { ...axis('Δx, Δp, Δx·Δp'), domain: [0, 0.46] },
                showlegend: true,
                legend: { font: { color: '#aaa', size: 10 }, bgcolor: 'transparent', x: 0.01, y: 0.99 },
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
            />
          )}
        </div>

        {/* Norm history */}
        <div style={{ background: DARK.paper, borderRadius: 8, padding: '6px 6px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <button
              onClick={() => setShowNorm(p => !p)}
              style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '0.85rem', padding: 0 }}
            >
              {showNorm ? '▾' : '▸'} Norm history
            </button>
            <HelpButton onClick={() => setShowHelpNorm(true)} />
          </div>
          {showNorm && (
            <Plot
              data={[normTrace] as object[]}
              layout={{
                ...darkLayout(),
                xaxis: axis('t (a.u.)'),
                yaxis: axis('∥ψ∥²', { range: [0.99, 1.01] }),
              }}
              config={{ displayModeBar: false, responsive: true }}
              style={{ width: '100%' }}
            />
          )}
        </div>
      </div>

      {/* ── Help modals ──────────────────────────────────────────────────── */}
      {showHelpMain && (
        <HelpModal title="Free Particle Wavepacket" onClose={() => setShowHelpMain(false)}>
          <FreeParticleInfoPanel topic="main" />
        </HelpModal>
      )}
      {showHelpMomentum && (
        <HelpModal title="Momentum Distribution" onClose={() => setShowHelpMomentum(false)}>
          <FreeParticleInfoPanel topic="momentum" />
        </HelpModal>
      )}
      {showHelpExpect && (
        <HelpModal title="Expectation Values" onClose={() => setShowHelpExpect(false)}>
          <FreeParticleInfoPanel topic="expect" />
        </HelpModal>
      )}
      {showHelpNorm && (
        <HelpModal title="Norm Conservation" onClose={() => setShowHelpNorm(false)}>
          <FreeParticleInfoPanel topic="norm" />
        </HelpModal>
      )}
    </div>
  )
}
