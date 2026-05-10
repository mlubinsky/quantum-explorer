import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import {
  wignerFock, wignerCoherent, wignerSqueezed, wignerCat, wignerFockSuper,
  computeWignerGrid, xMarginal, pMarginal, wignerNegativity,
} from '../physics/wigner'
import { hoWavefunction } from '../physics/harmonic'
import { WignerInfoPanel } from './WignerInfoPanel'

// ── Types ─────────────────────────────────────────────────────────────────────

type StateType = 'fock' | 'coherent' | 'squeezed' | 'cat-even' | 'cat-odd' | 'fock-super'

// ── Constants ─────────────────────────────────────────────────────────────────

const NX = 70, NP = 70          // heatmap grid resolution
const NX_SUPER = 40, NP_SUPER = 40   // coarser grid for Fock superposition

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
  const xCoh = alpha * Math.sqrt(2 / omega)
  const base = Math.sqrt((2 * Math.max(n, 1) + 1) / omega) * 1.6 + 1.5

  if (type === 'fock') {
    const xMax = base
    return { xMin: -xMax, xMax, pMin: -xMax * omega, pMax: xMax * omega }
  }
  if (type === 'coherent') {
    const xMax = xCoh + 4 / Math.sqrt(omega)
    const pMax = Math.sqrt(omega) * 4
    return { xMin: -xMax, xMax, pMin: -pMax, pMax }
  }
  if (type === 'squeezed') {
    const spread = Math.exp(r)
    const xMax = xCoh + spread * 4 / Math.sqrt(omega)
    const pMax = spread * Math.sqrt(omega) * 4
    return { xMin: -xMax, xMax, pMin: -pMax, pMax }
  }
  if (type === 'cat-even' || type === 'cat-odd') {
    const xMax = xCoh + 4 / Math.sqrt(omega)
    const pCat = 2 * xCoh * omega + 4 * Math.sqrt(omega)
    return { xMin: -xMax, xMax, pMin: -pCat, pMax: pCat }
  }
  // fock-super
  return { xMin: -base, xMax: base, pMin: -base * omega, pMax: base * omega }
}

// ── Main component ────────────────────────────────────────────────────────────

