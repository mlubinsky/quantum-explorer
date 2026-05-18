import { useState, useMemo, useEffect } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import { FourierInfoPanel } from './FourierInfoPanel'
import { fpProb, fpMomentumDist, fpRePsi, fpImPsi, fpDeltaP } from '../physics/freeParticle'
import { iswEigenstate, iswSigmaX } from '../physics/isw'
import { iswMomentumDist } from '../physics/momentumSpace'
import {
  chirpedRePsi, chirpedImPsi, chirpedDeltaK, chirpedFTMag2,
  gaussianDeltaX, gaussianDeltaK, iswDeltaK,
} from '../physics/fourier'
import { parseHash, getNumericParam, getIntParam, getStringParam, setUrlParams } from '../physics/urlState'

type FourierMode = 'gaussian' | 'chirped' | 'isw'
const FOURIER_MODES = ['gaussian', 'chirped', 'isw'] as const

const N_X = 500
const N_K = 500

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  blue: '#4361ee', orange: '#f77f00', green: '#06d6a0', red: '#ef233c',
}

function darkLayout(extra: Record<string, unknown> = {}) {
  return {
    paper_bgcolor: DARK.paper, plot_bgcolor: DARK.plot,
    font: { color: DARK.text, size: 12 },
    margin: { l: 60, r: 20, t: 36, b: 50 },
    height: 280,
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0.4)', font: { size: 10 } },
    ...extra,
  }
}

function axis(title: string, extra: Record<string, unknown> = {}) {
  return {
    title: { text: title, font: { color: '#aaa', size: 11 } },
    color: '#aaa', gridcolor: DARK.grid, zerolinecolor: '#333', ...extra,
  }
}

type DisplayMode = 'prob' | 're' | 'im'

