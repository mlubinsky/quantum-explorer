import { useState, useMemo } from 'react'
import _Plot from 'react-plotly.js'
const Plot = (_Plot as any).default ?? _Plot

import { HelpButton, HelpModal } from './HelpModal'
import { ParameterSlider } from './ParameterSlider'
import {
  Statistics, isAllowed,
  twoParticleEnergy, singleParticleDensity, diagonalDensity,
  computeDensityGrid,
} from '../physics/twoParticleISW'
import { iswPsi } from '../physics/isw'
import { TwoParticleInfoPanel } from './TwoParticleInfoPanel'

// ── Constants ─────────────────────────────────────────────────────────────────

const NGRID  = 80   // heatmap resolution
const NLINE  = 300  // resolution for 1D plots

const DARK = {
  paper: '#0d0d0d', plot: '#111111', text: '#e0e0e0', grid: '#1e1e1e',
  dist: '#4361ee', boson: '#06d6a0', fermion: '#ef233c', orange: '#f77f00',
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

const STAT_LABELS: Record<Statistics, string> = {
  distinguishable: 'Distinguishable',
  bosons: 'Bosons',
  fermions: 'Fermions',
}

const STAT_COLORS: Record<Statistics, string> = {
  distinguishable: DARK.dist,
  bosons: DARK.boson,
  fermions: DARK.fermion,
}

// ── Main component ────────────────────────────────────────────────────────────

export function TwoParticleExplorer() {
  const [stat, setStat] = useState<Statistics>('fermions')
  const [m, setM]       = useState(1)
  const [n, setN]       = useState(2)
  const [L, setL]       = useState(10)

  const [showMarginal, setShowMarginal] = useState(true)
  const [showDiag,     setShowDiag]     = useState(true)
  const [showHelp,     setShowHelp]     = useState(false)

  const allowed = isAllowed(m, n, stat)
  // clamp to allowed state for display
  const mEff = m, nEff = n

  const energy = twoParticleEnergy(mEff, nEff, L)

  // ── 2D density grid ─────────────────────────────────────────────────────────

  const grid = useMemo(
    () => allowed ? computeDensityGrid(mEff, nEff, L, stat, NGRID)
                  : computeDensityGrid(mEff, nEff, L, 'bosons', NGRID),
    [mEff, nEff, L, stat, allowed],
  )

  // ── 1D line data ────────────────────────────────────────────────────────────

  const xs = useMemo(
    () => Array.from({ length: NLINE }, (_, i) => (i / (NLINE - 1)) * L),
    [L],
  )

  const marginalTraces = useMemo(() => {
    if (!showMarginal) return []
    return (['distinguishable', 'bosons', 'fermions'] as Statistics[]).map(s => ({
      x: xs,
      y: xs.map(x => singleParticleDensity(mEff, nEff, x, L, s)),
      mode: 'lines',
      line: { color: STAT_COLORS[s], width: s === stat ? 2.5 : 1, dash: s === stat ? 'solid' : 'dot' },
      name: STAT_LABELS[s],
    }))
  }, [xs, mEff, nEff, L, stat, showMarginal])

  const diagTraces = useMemo(() => {
    if (!showDiag) return []
    return (['distinguishable', 'bosons', 'fermions'] as Statistics[]).map(s => ({
      x: xs,
      y: xs.map(x => diagonalDensity(mEff, nEff, x, L, s)),
      mode: 'lines',
      line: { color: STAT_COLORS[s], width: s === stat ? 2.5 : 1, dash: s === stat ? 'solid' : 'dot' },
      name: STAT_LABELS[s],
    }))
  }, [xs, mEff, nEff, L, stat, showDiag])

  // reference: |ψₘ|² for comparing eigenfunctions to marginal
  const refPsi2Traces = useMemo(() => {
    if (!showMarginal) return []
    const pm2 = xs.map(x => iswPsi(mEff, L, x) ** 2)
    const pn2 = xs.map(x => iswPsi(nEff, L, x) ** 2)
    return [
      { x: xs, y: pm2, mode: 'lines', line: { color: '#888', width: 1, dash: 'dot' }, name: `|ψ_${mEff}|²` },
      ...(mEff !== nEff ? [{ x: xs, y: pn2, mode: 'lines', line: { color: '#555', width: 1, dash: 'dot' }, name: `|ψ_${nEff}|²` }] : []),
    ]
  }, [xs, mEff, nEff, L, showMarginal])

  // ── Heatmap ─────────────────────────────────────────────────────────────────

  const heatmapTrace = {
    type: 'heatmap',
    x: grid.xVals, y: grid.xVals, z: grid.grid,
    colorscale: 'Hot',
    reversescale: true,
    zmin: 0, zmax: grid.zMax,
    showscale: true,
    colorbar: {
      thickness: 12, len: 0.85,
      title: { text: '|Ψ|²', side: 'right' },
      tickfont: { color: '#aaa', size: 10 },
      titlefont: { color: '#aaa', size: 10 },
    },
    hovertemplate: 'x₁=%{x:.2f} x₂=%{y:.2f} |Ψ|²=%{z:.4f}<extra></extra>',
  }

  // diagonal annotation: x₁ = x₂ line
  const diagShape = {
    type: 'line', x0: 0, y0: 0, x1: L, y1: L,
    line: { color: 'rgba(255,255,255,0.5)', width: 1.5, dash: 'dot' },
  }

  const heatmapLayout = {
    ...darkLayout({ height: 390 }),
    xaxis: axis('x₁ (a.u.)', { range: [0, L] }),
    yaxis: axis('x₂ (a.u.)', { range: [0, L], scaleanchor: 'x', scaleratio: 1 }),
    margin: { l: 55, r: 85, t: 32, b: 55 },
    shapes: [diagShape],
    annotations: [{
      x: L * 0.85, y: L * 0.82, xref: 'x', yref: 'y',
      text: 'x₁=x₂', showarrow: false,
      font: { color: 'rgba(255,255,255,0.6)', size: 10 },
    }],
  }

  const marginalLayout = {
    ...darkLayout({ height: 200 }),
    xaxis: axis('x (a.u.)'),
    yaxis: axis('ρ(x)'),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 10 } },
    margin: { l: 55, r: 20, t: 20, b: 45 },
  }

  const diagLayout = {
    ...darkLayout({ height: 200 }),
    xaxis: axis('x (a.u.)'),
    yaxis: axis('|Ψ(x,x)|²'),
    showlegend: true,
    legend: { x: 0.02, y: 0.98, bgcolor: 'rgba(0,0,0,0)', font: { color: '#aaa', size: 10 } },
    margin: { l: 55, r: 20, t: 20, b: 45 },
  }

  const cfg = { displayModeBar: false, responsive: true }

  // ── Symmetry label for heatmap title ────────────────────────────────────────
  const symLabel =
    stat === 'bosons'         ? 'symmetric — Ψ(x₁,x₂) = +Ψ(x₂,x₁)' :
    stat === 'fermions'       ? 'antisymmetric — Ψ(x₁,x₂) = −Ψ(x₂,x₁)' :
                                'no symmetry requirement'

  return (
    <>
      {showHelp && (
        <HelpModal title="Two-Particle ISW" onClose={() => setShowHelp(false)}>
          <TwoParticleInfoPanel />
        </HelpModal>
      )}

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>

        {/* ── Controls ── */}
        <div style={{ flex: '0 0 220px', minWidth: 190 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Two-Particle ISW</h3>
            <HelpButton onClick={() => setShowHelp(true)} />
          </div>

          {/* Statistics */}
          <div style={{ marginBottom: '0.7rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '0.3rem' }}>Particle statistics</div>
            {(['distinguishable', 'bosons', 'fermions'] as Statistics[]).map(s => (
              <button key={s} onClick={() => setStat(s)} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '0.25rem 0.5rem', marginBottom: '0.2rem',
                border: '1px solid', borderRadius: 4,
                cursor: 'pointer', fontSize: '0.76rem',
                background:  stat === s ? STAT_COLORS[s] + '33' : '#1a1a1a',
                color:       stat === s ? STAT_COLORS[s]       : '#aaa',
                borderColor: stat === s ? STAT_COLORS[s]       : '#333',
              }}>{STAT_LABELS[s]}</button>
            ))}
          </div>

          {/* Pauli exclusion warning */}
          {!allowed && (
            <div style={{
              background: '#2a1010', border: '1px solid #5a2020', borderRadius: 4,
              padding: '0.4rem 0.5rem', fontSize: '0.76rem', color: '#ef233c',
              marginBottom: '0.6rem',
            }}>
              Pauli exclusion: m = n forbidden for fermions
            </div>
          )}

          <ParameterSlider label="Level m" value={m} min={1} max={5} step={1} digits={0}
            onChange={setM} />
          <ParameterSlider label="Level n" value={n} min={1} max={5} step={1} digits={0}
            onChange={setN} />
          <ParameterSlider label="Well width L" value={L} min={2} max={20} step={0.5} unit="a.u."
            onChange={setL} />

          {/* Readout */}
          <div style={{ borderTop: '1px solid #222', paddingTop: '0.6rem', marginTop: '0.4rem' }}>
            <table style={{ fontSize: '0.8rem', fontVariantNumeric: 'tabular-nums', width: '100%' }}>
              <tbody>
                <tr><td style={tdL}>E_m</td>
                    <td style={tdR}>{(twoParticleEnergy(mEff, mEff, L) / 2).toFixed(4)}</td></tr>
                <tr><td style={tdL}>E_n</td>
                    <td style={tdR}>{(twoParticleEnergy(nEff, nEff, L) / 2).toFixed(4)}</td></tr>
                <tr><td style={tdL}>E = E_m + E_n</td>
                    <td style={{ ...tdR, color: '#06d6a0' }}>{energy.toFixed(4)}</td></tr>
                <tr><td style={tdL}>State</td>
                    <td style={{ ...tdR, color: STAT_COLORS[stat], fontSize: '0.72rem' }}>
                      {allowed ? symLabel.split(' — ')[0] : 'forbidden'}
                    </td></tr>
              </tbody>
            </table>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.8rem' }}>
            <button onClick={() => setShowMarginal(v => !v)} style={toggleBtn(showMarginal)}>
              {showMarginal ? '▾' : '▸'} Marginal ρ(x)
            </button>
            <button onClick={() => setShowDiag(v => !v)} style={toggleBtn(showDiag)}>
              {showDiag ? '▾' : '▸'} Diagonal |Ψ(x,x)|²
            </button>
          </div>
        </div>

        {/* ── Plots ── */}
        <div style={{ flex: '1 1 400px', minWidth: 300 }}>

          {/* 2D density heatmap */}
          <div style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#aaa', fontWeight: 600, marginBottom: 4 }}>
              |Ψ(x₁,x₂)|² — {STAT_LABELS[stat]}
              <span style={{ marginLeft: 8, fontSize: '0.72rem', color: STAT_COLORS[stat] }}>
                {allowed ? symLabel : 'showing bosons (m=n forbidden for fermions)'}
              </span>
            </div>
            <Plot
              data={[heatmapTrace as any]}
              layout={heatmapLayout as any}
              config={cfg}
              style={{ width: '100%' }}
            />
          </div>

          {/* Single-particle marginal */}
          {showMarginal && (
            <div style={{ borderTop: '1px solid #222', paddingTop: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 4 }}>
                Single-particle density ρ(x) = ∫|Ψ(x,x₂)|²dx₂
                {mEff !== nEff && (
                  <span style={{ marginLeft: 6, color: '#555' }}>
                    — bosons = fermions (exchange integrates to 0)
                  </span>
                )}
              </div>
              <Plot
                data={[...marginalTraces, ...refPsi2Traces] as any}
                layout={{ ...marginalLayout, showlegend: true } as any}
                config={cfg}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Diagonal density */}
          {showDiag && (
            <div style={{ borderTop: '1px solid #222', paddingTop: '0.75rem' }}>
              <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 4 }}>
                Diagonal density |Ψ(x,x)|² — probability both particles at same position
              </div>
              <Plot
                data={diagTraces as any}
                layout={{ ...diagLayout, showlegend: true } as any}
                config={cfg}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const tdL: React.CSSProperties = { color: '#aaa', paddingBottom: '0.2rem', fontSize: '0.78rem' }
const tdR: React.CSSProperties = { color: '#4361ee', textAlign: 'right', paddingBottom: '0.2rem', fontSize: '0.78rem' }

function toggleBtn(active: boolean): React.CSSProperties {
  return {
    padding: '0.25rem 0.5rem', border: '1px solid #333', borderRadius: 4,
    cursor: 'pointer', fontSize: '0.78rem', background: '#1a1a1a', textAlign: 'left',
    color: active ? '#4361ee' : '#666',
  }
}