export function WignerExplorer() {
  const [stateType, setStateType] = useState<StateType>('fock')
  const [n, setN]           = useState(1)
  const [n2, setN2]         = useState(2)
  const [alpha, setAlpha]   = useState(2.0)
  const [omega, setOmega]   = useState(1.0)
  const [r, setR]           = useState(0.8)

  const [showMarginals, setShowMarginals] = useState(true)
  const [showHelp, setShowHelp] = useState(false)

  // ── Build Wigner function evaluator ────────────────────────────────────────

  const wignerFn = useMemo<(x: number, p: number) => number>(() => {
    const xCoh = alpha * Math.sqrt(2 / omega)
    switch (stateType) {
      case 'fock':
        return (x, p) => wignerFock(n, x, p, omega)
      case 'coherent':
        return (x, p) => wignerCoherent(x, p, xCoh, 0, omega)
      case 'squeezed':
        return (x, p) => wignerSqueezed(x, p, xCoh, 0, omega, r)
      case 'cat-even':
        return (x, p) => wignerCat(x, p, alpha, omega, 1)
      case 'cat-odd':
        return (x, p) => wignerCat(x, p, alpha, omega, -1)
      case 'fock-super':
        return (x, p) => wignerFockSuper(n, n2, x, p, omega)
    }
  }, [stateType, n, n2, alpha, omega, r])

  // ── Grid computation ────────────────────────────────────────────────────────

  const grid = useMemo(() => {
    const { xMin, xMax, pMin, pMax } = phaseSpaceRange(stateType, n, alpha, r, omega)
    const nx = stateType === 'fock-super' ? NX_SUPER : NX
    const np = stateType === 'fock-super' ? NP_SUPER : NP
    return computeWignerGrid(wignerFn, xMin, xMax, nx, pMin, pMax, np)
  }, [wignerFn, stateType, n, alpha, r, omega])

  const negativity = useMemo(() => wignerNegativity(grid), [grid])
  const xMarg = useMemo(() => showMarginals ? xMarginal(grid) : [], [grid, showMarginals])
  const pMarg = useMemo(() => showMarginals ? pMarginal(grid) : [], [grid, showMarginals])

  // exact |ψ(x)|² for Fock states, coherent (Gaussian), for comparison line
  const psi2Line = useMemo(() => {
    if (!showMarginals) return []
    return grid.xVals.map(x => {
      if (stateType === 'fock') return hoWavefunction(n, x, omega) ** 2
      if (stateType === 'fock-super') {
        const psi = (hoWavefunction(n, x, omega) + hoWavefunction(n2, x, omega)) / Math.SQRT2
        return psi * psi
      }
      return null
    }).filter((v): v is number => v !== null)
  }, [stateType, n, n2, omega, grid.xVals, showMarginals])

  // ── Heatmap ─────────────────────────────────────────────────────────────────

  const absMax = Math.max(Math.abs(grid.zMin), Math.abs(grid.zMax), 1e-9)
  const colorscale = [
    [0,    '#2166ac'],   // deep negative → blue
    [0.5,  '#f7f7f7'],   // zero          → white
    [1,    '#d6604d'],   // deep positive → red
  ]

  const heatmapTrace = {
    type: 'heatmap',
    x: grid.xVals, y: grid.pVals, z: grid.W,
    colorscale,
    zmin: -absMax, zmax: absMax,
    showscale: true,
    colorbar: {
      thickness: 12, len: 0.85,
      title: { text: 'W(x,p)', side: 'right' },
      tickfont: { color: '#aaa', size: 10 },
      titlefont: { color: '#aaa', size: 10 },
    },
    hovertemplate: 'x=%{x:.2f} p=%{y:.2f} W=%{z:.4f}<extra></extra>',
  }

  const heatmapLayout = {
    ...darkLayout({ height: 380 }),
    xaxis: axis('x (a.u.)'),
    yaxis: axis('p (a.u.)'),
    margin: { l: 55, r: 85, t: 28, b: 50 },
  }

  // ── Marginal traces ──────────────────────────────────────────────────────────

  const xMargTraces: object[] = showMarginals ? [
    { x: grid.xVals, y: xMarg, mode: 'lines',
      line: { color: DARK.accent, width: 2 }, name: '∫W dp (marginal)' },
    ...(psi2Line.length > 0 ? [{
      x: grid.xVals, y: psi2Line, mode: 'lines',
      line: { color: DARK.orange, width: 1.5, dash: 'dot' }, name: '|ψ(x)|² exact',
    }] : []),
  ] : []

  const pMargTraces: object[] = showMarginals ? [
    { x: grid.pVals, y: pMarg, mode: 'lines',
      line: { color: DARK.green, width: 2 }, name: '∫W dx (marginal)' },
  ] : []

  const xMargLayout = {
    ...darkLayout({ height: 180 }),
    xaxis: axis('x (a.u.)'),
    yaxis: axis('|ψ(x)|²'),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 10 } },
    margin: { l: 55, r: 20, t: 20, b: 45 },
  }

  const pMargLayout = {
    ...darkLayout({ height: 180 }),
    xaxis: axis('p (a.u.)'),
    yaxis: axis('|φ(p)|²'),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 10 } },
    margin: { l: 55, r: 20, t: 20, b: 45 },
  }

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
              ['coherent',  'Coherent |α⟩'],
              ['squeezed',  'Squeezed D(α)S(r)|0⟩'],
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
            onChange={setOmega} />

          {(stateType === 'fock' || stateType === 'fock-super') && (
            <ParameterSlider label={stateType === 'fock-super' ? '|n⟩' : 'Fock n'} value={n}
              min={0} max={6} step={1} digits={0} onChange={setN} />
          )}
          {stateType === 'fock-super' && (
            <ParameterSlider label="|m⟩" value={n2} min={0} max={6} step={1} digits={0} onChange={setN2} />
          )}
          {(stateType === 'coherent' || stateType === 'squeezed' || stateType === 'cat-even' || stateType === 'cat-odd') && (
            <ParameterSlider label="Displacement |α|" value={alpha} min={0} max={4} step={0.1}
              description="x₀ = α√(2/ω)" onChange={setAlpha} />
          )}
          {stateType === 'squeezed' && (
            <ParameterSlider label="Squeeze r" value={r} min={0} max={2} step={0.05}
              description="Δx = e^{-r}/√(2ω)" onChange={setR} />
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

          {/* Marginal toggle */}
          <button onClick={() => setShowMarginals(m => !m)} style={{
            marginTop: '0.8rem', width: '100%', padding: '0.3rem',
            border: '1px solid #333', borderRadius: 4, cursor: 'pointer',
            fontSize: '0.78rem', background: '#1a1a1a',
            color: showMarginals ? '#4361ee' : '#666',
          }}>
            {showMarginals ? '▾' : '▸'} Marginals
          </button>
        </div>

        {/* ── Plots ── */}
        <div style={{ flex: '1 1 400px', minWidth: 300 }}>

          {/* Phase-space heatmap */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#aaa', fontWeight: 600, marginBottom: 4 }}>
              W(x,p) — phase space
              {grid.zMin < -0.001 && (
                <span style={{ marginLeft: 8, fontSize: '0.72rem', color: '#ef233c' }}>
                  (negative regions = non-classical)
                </span>
              )}
            </div>
            <Plot
              data={[heatmapTrace as any]}
              layout={heatmapLayout as any}
              config={cfg}
              style={{ width: '100%' }}
            />
          </div>

          {/* Marginals */}
          {showMarginals && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px' }}>
                <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 2 }}>
                  x-marginal ∫W dp = |ψ(x)|²
                </div>
                <Plot
                  data={xMargTraces as any}
                  layout={xMargLayout as any}
                  config={cfg}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: '1 1 280px' }}>
                <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 2 }}>
                  p-marginal ∫W dx = |φ̃(p)|²
                </div>
                <Plot
                  data={pMargTraces as any}
                  layout={pMargLayout as any}
                  config={cfg}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

const tdL: React.CSSProperties = { color: '#aaa', paddingBottom: '0.25rem', fontSize: '0.8rem' }
const tdR: React.CSSProperties = { color: '#4361ee', textAlign: 'right', paddingBottom: '0.25rem', fontSize: '0.8rem' }