export function FourierExplorer() {
  const initP = parseHash(window.location.hash).params

  const [mode, setMode] = useState<FourierMode>(() =>
    getStringParam(initP, 'mode', 'gaussian', FOURIER_MODES) as FourierMode
  )
  const [x0,    setX0]    = useState(() => getNumericParam(initP, 'x0',    0,    -10, 10))
  const [k0,    setK0]    = useState(() => getNumericParam(initP, 'k0',    1.0,  -5,  5))
  const [sigma, setSigma] = useState(() => getNumericParam(initP, 'sigma', 1.0,  0.2, 4))
  const [beta,  setBeta]  = useState(() => getNumericParam(initP, 'beta',  0,    -2,  2))
  const [n,     setN]     = useState(() => getIntParam    (initP, 'n',     1,    1,   8))
  const [L,     setL]     = useState(() => getNumericParam(initP, 'L',     10,   2,   20))

  const [display, setDisplay] = useState<DisplayMode>('prob')
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    setUrlParams({ mode, x0, k0, sigma, beta, n, L })
  }, [mode, x0, k0, sigma, beta, n, L])

  // ── Derived quantities ──────────────────────────────────────────────────────

  const { deltaX, deltaK, product } = useMemo(() => {
    if (mode === 'isw') {
      const dx = iswSigmaX(n, L)
      const dk = iswDeltaK(n, L)
      return { deltaX: dx, deltaK: dk, product: dx * dk }
    }
    if (mode === 'chirped') {
      const dx = gaussianDeltaX(sigma)
      const dk = chirpedDeltaK(sigma, beta)
      return { deltaX: dx, deltaK: dk, product: dx * dk }
    }
    const dx = gaussianDeltaX(sigma)
    const dk = gaussianDeltaK(sigma)
    return { deltaX: dx, deltaK: dk, product: dx * dk }
  }, [mode, sigma, beta, n, L])

  // ── Position plot data ──────────────────────────────────────────────────────

  const posData = useMemo(() => {
    if (mode === 'isw') {
      const { x, psi } = iswEigenstate(n, L, N_X)
      const prob = psi.map(p => p * p)
      return { x, prob, re: psi, im: psi.map(() => 0) }
    }
    // Gaussian or Chirped: symmetric range around x0
    const xHalf = Math.max(5 * sigma, 3)
    const xArr = Array.from({ length: N_X }, (_, i) => (x0 - xHalf) + (2 * xHalf * i) / (N_X - 1))
    if (mode === 'chirped') {
      return {
        x: xArr,
        prob: xArr.map(x => fpProb(x, 0, x0, k0, sigma)),
        re:   xArr.map(x => chirpedRePsi(x, x0, sigma, k0, beta)),
        im:   xArr.map(x => chirpedImPsi(x, x0, sigma, k0, beta)),
      }
    }
    return {
      x: xArr,
      prob: xArr.map(x => fpProb(x, 0, x0, k0, sigma)),
      re:   xArr.map(x => fpRePsi(x, 0, x0, k0, sigma)),
      im:   xArr.map(x => fpImPsi(x, 0, x0, k0, sigma)),
    }
  }, [mode, x0, k0, sigma, beta, n, L])

  // ── Momentum plot data ──────────────────────────────────────────────────────

  const momData = useMemo(() => {
    if (mode === 'isw') {
      const kMax = Math.max(5 * n * Math.PI / L, 8 / L)
      const k = Array.from({ length: N_K }, (_, i) => -kMax + (2 * kMax * i) / (N_K - 1))
      return { k, phi2: k.map(ki => iswMomentumDist(n, L, ki)) }
    }
    const sigmaK = mode === 'chirped' ? chirpedDeltaK(sigma, beta) : fpDeltaP(sigma)
    const kHalf = Math.abs(k0) + 5 * sigmaK
    const k = Array.from({ length: N_K }, (_, i) => (k0 - kHalf) + (2 * kHalf * i) / (N_K - 1))
    const phi2 = mode === 'chirped'
      ? k.map(ki => chirpedFTMag2(ki, sigma, k0, beta))
      : k.map(ki => fpMomentumDist(ki, k0, sigma))
    return { k, phi2 }
  }, [mode, k0, sigma, beta, n, L])

  // ── Position plot ───────────────────────────────────────────────────────────

  const posYdata = display === 'prob' ? posData.prob : display === 're' ? posData.re : posData.im
  const posYlabel = display === 'prob' ? '|ψ(x)|²' : display === 're' ? 'Re ψ(x)' : 'Im ψ(x)'
  const posColor = display === 'prob' ? DARK.blue : display === 're' ? DARK.orange : DARK.green

  const posTraces: object[] = [
    {
      x: posData.x, y: posYdata,
      type: 'scatter', mode: 'lines',
      name: posYlabel,
      line: { color: posColor, width: 2 },
      fill: display === 'prob' ? 'tozeroy' : 'none',
      fillcolor: display === 'prob' ? 'rgba(67,97,238,0.15)' : undefined,
    },
  ]

  // Δx bracket
  if (mode !== 'isw') {
    const yPeak = Math.max(...posData.prob)
    posTraces.push({
      x: [x0 - deltaX, x0 + deltaX],
      y: [yPeak * 0.6, yPeak * 0.6],
      type: 'scatter', mode: 'lines+markers',
      name: `Δx = ${deltaX.toFixed(3)}`,
      line: { color: DARK.orange, width: 2, dash: 'dot' },
      marker: { symbol: 'line-ns', size: 10, color: DARK.orange },
      showlegend: true,
    } as object)
  }

  const posLayout = {
    ...darkLayout(),
    xaxis: axis('x (a₀)'),
    yaxis: axis(posYlabel),
    title: { text: 'Position space', font: { color: '#888', size: 13 } },
  }

  // ── Momentum plot ───────────────────────────────────────────────────────────

  const momTraces: object[] = [
    {
      x: momData.k, y: momData.phi2,
      type: 'scatter', mode: 'lines',
      name: '|φ(k)|²',
      line: { color: DARK.green, width: 2 },
      fill: 'tozeroy',
      fillcolor: 'rgba(6,214,160,0.12)',
    },
  ]

  // Δk bracket (Gaussian/Chirped)
  if (mode !== 'isw') {
    const yPeakK = Math.max(...momData.phi2)
    momTraces.push({
      x: [k0 - deltaK, k0 + deltaK],
      y: [yPeakK * 0.6, yPeakK * 0.6],
      type: 'scatter', mode: 'lines+markers',
      name: `Δk = ${deltaK.toFixed(3)}`,
      line: { color: DARK.orange, width: 2, dash: 'dot' },
      marker: { symbol: 'line-ns', size: 10, color: DARK.orange },
    } as object)
  }

  // Bragg peak markers for ISW
  if (mode === 'isw') {
    const kn = n * Math.PI / L
    const yPeakK = Math.max(...momData.phi2)
    ;[-kn, kn].forEach(kp => {
      momTraces.push({
        x: [kp, kp], y: [0, yPeakK * 1.05],
        type: 'scatter', mode: 'lines',
        name: kp > 0 ? `+k${n} = ${kn.toFixed(2)}` : `−k${n}`,
        line: { color: DARK.red, width: 1, dash: 'dash' },
      } as object)
    })
  }

  const momLayout = {
    ...darkLayout(),
    xaxis: axis('k (a₀⁻¹)'),
    yaxis: axis('|φ(k)|²'),
    title: { text: 'Momentum space', font: { color: '#888', size: 13 } },
  }

  // ── Styles ──────────────────────────────────────────────────────────────────

  const modeBtn = (m: FourierMode, label: string) => (
    <button
      key={m}
      onClick={() => setMode(m)}
      style={{
        padding: '0.3rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer',
        border: '1px solid', borderRadius: 4,
        background: mode === m ? DARK.blue : '#1a1a2e',
        borderColor: mode === m ? DARK.blue : '#444',
        color: mode === m ? '#fff' : '#aaa',
      }}
    >
      {label}
    </button>
  )

  const displayBtn = (d: DisplayMode, label: string) => (
    <button
      key={d}
      onClick={() => setDisplay(d)}
      style={{
        padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer',
        border: '1px solid', borderRadius: 4,
        background: display === d ? '#2a2a3e' : 'transparent',
        borderColor: display === d ? '#666' : '#333',
        color: display === d ? '#e0e0e0' : '#666',
      }}
    >
      {label}
    </button>
  )

  const isAtMin = product <= 0.5 + 1e-9
  const readoutColor = isAtMin ? DARK.green : DARK.orange

  return (
    <>
      {showHelp && (
        <HelpModal title="Fourier Explorer — Physics Reference" onClose={() => setShowHelp(false)}>
          <FourierInfoPanel />
        </HelpModal>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* ── Controls ── */}
        <div style={{ width: 230, flexShrink: 0 }}>
          <div style={{ background: '#12122a', border: '1px solid #222', borderRadius: 6, padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: '#e0e0e0', fontWeight: 700, fontSize: '0.9rem' }}>Controls</span>
              <HelpButton onClick={() => setShowHelp(true)} />
            </div>

            {/* Mode selector */}
            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {modeBtn('gaussian', 'Gaussian')}
              {modeBtn('chirped',  'Chirped')}
              {modeBtn('isw',      'ISW')}
            </div>

            {/* Mode-specific sliders */}
            {mode !== 'isw' && <>
              <ParameterSlider label="x₀" value={x0}    min={-10} max={10}  step={0.1} unit="a₀" digits={1} onChange={setX0} />
              <ParameterSlider label="k₀" value={k0}    min={-5}  max={5}   step={0.1} unit="a₀⁻¹" digits={1} onChange={setK0} />
              <ParameterSlider label="σ"  value={sigma} min={0.2} max={4}   step={0.05} unit="a₀" digits={2} onChange={setSigma} />
            </>}
            {mode === 'chirped' &&
              <ParameterSlider label="β (chirp)" value={beta} min={-2} max={2} step={0.05} unit="a₀⁻²" digits={2} onChange={setBeta} />
            }
            {mode === 'isw' && <>
              <ParameterSlider label="n" value={n} min={1} max={8} step={1} unit="" digits={0} onChange={v => setN(Math.round(v))} />
              <ParameterSlider label="L" value={L} min={2} max={20} step={0.5} unit="a₀" digits={1} onChange={setL} />
            </>}

            {/* Display toggle (position plot) */}
            {mode !== 'isw' && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ color: '#666', fontSize: '0.75rem', marginBottom: '0.3rem' }}>Position display</div>
                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {displayBtn('prob', '|ψ|²')}
                  {displayBtn('re',   'Re ψ')}
                  {displayBtn('im',   'Im ψ')}
                </div>
              </div>
            )}

            {/* Uncertainty readout */}
            <div style={{ marginTop: '1rem', padding: '0.6rem', background: '#0d0d1a', borderRadius: 4, fontSize: '0.8rem' }}>
              <div style={{ color: '#888', marginBottom: '0.4rem', fontWeight: 600 }}>Uncertainty</div>
              <div style={{ color: '#ccc' }}>Δx = <span style={{ color: DARK.blue }}>{deltaX.toFixed(3)}</span> a₀</div>
              <div style={{ color: '#ccc' }}>Δk = <span style={{ color: DARK.green }}>{deltaK.toFixed(3)}</span> a₀⁻¹</div>
              <div style={{ color: '#ccc', marginTop: '0.3rem', borderTop: '1px solid #222', paddingTop: '0.3rem' }}>
                Δx·Δk = <span style={{ color: readoutColor, fontWeight: 700 }}>{product.toFixed(4)}</span>
                {'  '}<span style={{ color: readoutColor }}>{isAtMin ? '= ½ ✓' : '> ½'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Plots ── */}
        <div style={{ flex: 1, minWidth: 300 }}>
          <Plot
            data={posTraces}
            layout={posLayout}
            config={{ displayModeBar: false }}
            style={{ width: '100%' }}
          />
          <Plot
            data={momTraces}
            layout={momLayout}
            config={{ displayModeBar: false }}
            style={{ width: '100%', marginTop: '0.5rem' }}
          />
        </div>
      </div>
    </>
  )
}
